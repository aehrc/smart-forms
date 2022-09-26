import React, { useEffect, useState } from 'react';
import { Container, Box, Button, Divider, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import QFormBody from './QFormBody';
import { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import QItemBodyTabbed from './QFormBodyTabs';
import { containsTabs, getIndexOfFirstTab } from './functions/TabFunctions';
import { cleanQrItem } from './functions/QrItemFunctions';

interface Props {
  questionnaire: Questionnaire;
  qrResponse: QuestionnaireResponse;
}

// const questionnaireResponseProvider = new QuestionnaireResponseProvider();

function QForm(props: Props) {
  const { questionnaire, qrResponse } = props;

  // questionnaireResponseProvider.initializeFormItem(questionnaire.item[0]);

  const [questionnaireResponse, setQuestionnaireResponse] =
    useState<QuestionnaireResponse>(qrResponse);

  if (!questionnaire.item || !questionnaireResponse.item) return null;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  useEffect(() => {
    if (!qrResponse.item) return;

    const qrFormClean = cleanQrItem(qrResponse.item[0]);
    if (qrFormClean) {
      setQuestionnaireResponse({ ...qrResponse, item: [qrFormClean] });
    }
  }, [qrResponse]);

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
      <div>
        <Container maxWidth="lg">
          <Stack spacing={2.5} sx={{ my: 4 }}>
            <Typography variant="h4">{questionnaire.title}</Typography>
            <Divider />

            {containsTabs(qForm.item) ? (
              <QItemBodyTabbed
                qForm={qForm}
                qrForm={qrForm}
                indexOfFirstTab={getIndexOfFirstTab(qForm.item)}
                onQrItemChange={(newQrForm) => {
                  setQuestionnaireResponse({ ...questionnaireResponse, item: [newQrForm] });
                }}
              />
            ) : (
              <QFormBody
                qForm={qForm}
                qrForm={qrForm}
                onQrItemChange={(newQrForm) => {
                  setQuestionnaireResponse({ ...questionnaireResponse, item: [newQrForm] });
                }}></QFormBody>
            )}

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
              {<pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>}
            </Box>
          </Stack>
        </Container>
      </div>
    );
  } else {
    return <div>Questionnaire is invalid.</div>;
  }
}

export default QForm;
