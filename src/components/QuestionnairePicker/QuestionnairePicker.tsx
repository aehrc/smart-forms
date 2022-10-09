import React, { useEffect, useState } from 'react';
import { Box, Card, Container, Grid, Typography } from '@mui/material';
import {
  getQuestionnairesFromBundle,
  loadQuestionnairesFromServer
} from '../qform/functions/LoadQuestionnaireFunctions';
import { Questionnaire } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import { QuestionnaireProvider } from '../qform/QuestionnaireProvider';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
}

function QuestionnairePicker(props: Props) {
  const { questionnaireProvider } = props;
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  useEffect(() => {
    loadQuestionnairesFromServer()
      .then((bundle) => {
        if (bundle.entry) {
          setQuestionnaires(getQuestionnairesFromBundle(bundle));
        }
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="85vh">
            <Typography variant="h2" fontSize={64} fontWeight="bold" sx={{ mb: 3 }}>
              Questionnaire Picker
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={7}>
          <Card elevation={1} sx={{ my: 15, mx: 6 }}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              minHeight="65vh"
              sx={{ p: 8 }}>
              <QuestionnairePickerForm
                questionnaires={questionnaires}
                questionnaireProvider={questionnaireProvider}></QuestionnairePickerForm>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default QuestionnairePicker;
