import React from 'react';
import { Box, Container, Stack } from '@mui/material';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import EditIcon from '@mui/icons-material/Edit';
import FormPreview from './FormPreview';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';

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
          <RoundButton variant="outlined" startIcon={<EditIcon />} onClick={() => setPreviewMode()}>
            Continue Editing
          </RoundButton>
        </Stack>
      </Box>
      <FormPreview
        questionnaireProvider={questionnaireProvider}
        questionnaireResponseProvider={questionnaireResponseProvider}></FormPreview>
    </Container>
  );
}

export default PreviewFromPicker;
