import React, { useState } from 'react';
import Container from '@mui/material/Container';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireService } from '../questionnaire/QuestionnaireService';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';
import ClearIcon from '@mui/icons-material/Clear';
import QFormBody from './QFormBody';
import { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';

function QForm() {
  const questionnaire = new QuestionnaireService();
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
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <Stack spacing={1} sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                  {questionnaire.title}
                </Typography>

                <Button onClick={clearQuestionnaireResponseButton}>
                  Clear Responses
                  <ClearIcon sx={{ ml: 2 }} />
                </Button>
                <QFormBody
                  qForm={qForm}
                  qrForm={qrState.item[0]}
                  onQrItemChange={(newQrForm) => {
                    setQrState({ ...qrState, item: [newQrForm] });
                    questionnaireResponse.updateForm(newQrForm);
                  }}></QFormBody>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              {<pre>{JSON.stringify(qrState, null, 2)}</pre>}
            </Grid>
          </Grid>
        </Container>
      </div>
    );
  } else {
    return <div>Questionnaire is invalid.</div>;
  }
}

export default QForm;
