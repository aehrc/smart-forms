import React, { useState } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
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
    <Box display="flex" flexDirection="column" sx={{ m: 4 }} gap={2}>
      <Box display="flex" flexDirection="row" gap={2}>
        <Typography variant="h1" fontWeight="bold" fontSize={36} color="inherit">
          Questionnaires
        </Typography>
      </Box>
      <Divider></Divider>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <QuestionnairePickerForm
            questionnaires={questionnaires}
            setQuestionnaires={setQuestionnaires}
            setQuestionnaireResponses={setQResponses}
            onQSelectedIndexChange={selectQuestionnaireByIndex}
          />
        </Grid>

        <Grid item xs={12} md={7}>
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
      <NoQuestionnaireDialog firstLaunch={firstLaunch} />
    </Box>
  );
}

export default QuestionnairePicker;
