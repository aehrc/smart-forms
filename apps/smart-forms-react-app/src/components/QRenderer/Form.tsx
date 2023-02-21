/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useState } from 'react';
import { Divider, Grid } from '@mui/material';
import { Coding, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import FormBodyTabbed from './FormBodyTabbed';
import { containsTabs } from '../../functions/TabFunctions';
import RendererDebugBar from '../DebugComponents/RendererDebugBar';
import DisplayDebugQResponse from '../DebugComponents/DisplayDebugQResponse';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import SideBar from '../SideBar/SideBar';
import ChipBar from '../ChipBar/ChipBar';
import RendererOperationButtons from '../OperationButtons/RendererOperationButtons';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import FormBodyInvalid from './FormBodyInvalid';
import { MainGridHeadingTypography } from '../StyledComponents/Typographys.styles';
import QTitle from './QFormComponents/QItemParts/QTitle';
import { SideBarContext } from '../../custom-contexts/SideBarContext';
import QItemGroup from './QFormComponents/QItemGroup';
import { CalculatedExpressionContext } from '../../custom-contexts/CalculatedExpressionContext';

export const PreprocessedValueSetContext = React.createContext<Record<string, Coding[]>>({});

interface Props {
  questionnaireResponse: QuestionnaireResponse;
  currentTabIndex: number;
  qrHasChanges: boolean;
  setCurrentTabIndex: (newTabIndex: number) => unknown;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  updateQuestionnaireResponse: (newQuestionnaireResponse: QuestionnaireResponse) => unknown;
  clearQuestionnaireResponse: (clearedQuestionnaireResponse: QuestionnaireResponse) => unknown;
}
function Form(props: Props) {
  const {
    questionnaireResponse,
    currentTabIndex,
    qrHasChanges,
    setCurrentTabIndex,
    removeQrHasChanges,
    togglePreviewMode,
    updateQuestionnaireResponse,
    clearQuestionnaireResponse
  } = props;

  const { updateCalculatedExpressions } = useContext(CalculatedExpressionContext);
  const { sideBarIsExpanded } = useContext(SideBarContext);

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const [preprocessedValueSetCodings] = useState<Record<string, Coding[]>>(
    questionnaireProvider.preprocessedValueSetCodings
  );

  // These states below are only for debugging purposes
  const [hideQResponse, setHideQResponse] = useState(true);

  let qrForm: QuestionnaireResponseItem = {
    linkId: ''
  };

  useEffect(() => {
    enableWhenContext.setItems(questionnaireProvider.enableWhenItems, qrForm);
  }, []);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !questionnaireResponse.item) return <FormBodyInvalid />;

  const qForm = questionnaire.item[0];
  qrForm = questionnaireResponse.item[0];

  function onQrFormChange(newQrForm: QuestionnaireResponseItem) {
    const newQuestionnaireResponse = {
      ...questionnaireResponse,
      item: [newQrForm]
    };

    updateCalculatedExpressions(questionnaireResponse, questionnaireProvider.variables);

    questionnaireResponseProvider.setQuestionnaireResponse(newQuestionnaireResponse);
    updateQuestionnaireResponse(newQuestionnaireResponse);
  }

  if (qForm.item && qrForm.item) {
    return (
      <PreprocessedValueSetContext.Provider value={preprocessedValueSetCodings}>
        <Grid container>
          <SideBarGrid item xs={12} lg={sideBarIsExpanded ? 1.75 : 0.5}>
            <SideBar>
              <RendererOperationButtons
                qrHasChanges={qrHasChanges}
                removeQrHasChanges={removeQrHasChanges}
                togglePreviewMode={togglePreviewMode}
                questionnaireResponse={questionnaireResponse}
              />
            </SideBar>
          </SideBarGrid>
          <MainGrid item xs={12} lg={sideBarIsExpanded ? 10.25 : 11.5}>
            <MainGridContainerBox>
              <MainGridHeadingTypography variant="h1" data-test="renderer-heading">
                <QTitle questionnaire={questionnaire} />
              </MainGridHeadingTypography>
              <ChipBar>
                <RendererOperationButtons
                  isChip={true}
                  qrHasChanges={qrHasChanges}
                  removeQrHasChanges={removeQrHasChanges}
                  togglePreviewMode={togglePreviewMode}
                  questionnaireResponse={questionnaireResponse}
                />
              </ChipBar>
              <Divider light />
              {containsTabs(qForm.item) ? (
                <FormBodyTabbed
                  qForm={qForm}
                  qrForm={qrForm}
                  currentTabIndex={currentTabIndex}
                  setCurrentTabIndex={setCurrentTabIndex}
                  onQrItemChange={(newQrForm) => onQrFormChange(newQrForm)}
                />
              ) : (
                // If form is untabbed, it is rendered as a regular group
                <QItemGroup
                  qItem={qForm}
                  qrItem={qrForm}
                  groupCardElevation={1}
                  onQrItemChange={(newQrForm) => onQrFormChange(newQrForm)}
                  isRepeated={false}
                />
              )}

              {/*<BackToTopButton>*/}
              {/*  <Fab>*/}
              {/*    <KeyboardArrowUpIcon />*/}
              {/*  </Fab>*/}
              {/*</BackToTopButton>*/}
            </MainGridContainerBox>
          </MainGrid>
        </Grid>

        {hideQResponse ? null : (
          <DisplayDebugQResponse
            questionnaire={questionnaire}
            questionnaireResponse={questionnaireResponse}
            clearQResponse={() => {
              const clearQrForm: QuestionnaireResponseItem = {
                linkId: '715',
                text: 'MBS 715 Cleared',
                item: []
              };
              clearQuestionnaireResponse({
                ...questionnaireResponse,
                item: [clearQrForm]
              });
            }}
            batchResponse={questionnaireResponseProvider.batchResponse}
          />
        )}
        <RendererDebugBar
          hideQResponse={hideQResponse}
          toggleHideQResponse={(checked) => setHideQResponse(checked)}
        />
      </PreprocessedValueSetContext.Provider>
    );
  } else {
    return <FormBodyInvalid />;
  }
}

export default Form;
