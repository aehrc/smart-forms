import React, { useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import {
  getQResponsesFromBundle,
  loadQuestionnaireResponsesFromServer
} from '../../functions/LoadServerResourceFunctions';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import QuestionnaireResponsePickerForm from './QuestionnaireResponsePickerForm';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import NoQuestionnaireDialog from './NoQuestionnaireDialog';
import { FirstLaunch } from '../../interfaces/Interfaces';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
  firstLaunch: FirstLaunch;
}

function QuestionnairePicker(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider, firstLaunch } = props;
  const launchContext = React.useContext(LaunchContext);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [qResponses, setQResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedQResponse, setSelectedQResponse] = useState<QuestionnaireResponse | null>(null);
  const [qrIsSearching, setQrIsSearching] = useState(false);

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];
    const selectedQuestionnaireId = selectedQuestionnaire.id;

    if (!selectedQuestionnaireId) return null;

    if (launchContext.fhirClient) {
      setQrIsSearching(true);
      loadQuestionnaireResponsesFromServer(
        launchContext.fhirClient,
        launchContext.patient,
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
              questionnaireProvider={questionnaireProvider}
              questionnaireResponseProvider={questionnaireResponseProvider}
              setQuestionnaires={setQuestionnaires}
              setQuestionnaireResponses={setQResponses}
              onQSelectedIndexChange={selectQuestionnaireByIndex}
            />
          </Grid>

          <Grid item xs={6}>
            <QuestionnaireResponsePickerForm
              fhirClient={launchContext.fhirClient}
              questionnaireResponses={qResponses}
              qrIsSearching={qrIsSearching}
              selectedQuestionnaire={selectedQuestionnaire}
              questionnaireProvider={questionnaireProvider}
              questionnaireResponseProvider={questionnaireResponseProvider}
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
