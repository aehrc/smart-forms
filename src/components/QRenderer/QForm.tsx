import React, { useEffect, useState } from 'react';
import { Button, Divider, Stack, Typography } from '@mui/material';
import QFormBody from './QFormBody';
import { Bundle, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import QFormBodyTabbed from './QFormBodyTabbed';
import { containsTabs, getIndexOfFirstTab } from '../../functions/TabFunctions';
import { cleanQrItem, evaluateCalculatedExpressions } from '../../functions/QrItemFunctions';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { CalculatedExpression } from '../../interfaces/Interfaces';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import DebugBar from './DebugComponents/DebugBar';
import DisplayDebugQResponse from './DebugComponents/DisplayDebugQResponse';
import { saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import QRSavedSnackbar from './QRSavedSnackbar';
import { FhirClientContext } from '../../custom-contexts/FhirClientContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  qrResponse: QuestionnaireResponse;
  batchResponse: Bundle | null; // only for testing
}

export const CalcExpressionContext = React.createContext<Record<string, CalculatedExpression>>({});

export const EnableWhenChecksContext = React.createContext<boolean>(true); // only for testing

function QForm(props: Props) {
  const { questionnaireProvider, qrResponse, batchResponse } = props;
  const enableWhenContext = React.useContext(EnableWhenContext);
  const fhirClient = React.useContext(FhirClientContext).fhirClient;

  const [questionnaireResponse, setQuestionnaireResponse] =
    useState<QuestionnaireResponse>(qrResponse);
  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);
  const [qrHasChanges, setQrHasChanges] = useState(false);

  // states only for testing
  const [enableWhenStatus, setEnableWhenStatus] = React.useState(true);
  const [hideQResponse, setHideQResponse] = React.useState(true);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !questionnaireResponse.item) return null;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  useEffect(() => {
    enableWhenContext.setItems(questionnaireProvider.enableWhenItems, qrForm);
  }, []);

  useEffect(() => {
    if (!qrResponse.item) return;

    const qrFormClean = cleanQrItem(qrResponse.item[0]);
    if (qrFormClean) {
      setQuestionnaireResponse({ ...qrResponse, item: [qrFormClean] });
    }
  }, [qrResponse]);

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

            {fhirClient ? (
              <Button
                variant="outlined"
                disabled={!qrHasChanges}
                onClick={() => {
                  saveQuestionnaireResponse(fhirClient, questionnaireResponse)
                    .then((response) => {
                      setQrHasChanges(false);
                      console.log(response);
                    })
                    .catch((error) => console.log(error));
                }}>
                Save
              </Button>
            ) : (
              <div>
                <Typography>
                  Save functionality not available as application is not connected to CMS
                </Typography>
              </div>
            )}

            {hideQResponse ? null : (
              <DisplayDebugQResponse
                questionnaire={questionnaire}
                questionnaireResponse={questionnaireResponse}
                clearQResponse={() => clearQResponse()}
                batchResponse={batchResponse}
              />
            )}
          </Stack>
          <QRSavedSnackbar isDisplayed={!qrHasChanges} />
          <DebugBar
            hideQResponse={hideQResponse}
            toggleHideQResponse={(checked) => setHideQResponse(checked)}
            enableWhenStatus={enableWhenStatus}
            toggleEnableWhenStatus={(checked) => setEnableWhenStatus(checked)}
          />
        </EnableWhenChecksContext.Provider>
      </CalcExpressionContext.Provider>
    );
  } else {
    return <div>Questionnaire is invalid.</div>;
  }
}

export default QForm;
