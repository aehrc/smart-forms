import React, { useState } from 'react';
import { Container, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { QuestionnaireService } from './QuestionnaireService';
import { QuestionnaireResponseService } from './QuestionnaireResponseService';
import ClearIcon from '@mui/icons-material/Clear';
import QFormBody from './QFormBody';
import { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import QItemBodyTabbed from './QFormBodyTabs';
import { containsTabs, getIndexOfFirstTab } from './functions/TabFunctions';

interface Props {
  questionnaire: QuestionnaireService;
}

function QForm(props: Props) {
  const { questionnaire } = props;

  const questionnaireResponse = new QuestionnaireResponseService(questionnaire);

  const [qrState, setQrState] = useState<QuestionnaireResponse>({
    resourceType: questionnaireResponse.resourceType,
    status: questionnaireResponse.status,
    subject: questionnaireResponse.subject,
    authored: questionnaireResponse.authored,
    author: questionnaireResponse.author,
    item: questionnaireResponse.item
  });

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  function clearQuestionnaireResponseButton() {
    const clearQrForm: QuestionnaireResponseItem = {
      linkId: '715-clear',
      text: 'MBS 715 Cleared',
      item: []
    };
    setQrState({ ...qrState, item: [clearQrForm] });
    questionnaireResponse.updateForm(clearQrForm);
  }

  if (qForm.item && qrForm.item && qrState.item) {
    return (
      <div>
        <Container maxWidth="lg">
          <Stack spacing={2.5} sx={{ my: 4 }}>
            <Typography variant="h4">{questionnaire.title}</Typography>
            <Divider />

            {containsTabs(qForm.item) ? (
              <QItemBodyTabbed
                qForm={qForm}
                qrForm={qrState.item[0]}
                indexOfFirstTab={getIndexOfFirstTab(qForm.item)}
                onQrItemChange={(newQrForm) => {
                  setQrState({ ...qrState, item: [newQrForm] });
                  questionnaireResponse.updateForm(newQrForm);
                }}
              />
            ) : (
              <QFormBody
                qForm={qForm}
                qrForm={qrState.item[0]}
                onQrItemChange={(newQrForm) => {
                  setQrState({ ...qrState, item: [newQrForm] });
                  questionnaireResponse.updateForm(newQrForm);
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
              {<pre>{JSON.stringify(qrState, null, 2)}</pre>}
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
