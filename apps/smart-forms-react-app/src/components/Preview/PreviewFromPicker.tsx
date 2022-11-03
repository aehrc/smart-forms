import React from 'react';
import { Box, Button, Container, Stack } from '@mui/material';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { ArrowBack } from '@mui/icons-material';
import FormPreview from './FormPreview';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function PreviewFromPicker(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const qResponse = questionnaireResponseProvider.questionnaireResponse;
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box displayPrint="none">
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => navigate('/picker')} sx={{ borderRadius: 20 }}>
            <ArrowBack sx={{ mr: 1 }} />
            Back to Questionnaires
          </Button>
          <Button variant="contained" onClick={() => window.print()} sx={{ borderRadius: 20 }}>
            <PrintIcon sx={{ mr: 1 }} />
            Print Preview
          </Button>

          {qResponse.status === 'completed' ? null : (
            <Button variant="contained" onClick={() => navigate('/')} sx={{ borderRadius: 20 }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Response
            </Button>
          )}
        </Stack>
      </Box>
      <FormPreview
        questionnaireProvider={questionnaireProvider}
        questionnaireResponseProvider={questionnaireResponseProvider}></FormPreview>
    </Container>
  );
}

export default PreviewFromPicker;
