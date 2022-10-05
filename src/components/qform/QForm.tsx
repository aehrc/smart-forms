import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Divider, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import QFormBody from './QFormBody';
import { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import QFormBodyTabbed from './QFormBodyTabbed';
import { containsTabs, getIndexOfFirstTab } from './functions/TabFunctions';
import { cleanQrItem, evaluateCalculatedExpressions } from './functions/QrItemFunctions';
import { QuestionnaireProvider } from './QuestionnaireProvider';
import { CalculatedExpression } from '../Interfaces';
import { EnableWhenContext } from './functions/EnableWhenContext';
import DebugBar from './DebugBar';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  qrResponse: QuestionnaireResponse;
}

export const CalcExpressionContext = React.createContext<Record<string, CalculatedExpression>>({});

export const EnableWhenChecksContext = React.createContext<boolean>(true); // only for testing

function QForm(props: Props) {
  const { questionnaireProvider, qrResponse } = props;
  const enableWhenContext = React.useContext(EnableWhenContext);

  const [questionnaireResponse, setQuestionnaireResponse] =
    useState<QuestionnaireResponse>(qrResponse);
  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);

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
  }

  // only for testing
  function clearQuestionnaireResponseButton() {
    const clearQrForm: QuestionnaireResponseItem = {
      linkId: '715-clear',
      text: 'MBS 715 Cleared',
      item: []
    };
    setQuestionnaireResponse({ ...questionnaireResponse, item: [clearQrForm] });
  }

  if (qForm.item && qrForm.item) {
    return (
      <CalcExpressionContext.Provider value={calculatedExpressions}>
        <EnableWhenChecksContext.Provider value={enableWhenStatus}>
          <Container maxWidth="lg">
            {/*only for testing*/}

            <Stack spacing={2.5} sx={{ my: 4 }}>
              <Typography variant="h4">{questionnaire.title}</Typography>
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

              {hideQResponse ? null : (
                <Box sx={{ pt: 6 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h5">Questionnaire Response</Typography>
                    <Button
                      variant="outlined"
                      onClick={clearQuestionnaireResponseButton}
                      sx={{ borderRadius: 20 }}>
                      Clear Responses
                      <ClearIcon sx={{ ml: 1 }} />
                    </Button>
                  </Stack>
                  <pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>
                </Box>
              )}
            </Stack>
          </Container>
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
