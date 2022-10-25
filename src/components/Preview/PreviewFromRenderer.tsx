import React, { useContext } from 'react';
import { Box, Container, Stack } from '@mui/material';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import EditIcon from '@mui/icons-material/Edit';
import FormPreview from './FormPreview';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';
import { PreviewModeContext } from '../../custom-contexts/PreviewModeContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function PreviewFromPicker(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const previewModeContext = useContext(PreviewModeContext);

  return (
    <Container maxWidth="lg">
      <Box displayPrint="none">
        <Stack direction="row" spacing={2}>
          <RoundButton
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => previewModeContext.setPreviewMode(false)}>
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
