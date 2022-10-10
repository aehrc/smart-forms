import React, { useEffect, useState } from 'react';
import { Box, Card, Container, Grid } from '@mui/material';
import {
  getQResponsesFromBundle,
  getQuestionnairesFromBundle,
  loadQuestionnaireResponsesFromServer,
  loadQuestionnairesFromServer
} from '../qform/functions/LoadServerResourceFunctions';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import { QuestionnaireProvider } from '../qform/QuestionnaireProvider';
import QuestionnaireResponsePickerForm from './QuestionnaireResponsePickerForm';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
}

function QuestionnairePicker(props: Props) {
  const { questionnaireProvider } = props;
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [qResponses, setQResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQResponse, setSelectedQResponse] = useState<QuestionnaireResponse | null>(null);

  useEffect(() => {
    loadQuestionnairesFromServer()
      .then((bundle) => {
        if (bundle.entry) {
          setQuestionnaires(getQuestionnairesFromBundle(bundle));
        }
      })
      .catch((error) => console.log(error));
  }, []);

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];

    if (!selectedQuestionnaire.id) return null;

    loadQuestionnaireResponsesFromServer(selectedQuestionnaire.id)
      .then((bundle) => {
        if (bundle.entry) {
          setQResponses(getQResponsesFromBundle(bundle));
        }
      })
      .catch((error) => console.log(error));
  }

  function selectQResponseByIndex(index: number) {
    const selectedQResponse = qResponses[index];

    if (selectedQResponse.id) {
      setSelectedQResponse(selectedQResponse);
    }
  }

  return (
    <Container maxWidth="lg">
      <Card elevation={1} sx={{ mt: 10 }}>
        <Box display="flex" flexDirection="column" minHeight="82.5vh" sx={{ p: 8 }}>
          <Grid container spacing={8}>
            <Grid item xs={6}>
              <QuestionnairePickerForm
                questionnaires={questionnaires}
                questionnaireProvider={questionnaireProvider}
                onSelectedIndexChange={selectQuestionnaireByIndex}
              />
            </Grid>

            <Grid item xs={6}>
              {qResponses.length !== 0 ? (
                <QuestionnaireResponsePickerForm
                  questionnaireResponses={qResponses}
                  onSelectedIndexChange={selectQResponseByIndex}
                />
              ) : null}
            </Grid>
          </Grid>
        </Box>
      </Card>

      {selectedQResponse ? (
        <Card elevation={1} sx={{ my: 20 }}>
          <Box minHeight="80vh" sx={{ p: 8 }}>
            <pre>{JSON.stringify(selectedQResponse, null, 2)}</pre>
          </Box>
        </Card>
      ) : null}
    </Container>
  );
}

export default QuestionnairePicker;
