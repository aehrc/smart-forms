import React, { useState } from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnaireResponsePickerQRList from './QuestionnaireResponsePickerQRList';
import Client from 'fhirclient/lib/Client';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';

interface Props {
  fhirClient: Client | null;
  questionnaireResponses: QuestionnaireResponse[];
  qrIsSearching: boolean;
  selectedQuestionnaire: Questionnaire | null;
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function QuestionnaireResponsePickerForm(props: Props) {
  const {
    fhirClient,
    questionnaireResponses,
    qrIsSearching,
    selectedQuestionnaire,
    questionnaireProvider,
    questionnaireResponseProvider,
    onQrSelectedIndexChange
  } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Card elevation={1} sx={{ height: 57.5, mt: 10 }}>
          <Box sx={{ m: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Responses
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

        <Card elevation={1} sx={{ height: 508 }}>
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

        <Button
          variant="contained"
          disabled={typeof selectedIndex !== 'number' || !selectedQuestionnaire}
          onClick={() => {
            if (typeof selectedIndex === 'number' && selectedQuestionnaire) {
              questionnaireProvider.setQuestionnaire(selectedQuestionnaire);
              questionnaireResponseProvider.setQuestionnaireResponse(
                questionnaireResponses[selectedIndex]
              );
              navigate(`/preview`);
            }
          }}
          sx={{ borderRadius: 20, py: 1.5, fontSize: 16, textTransform: 'Capitalize' }}>
          View Response
          <VisibilityIcon sx={{ ml: 1.5 }} />
        </Button>
      </Stack>
    </>
  );
}

export default QuestionnaireResponsePickerForm;
