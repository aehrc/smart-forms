import React from 'react';
import Container from '@mui/material/Container';
import { Stack, Typography } from '@mui/material';
import QItems from './QItems';
import { QuestionnaireReader } from '../questionnaire/QuestionnaireReader';

function QForm() {
  const questionnaireReader = new QuestionnaireReader();
  questionnaireReader.printJson();
  const questionnaireItems = questionnaireReader.questionnaire.items;

  return (
    <div>
      <Container>
        <Stack spacing={4} sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            MBS715
          </Typography>

          <QItems items={questionnaireItems}></QItems>
        </Stack>
      </Container>
    </div>
  );
}

export default QForm;
