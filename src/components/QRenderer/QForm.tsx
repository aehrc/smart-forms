import React, { useEffect, useState } from 'react';
import { Divider, Stack, Typography } from '@mui/material';
import QFormBody from './QFormBody';
import { QuestionnaireResponse, QuestionnaireResponseItem, ValueSet } from 'fhir/r5';
import QFormBodyTabbed from './QFormBodyTabbed';
import { containsTabs, getIndexOfFirstTab } from '../../functions/TabFunctions';
import { cleanQrItem, evaluateCalculatedExpressions } from '../../functions/QrItemFunctions';
import { CalculatedExpression } from '../../interfaces/Interfaces';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import RendererDebugBar from './DebugComponents/RendererDebugBar';
import DisplayDebugQResponse from './DebugComponents/DisplayDebugQResponse';
import { saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import QRSavedSnackbar from './QRSavedSnackbar';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import SaveIcon from '@mui/icons-material/Save';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import { PreviewModeContext } from '../../custom-contexts/PreviewModeContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';

export const CalcExpressionContext = React.createContext<Record<string, CalculatedExpression>>({});
export const ContainedValueSetContext = React.createContext<Record<string, ValueSet>>({});

export const EnableWhenChecksContext = React.createContext<boolean>(true); // only for testing

function QForm() {
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const enableWhen = React.useContext(EnableWhenContext);
  const previewMode = React.useContext(PreviewModeContext);
  const fhirClient = React.useContext(LaunchContext).fhirClient;

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(
    questionnaireResponseProvider.questionnaireResponse
  );
  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);
  const [containedValueSets] = useState<Record<string, ValueSet>>(
    questionnaireProvider.containedValueSets
  );
  const [qrHasChanges, setQrHasChanges] = useState(false);

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

  // update QR state if QR is updated from the server
  // introduces two-way binding
  useEffect(() => {
    const updatedQResponse = questionnaireResponseProvider.questionnaireResponse;
    if (!updatedQResponse.item) return;

    const qrFormClean = cleanQrItem(updatedQResponse.item[0]);
    if (qrFormClean) {
      setQuestionnaireResponse({ ...updatedQResponse, item: [qrFormClean] });
    }
  }, [questionnaireResponseProvider.questionnaireResponse]);

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
    setQuestionnaireResponse(newQuestionnaireResponse);
    questionnaireResponseProvider.setQuestionnaireResponse(newQuestionnaireResponse);
    setQrHasChanges(true);
  }

  // only for testing
  function clearQResponse() {
    const clearQrForm: QuestionnaireResponseItem = {
      linkId: '715',
      text: 'MBS 715 Cleared',
      item: []
    };
    setQuestionnaireResponse({ ...questionnaireResponse, item: [clearQrForm] });
  }

  if (qForm.item && qrForm.item) {
    return (
      <CalcExpressionContext.Provider value={calculatedExpressions}>
        <ContainedValueSetContext.Provider value={containedValueSets}>
          <EnableWhenChecksContext.Provider value={enableWhenStatus}>
            <Stack spacing={2.5} sx={{ my: 2 }}>
              <Divider />

              {containsTabs(qForm.item) ? (
                <QFormBodyTabbed
                  qForm={qForm}
                  qrForm={qrForm}
                  indexOfFirstTab={getIndexOfFirstTab(qForm.item)}
                  onQrItemChange={(newQrForm) => onQrFormChange(newQrForm)}
                />
              ) : (
                <QFormBody
                  qForm={qForm}
                  qrForm={qrForm}
                  onQrItemChange={(newQrForm) => {
                    onQrFormChange(newQrForm);
                  }}></QFormBody>
              )}

              <Stack direction="row" spacing={2}>
                <RoundButton
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => previewMode.setIsPreviewMode(true)}>
                  Show Preview
                </RoundButton>

                {fhirClient ? (
                  <>
                    <RoundButton
                      variant="outlined"
                      disabled={!qrHasChanges}
                      startIcon={<SaveIcon />}
                      onClick={() => {
                        questionnaireResponseProvider.setQuestionnaireResponse(
                          questionnaireResponse
                        );
                        saveQuestionnaireResponse(fhirClient, questionnaireResponse)
                          .then(() => {
                            setQrHasChanges(false);
                          })
                          .catch((error) => console.log(error));
                      }}>
                      Save
                    </RoundButton>

                    <RoundButton
                      variant="outlined"
                      disabled={!qrHasChanges}
                      startIcon={<PublishIcon />}
                      onClick={() => {
                        questionnaireResponse.status = 'completed';
                        questionnaireResponseProvider.setQuestionnaireResponse(
                          questionnaireResponse
                        );
                        saveQuestionnaireResponse(fhirClient, questionnaireResponse)
                          .then(() => {
                            setQrHasChanges(false);
                          })
                          .catch((error) => console.log(error));
                      }}>
                      Submit
                    </RoundButton>
                  </>
                ) : (
                  <div>
                    <Typography fontSize={8}>
                      Save functionality not available as application is not connected to CMS
                    </Typography>
                  </div>
                )}
              </Stack>

              {hideQResponse ? null : (
                <DisplayDebugQResponse
                  questionnaire={questionnaire}
                  questionnaireResponse={questionnaireResponse}
                  clearQResponse={() => clearQResponse()}
                  batchResponse={questionnaireResponseProvider.batchResponse}
                />
              )}
            </Stack>
            <QRSavedSnackbar isDisplayed={!qrHasChanges} />
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
    return <div>Questionnaire is invalid.</div>;
  }
}

export default QForm;
