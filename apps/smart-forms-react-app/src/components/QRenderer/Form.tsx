import React, { useEffect, useState } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
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
import InvalidQuestionnaireOperationButtons from '../OperationButtons/InvalidQuestionnaireOperationButtons';

export const CalcExpressionContext = React.createContext<Record<string, CalculatedExpression>>({});
export const ContainedValueSetContext = React.createContext<Record<string, ValueSet>>({});

export const EnableWhenChecksContext = React.createContext<boolean>(true); // only for testing

interface Props {
  questionnaireResponse: QuestionnaireResponse;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  updateQuestionnaireResponse: (newQuestionnaireResponse: QuestionnaireResponse) => unknown;
  clearQuestionnaireResponse: (clearedQuestionnaireResponse: QuestionnaireResponse) => unknown;
}
function Form(props: Props) {
  const {
    questionnaireResponse,
    qrHasChanges,
    removeQrHasChanges,
    togglePreviewMode,
    updateQuestionnaireResponse,
    clearQuestionnaireResponse
  } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const enableWhen = React.useContext(EnableWhenContext);

  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);
  const [containedValueSets] = useState<Record<string, ValueSet>>(
    questionnaireProvider.containedValueSets
  );

  // states only for testing
  const [enableWhenStatus, setEnableWhenStatus] = React.useState(true);
  const [hideQResponse, setHideQResponse] = React.useState(true);

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

  console.log('qFor---------------------m');
  console.log(qForm);
  if (qForm.item && qrForm.item) {
    return (
      <CalcExpressionContext.Provider value={calculatedExpressions}>
        <ContainedValueSetContext.Provider value={containedValueSets}>
          <EnableWhenChecksContext.Provider value={enableWhenStatus}>
            <Grid container>
              <SideBarGrid item lg={1.75}>
                <SideBar>
                  <RendererOperationButtons
                    qrHasChanges={qrHasChanges}
                    removeQrHasChanges={removeQrHasChanges}
                    togglePreviewMode={togglePreviewMode}
                    questionnaireResponse={questionnaireResponse}
                  />
                </SideBar>
              </SideBarGrid>
              <MainGrid item lg={10.25}>
                <MainGridContainerBox gap={2}>
                  <Typography fontWeight="bold" fontSize={36}>
                    {questionnaire.title}
                  </Typography>
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
                      indexOfFirstTab={getIndexOfFirstTab(qForm.item)}
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
    return (
      <Grid container>
        <SideBarGrid item lg={1.75}>
          <SideBar>
            <InvalidQuestionnaireOperationButtons
              qrHasChanges={qrHasChanges}
              removeQrHasChanges={removeQrHasChanges}
              questionnaireResponse={questionnaireResponse}
            />
          </SideBar>
        </SideBarGrid>
        <MainGrid item lg={10.25}>
          <MainGridContainerBox gap={2}>
            <Typography fontSize={24}>Questionnaire does not have a form item.</Typography>
            <ChipBar>
              <InvalidQuestionnaireOperationButtons
                isChip={true}
                qrHasChanges={qrHasChanges}
                removeQrHasChanges={removeQrHasChanges}
                questionnaireResponse={questionnaireResponse}
              />
            </ChipBar>
          </MainGridContainerBox>
        </MainGrid>
      </Grid>
    );
  }
}

export default Form;
