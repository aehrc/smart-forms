import React, { useState } from 'react';
import { Box, Card, Container, Grid } from '@mui/material';
import {
  getQResponsesFromBundle,
  loadQuestionnaireResponsesFromServer
} from '../../functions/LoadServerResourceFunctions';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import QuestionnaireResponsePickerForm from './QuestionnaireResponsePickerForm';
import { ResourcePickerStore } from '../../classes/ResourcePickerStore';
import { FhirClientContext } from '../../custom-contexts/FhirClientContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
}

function QuestionnairePicker(props: Props) {
  const { questionnaireProvider } = props;
  const fhirClient = React.useContext(FhirClientContext).fhirClient;

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [qResponses, setQResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQResponse, setSelectedQResponse] = useState<QuestionnaireResponse | null>(null);

  const resourcePickerStore = new ResourcePickerStore();

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];
    const selectedQuestionnaireId = selectedQuestionnaire.id;

    if (!selectedQuestionnaireId) return null;

    if (fhirClient) {
      loadQuestionnaireResponsesFromServer(fhirClient, selectedQuestionnaireId)
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
  }

  function selectQResponseByIndex(index: number) {
    const selectedQResponse = qResponses[index];

    if (selectedQResponse.id) {
      setSelectedQResponse(selectedQResponse);
    }
  }

  const renderQuestionnairePicker = (
    <Container maxWidth="lg">
      <Box display="flex" height="100vh" flexDirection="column" justifyContent="center">
        <Grid container spacing={8}>
          <Grid item xs={6}>
            <QuestionnairePickerForm
              questionnaires={questionnaires}
              setQuestionnaires={setQuestionnaires}
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

      {selectedQResponse ? (
        <Card elevation={2} sx={{ my: 20 }}>
          <Box minHeight="80vh" sx={{ p: 8 }}>
            <pre>{JSON.stringify(selectedQResponse, null, 2)}</pre>
          </Box>
        </Card>
      ) : null}
    </Container>
  );

  return <>{renderQuestionnairePicker}</>;
}

export default QuestionnairePicker;
