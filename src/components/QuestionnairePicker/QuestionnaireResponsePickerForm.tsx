import React, { useContext, useEffect, useState } from 'react';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnaireResponsePickerQRList from './QuestionnaireResponsePickerQRList';
import Client from 'fhirclient/lib/Client';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';
import {
  getQResponsesFromBundle,
  loadQuestionnaireResponsesFromServer
} from '../../functions/LoadServerResourceFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';

interface Props {
  fhirClient: Client | null;
  questionnaireResponses: QuestionnaireResponse[];
  qrIsSearching: boolean;
  setQrIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  selectedQuestionnaire: Questionnaire | null;
  setQuestionnaireResponses: React.Dispatch<React.SetStateAction<QuestionnaireResponse[]>>;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function QuestionnaireResponsePickerForm(props: Props) {
  const {
    fhirClient,
    questionnaireResponses,
    qrIsSearching,
    setQrIsSearching,
    selectedQuestionnaire,
    setQuestionnaireResponses,
    onQrSelectedIndexChange
  } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const questionnaireActive = useContext(QuestionnaireActiveContext);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const launchContext = React.useContext(LaunchContext);

  useEffect(() => {
    if (launchContext.fhirClient) {
      setQrIsSearching(true);
      loadQuestionnaireResponsesFromServer(launchContext.fhirClient, launchContext.patient)
        .then((bundle) => {
          setQuestionnaireResponses(bundle.entry ? getQResponsesFromBundle(bundle) : []);
          setQrIsSearching(false);
        })
        .catch(() => setQrIsSearching(false));
    }
  }, []);

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Card elevation={1} sx={{ height: 57.5, mt: 0.25 }}>
          <Box sx={{ m: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Responses
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Modified At
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Status
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Card elevation={1} sx={{ height: '50vh' }}>
          <QuestionnaireResponsePickerQRList
            fhirClient={fhirClient}
            questionnaireResponses={questionnaireResponses}
            selectedIndex={selectedIndex}
            qrIsSearching={qrIsSearching}
            onQrSelectedIndexChange={(index) => {
              onQrSelectedIndexChange(index);
              setSelectedIndex(index);
            }}
          />
        </Card>

        <RoundButton
          variant="outlined"
          startIcon={<VisibilityIcon />}
          disabled={typeof selectedIndex !== 'number' || !selectedQuestionnaire}
          onClick={() => {
            if (typeof selectedIndex === 'number' && selectedQuestionnaire) {
              questionnaireProvider.setQuestionnaire(selectedQuestionnaire);
              questionnaireResponseProvider.setQuestionnaireResponse(
                questionnaireResponses[selectedIndex]
              );

              questionnaireActive.setQuestionnaireActive(false);
            }
          }}
          sx={{ py: 1.5, fontSize: 16, textTransform: 'Capitalize' }}>
          View Response
        </RoundButton>
      </Stack>
    </>
  );
}

export default QuestionnaireResponsePickerForm;
