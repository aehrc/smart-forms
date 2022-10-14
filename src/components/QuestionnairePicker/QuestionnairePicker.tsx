import React, { useEffect, useState } from 'react';
import { Box, Card, Container, Grid } from '@mui/material';
import {
  getQResponsesFromBundle,
  getQuestionnairesFromBundle,
  loadQuestionnaireResponsesFromServer,
  loadQuestionnairesFromServer
} from '../../functions/LoadServerResourceFunctions';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import QuestionnaireResponsePickerForm from './QuestionnaireResponsePickerForm';
import { ResourcePickerStore } from '../../classes/ResourcePickerStore';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
}

function QuestionnairePicker(props: Props) {
  const { questionnaireProvider } = props;
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [qResponses, setQResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQResponse, setSelectedQResponse] = useState<QuestionnaireResponse | null>(null);

  const resourcePickerStore = new ResourcePickerStore();

  useEffect(() => {
    resourcePickerStore.addQuestionnaires([questionnaireProvider.questionnaire]);

    loadQuestionnairesFromServer()
      .then((bundle) => {
        if (bundle.entry) {
          resourcePickerStore.addQuestionnaires(getQuestionnairesFromBundle(bundle));
          setQuestionnaires(Object.values(resourcePickerStore.questionnaires));
        }
      })
      .catch((error) => {
        setQuestionnaires(Object.values(resourcePickerStore.questionnaires));
        console.log(error);
      });
  }, []);

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];
    const selectedQuestionnaireId = selectedQuestionnaire.id;

    if (!selectedQuestionnaireId) return null;

    loadQuestionnaireResponsesFromServer(selectedQuestionnaireId)
      .then((bundle) => {
        if (bundle.entry) {
          const responses = getQResponsesFromBundle(bundle);
          resourcePickerStore.addQuestionnaireResponses(selectedQuestionnaireId, responses);

          setQResponses(
            Object.values(resourcePickerStore.qResponsesOfQuestionnaire[selectedQuestionnaireId])
          );
        } else {
          setQResponses([]);
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
      <Box minHeight="100vh" sx={{ py: 13 }}>
        <Card elevation={2}>
          <Box display="flex" flexDirection="column" sx={{ p: 8 }}>
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
      </Box>

      {selectedQResponse ? (
        <Card elevation={2} sx={{ my: 20 }}>
          <Box minHeight="80vh" sx={{ p: 8 }}>
            <pre>{JSON.stringify(selectedQResponse, null, 2)}</pre>
          </Box>
        </Card>
      ) : null}
    </Container>
  );
}

export default QuestionnairePicker;
