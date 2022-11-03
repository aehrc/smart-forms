import React from 'react';
import { Box, Button, Container, Stack } from '@mui/material';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import EditIcon from '@mui/icons-material/Edit';
import FormPreview from './FormPreview';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
  setPreviewMode: () => unknown;
}

function PreviewFromPicker(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider, setPreviewMode } = props;

  return (
    <Container maxWidth="lg">
      <Box displayPrint="none">
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => setPreviewMode()} sx={{ borderRadius: 20 }}>
            <EditIcon sx={{ mr: 1 }} />
            Continue Editing
          </Button>
        </Stack>
      </Box>
      <FormPreview
        questionnaireProvider={questionnaireProvider}
        questionnaireResponseProvider={questionnaireResponseProvider}></FormPreview>
    </Container>
  );
}

export default PreviewFromPicker;
