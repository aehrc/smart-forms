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
import { QuestionnaireResponse, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';
import FormBodyTabbed from './FormBodyTabbed';
import { containsTabs, getIndexOfFirstTab } from '../../functions/TabFunctions';
import { evaluateCalculatedExpressions } from '../../functions/QrItemFunctions';
import { CalculatedExpression } from '../../interfaces/Interfaces';
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

export const CalcExpressionContext = React.createContext<Record<string, CalculatedExpression>>({});
export const ContainedValueSetContext = React.createContext<Record<string, ValueSet>>({});

export const EnableWhenChecksContext = React.createContext<boolean>(true); // only for testing

interface Props {
  questionnaireResponse: QuestionnaireResponse;
  tabIndex: number | null;
  qrHasChanges: boolean;
  setTabIndex: (newTabIndex: number) => unknown;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  updateQuestionnaireResponse: (newQuestionnaireResponse: QuestionnaireResponse) => unknown;
  clearQuestionnaireResponse: (clearedQuestionnaireResponse: QuestionnaireResponse) => unknown;
}
function Form(props: Props) {
  const {
    questionnaireResponse,
    tabIndex,
    qrHasChanges,
    setTabIndex,
    removeQrHasChanges,
    togglePreviewMode,
    updateQuestionnaireResponse,
    clearQuestionnaireResponse
  } = props;
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const enableWhen = useContext(EnableWhenContext);
  const sideBar = useContext(SideBarContext);

  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);
  const [containedValueSets] = useState<Record<string, ValueSet>>(
    questionnaireProvider.containedValueSets
  );

  // These states below are only for debugging purposes
  const [enableWhenStatus, setEnableWhenStatus] = useState(true);
  const [hideQResponse, setHideQResponse] = useState(true);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !questionnaireResponse.item) return <FormBodyInvalid />;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  useEffect(() => {
    enableWhen.setItems(questionnaireProvider.enableWhenItems, qrForm);
  }, []);

  function onQrFormChange(newQrForm: QuestionnaireResponseItem) {
    const newQuestionnaireResponse = {
      ...questionnaireResponse,
      item: [newQrForm]
    };
    const updatedCalculatedExpressions = evaluateCalculatedExpressions(
      questionnaire,
      questionnaireResponse,
      questionnaireProvider.variables,
      calculatedExpressions
    );

    if (updatedCalculatedExpressions) {
      setCalculatedExpressions(updatedCalculatedExpressions);
    }
    questionnaireResponseProvider.setQuestionnaireResponse(newQuestionnaireResponse);
    updateQuestionnaireResponse(newQuestionnaireResponse);
  }

  if (qForm.item && qrForm.item) {
    return (
      <CalcExpressionContext.Provider value={calculatedExpressions}>
        <ContainedValueSetContext.Provider value={containedValueSets}>
          <EnableWhenChecksContext.Provider value={enableWhenStatus}>
            <Grid container>
              <SideBarGrid item xs={12} lg={sideBar.isExpanded ? 1.75 : 0.5}>
                <SideBar>
                  <RendererOperationButtons
                    qrHasChanges={qrHasChanges}
                    removeQrHasChanges={removeQrHasChanges}
                    togglePreviewMode={togglePreviewMode}
                    questionnaireResponse={questionnaireResponse}
                  />
                </SideBar>
              </SideBarGrid>
              <MainGrid item xs={12} lg={sideBar.isExpanded ? 10.25 : 11.5}>
                <MainGridContainerBox>
                  <MainGridHeadingTypography variant="h6">
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
                      tabIndex={tabIndex ?? getIndexOfFirstTab(qForm.item)}
                      setTabIndex={setTabIndex}
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
              enableWhenStatus={enableWhenStatus}
              toggleEnableWhenStatus={(checked) => setEnableWhenStatus(checked)}
            />
          </EnableWhenChecksContext.Provider>
        </ContainedValueSetContext.Provider>
      </CalcExpressionContext.Provider>
    );
  } else {
    return <FormBodyInvalid />;
  }
}

export default Form;
