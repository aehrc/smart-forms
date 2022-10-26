import React, { useContext } from 'react';
import { Box, Container, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FormPreview from './FormPreview';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';
import { PreviewModeContext } from '../../custom-contexts/PreviewModeContext';

function PreviewFromPicker() {
  const previewModeContext = useContext(PreviewModeContext);

  return (
    <Container maxWidth="lg">
      <Box displayPrint="none">
        <Stack direction="row" spacing={2}>
          <RoundButton
            variant="outlined"
            sx={{ mt: 10 }}
            startIcon={<EditIcon />}
            onClick={() => previewModeContext.setIsPreviewMode(false)}>
            Continue Editing
          </RoundButton>
        </Stack>
      </Box>
      <FormPreview />
    </Container>
  );
}

export default PreviewFromPicker;
