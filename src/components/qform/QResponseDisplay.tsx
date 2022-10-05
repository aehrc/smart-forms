import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { QuestionnaireResponse } from 'fhir/r5';

type Props = {
  questionnaireResponse: QuestionnaireResponse;
  clearQResponse: () => unknown;
};

function QResponseDisplay(props: Props) {
  const { questionnaireResponse, clearQResponse } = props;
  return (
    <Box sx={{ pt: 6 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">Questionnaire Response</Typography>
        <Button variant="contained" onClick={clearQResponse} sx={{ borderRadius: 20 }}>
          Clear Responses
          <ClearIcon sx={{ ml: 1 }} />
        </Button>
      </Stack>
      <pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>
    </Box>
  );
}

export default QResponseDisplay;
