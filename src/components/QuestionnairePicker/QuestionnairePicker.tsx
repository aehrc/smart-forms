import React, { useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import {
  getQResponsesFromBundle,
  loadQuestionnaireResponsesFromServer
} from '../../functions/LoadServerResourceFunctions';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import QuestionnaireResponsePickerForm from './QuestionnaireResponsePickerForm';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import NoQuestionnaireDialog from './NoQuestionnaireDialog';
import { FirstLaunch } from '../../interfaces/Interfaces';

interface Props {
  firstLaunch: FirstLaunch;
}

function QuestionnairePicker(props: Props) {
  const { firstLaunch } = props;
  const launch = React.useContext(LaunchContext);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [qResponses, setQResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedQResponse, setSelectedQResponse] = useState<QuestionnaireResponse | null>(null);
  const [qrIsSearching, setQrIsSearching] = useState(false);

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];
    const selectedQuestionnaireId = selectedQuestionnaire.id;

    if (!selectedQuestionnaireId) return null;

    if (launch.fhirClient) {
      setQrIsSearching(true);
      loadQuestionnaireResponsesFromServer(
        launch.fhirClient,
        launch.patient,
        selectedQuestionnaireId
      )
        .then((bundle) => {
          setQResponses(bundle.entry ? getQResponsesFromBundle(bundle) : []);
          setQrIsSearching(false);
        })
        .catch(() => setQrIsSearching(false));
    }
    setSelectedQuestionnaire(selectedQuestionnaire);
  }

  function selectQResponseByIndex(index: number) {
    const selectedQResponse = qResponses[index];

    if (selectedQResponse.id) {
      setSelectedQResponse(selectedQResponse);
    }
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" flexDirection="column" justifyContent="center" height="90vh">
        <Grid container spacing={8}>
          <Grid item xs={6}>
            <QuestionnairePickerForm
              questionnaires={questionnaires}
              setQuestionnaires={setQuestionnaires}
              setQuestionnaireResponses={setQResponses}
              onQSelectedIndexChange={selectQuestionnaireByIndex}
            />
          </Grid>

          <Grid item xs={6}>
            <QuestionnaireResponsePickerForm
              fhirClient={launch.fhirClient}
              questionnaireResponses={qResponses}
              qrIsSearching={qrIsSearching}
              setQrIsSearching={setQrIsSearching}
              selectedQuestionnaire={selectedQuestionnaire}
              setQuestionnaireResponses={setQResponses}
              onQrSelectedIndexChange={selectQResponseByIndex}
            />
          </Grid>
        </Grid>
      </Box>
      <NoQuestionnaireDialog firstLaunch={firstLaunch} />
    </Container>
  );
}

export default QuestionnairePicker;
