import { QuestionnaireResponse } from 'fhir/r5';
import React from 'react';
import {
  Box,
  Card,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import Client from 'fhirclient/lib/Client';

interface Props {
  fhirClient: Client | null;
  questionnaireResponses: QuestionnaireResponse[];
  selectedIndex: number | null;
  qrIsSearching: boolean;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function QuestionnaireResponsePickerQRList(props: Props) {
  const {
    fhirClient,
    questionnaireResponses,
    selectedIndex,
    qrIsSearching,
    onQrSelectedIndexChange
  } = props;

  if (!fhirClient) {
    return (
      <Card elevation={2} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="subtitle2">
            Application not launched from CMS, unable to fetch responses.
          </Typography>
        </Box>
      </Card>
    );
  } else if (qrIsSearching) {
    return (
      <Card elevation={2} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Stack direction="row">
            <Typography variant="subtitle2">Loading responses</Typography>
            <CircularProgress size={20} sx={{ ml: 1 }} />
          </Stack>
        </Box>
      </Card>
    );
  } else if (questionnaireResponses.length === 0) {
    return (
      <Card elevation={2} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Typography variant="subtitle2" textAlign="center">
          There are currently no responses available for this questionnaire.
        </Typography>
      </Card>
    );
  } else {
    return (
      <List sx={{ width: '100%', overflow: 'auto', height: '50vh', py: 0 }}>
        {questionnaireResponses.map((questionnaireResponse, i) => (
          <React.Fragment key={questionnaireResponse.id}>
            <ListItemButton
              selected={selectedIndex === i}
              sx={{ py: 1.25, px: 2.5 }}
              onClick={() => {
                onQrSelectedIndexChange(i);
              }}>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <ListItemText
                    primary={dayjs(`${questionnaireResponse.meta?.lastUpdated}`).format('LLL')}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </Grid>

                <Grid item xs={3}>
                  <ListItemText
                    primary={
                      questionnaireResponse.status[0].toUpperCase() +
                      questionnaireResponse.status.slice(1)
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </Grid>
              </Grid>
            </ListItemButton>
            <Divider light />
          </React.Fragment>
        ))}
      </List>
    );
  }
}

export default QuestionnaireResponsePickerQRList;
