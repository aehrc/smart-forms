import React, { useContext, useEffect, useState } from 'react';
import { Box, Divider, Grid } from '@mui/material';
import FormBodyUntabbed from './FormBodyUntabbed';
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

  // states only for testing
  const [enableWhenStatus, setEnableWhenStatus] = useState(true);
  const [hideQResponse, setHideQResponse] = useState(true);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !questionnaireResponse.item) return null;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  useEffect(() => {
    enableWhen.setItems(questionnaireProvider.enableWhenItems, qrForm);
  }, []);

  function onQrFormChange(newQrForm: QuestionnaireResponseItem) {
    const newQuestionnaireResponse = { ...questionnaireResponse, item: [newQrForm] };
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
                  <MainGridHeadingTypography variant="h1">
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
                    <FormBodyUntabbed
                      qForm={qForm}
                      qrForm={qrForm}
                      onQrItemChange={(newQrForm) => {
                        onQrFormChange(newQrForm);
                      }}></FormBodyUntabbed>
                  )}

                  <Box sx={{ pb: 2 }}>
                    <ChipBar>
                      <RendererOperationButtons
                        isChip={true}
                        qrHasChanges={qrHasChanges}
                        removeQrHasChanges={removeQrHasChanges}
                        togglePreviewMode={togglePreviewMode}
                        questionnaireResponse={questionnaireResponse}
                      />
                    </ChipBar>
                  </Box>
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
                  clearQuestionnaireResponse({ ...questionnaireResponse, item: [clearQrForm] });
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
