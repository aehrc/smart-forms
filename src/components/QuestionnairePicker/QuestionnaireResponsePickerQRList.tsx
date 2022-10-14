import { QuestionnaireResponse } from 'fhir/r5';
import React from 'react';
import {
  Box,
  Card,
  Divider,
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
  onSelectedIndexChange: (index: number) => unknown;
}

function QuestionnaireResponsePickerQRList(props: Props) {
  const {
    fhirClient,
    questionnaireResponses,
    selectedIndex,
    qrIsSearching,
    onSelectedIndexChange
  } = props;

  if (!fhirClient) {
    return (
      <Card elevation={5} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="subtitle2">
            Application not launched from CMS, unable to fetch responses.
          </Typography>
        </Box>
      </Card>
    );
  } else if (qrIsSearching) {
    return (
      <Card elevation={5} sx={{ m: 2, p: 2, borderRadius: 25 }}>
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
      <Card elevation={5} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Typography variant="subtitle2" textAlign="center">
          There are currently no responses available for this questionnaire.
        </Typography>
      </Card>
    );
  } else {
    return (
      <List sx={{ width: '100%', overflow: 'auto', py: 0 }}>
        {questionnaireResponses.map((questionnaireResponse, i) => (
          <React.Fragment key={questionnaireResponse.id}>
            <ListItemButton
              selected={selectedIndex === i}
              sx={{ p: 1.25 }}
              onClick={() => {
                onSelectedIndexChange(i);
              }}>
              <ListItemText
                primary={dayjs(`${questionnaireResponse.meta?.lastUpdated}`).format('LLL')}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                sx={{ px: 1.5 }}
              />
            </ListItemButton>
            <Divider light />
          </React.Fragment>
        ))}
      </List>
    );
  }
}

export default QuestionnaireResponsePickerQRList;
