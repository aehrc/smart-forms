import React, { useState } from 'react';
import Container from '@mui/material/Container';
import { Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireService } from '../questionnaire/QuestionnaireService';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';
import QFormBody from './QFormBody';
import { QuestionnaireResponse } from '../questionnaireResponse/QuestionnaireResponseModel';

function QForm() {
  const questionnaire = new QuestionnaireService();
  const questionnaireResponse = new QuestionnaireResponseService(questionnaire);

  // State strictly used for showing visual updates
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

  if (qForm.item && qrForm.item) {
    return (
      <div>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Stack spacing={4} sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                  {questionnaire.title}
                </Typography>
                <QFormBody
                  qForm={qForm}
                  qrForm={qrForm}
                  onQrItemChange={(newQrForm) => {
                    setQrState({ ...qrState, item: [newQrForm] });
                    questionnaireResponse.updateForm(newQrForm);
                  }}></QFormBody>
              </Stack>
            </Grid>
            <Grid item xs={4}>
              {<pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>}
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
