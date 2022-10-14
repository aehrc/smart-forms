import React, { useState } from 'react';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireResponse } from 'fhir/r5';
import QuestionnaireResponsePickerQRList from './QuestionnaireResponsePickerQRList';
import Client from 'fhirclient/lib/Client';

interface Props {
  fhirClient: Client | null;
  questionnaireResponses: QuestionnaireResponse[];
  qrIsSearching: boolean;
  onSelectedIndexChange: (index: number) => unknown;
}

function QuestionnaireResponsePickerForm(props: Props) {
  const { fhirClient, questionnaireResponses, qrIsSearching, onSelectedIndexChange } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
            onSelectedIndexChange={(index) => {
              onSelectedIndexChange(index);
              setSelectedIndex(index);
            }}
          />
        </Card>
      </Stack>
    </>
  );
}

export default QuestionnaireResponsePickerForm;
