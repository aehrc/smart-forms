import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Props {
  questionnaire: Questionnaire;
  batchResponse: Bundle | null;
  questionnaireResponse: QuestionnaireResponse;
  clearQResponse: () => unknown;
}

function DisplayDebugQResponse(props: Props) {
  const { questionnaire, batchResponse, questionnaireResponse, clearQResponse } = props;

  const [displayInfo, setDisplayInfo] = useState<{
    name: string;
    data: Questionnaire | QuestionnaireResponse | Bundle;
  }>({ name: 'Questionnaire Response', data: questionnaireResponse });

  useEffect(() => {
    if (displayInfo.name === 'Questionnaire Response') {
      setDisplayInfo({ ...displayInfo, data: questionnaireResponse });
    }
  }, [questionnaireResponse]);

  return (
    <Box sx={{ pt: 6 }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row">
          <Typography variant="h5">{displayInfo.name}</Typography>
          <Button
            onClick={() => {
              navigator.clipboard
                .writeText(JSON.stringify(displayInfo.data, null, 2))
                .then(() => alert(`${displayInfo.name} copied to clipboard`))
                .catch(() =>
                  alert(
                    'The copy operation doesnt work within an iframe (CMS-launched app in this case)\n:('
                  )
                );
            }}
            sx={{ borderRadius: 2, ml: 1 }}>
            <ContentCopyIcon />
          </Button>
          {displayInfo.name === 'Questionnaire Response' ? (
            <Button onClick={clearQResponse} color="error" sx={{ borderRadius: 2, ml: 1 }}>
              <DeleteIcon />
            </Button>
          ) : null}
        </Stack>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setDisplayInfo({ name: 'Questionnaire', data: questionnaire })}
            disabled={displayInfo.name === 'Questionnaire'}
            sx={{ borderRadius: 20 }}>
            Questionnaire
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              setDisplayInfo({ name: 'Questionnaire Response', data: questionnaireResponse })
            }
            disabled={displayInfo.name === 'Questionnaire Response'}
            sx={{ borderRadius: 20, ml: 1 }}>
            QuestionnaireResponse
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (batchResponse) setDisplayInfo({ name: 'Batch Response', data: batchResponse });
            }}
            disabled={displayInfo.name === 'Batch Response' || !batchResponse}
            sx={{ borderRadius: 20, ml: 1 }}>
            Batch Response
          </Button>
        </Box>
      </Stack>
      <pre>{JSON.stringify(displayInfo.data, null, 2)}</pre>
    </Box>
  );
}

export default DisplayDebugQResponse;
