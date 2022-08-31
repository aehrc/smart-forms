import React, { useState } from 'react';
import Container from '@mui/material/Container';
import { Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireService } from '../questionnaire/QuestionnaireService';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';
import { Questionnaire, QuestionnaireItem } from '../questionnaire/QuestionnaireModel';

function QForm() {
  const qService = new QuestionnaireService();
  const qrService = new QuestionnaireResponseService();

  const [qResponse, setQResponse] = useState(qrService.questionnaireResponse);
  const questionnaire: Questionnaire = qService.questionnaire;

  return (
    <div>
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Stack spacing={4} sx={{ my: 4 }}>
              <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                {questionnaire.title}
              </Typography>
              {questionnaire.item.map((item: QuestionnaireItem) => {
                return <div key={item.linkId}>{/*TODO insert QGroup*/}</div>;
              })}
            </Stack>
          </Grid>
          <Grid item xs={4}>
            {<pre>{JSON.stringify(qResponse, null, 2)}</pre>}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default QForm;
