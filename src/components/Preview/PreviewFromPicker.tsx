import React, { useContext } from 'react';
import { Box, Container, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { ArrowBack } from '@mui/icons-material';
import FormPreview from './FormPreview';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';
import { QuestionnaireResponseProviderContext } from '../../App';

function PreviewFromPicker() {
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const questionnaireActiveContext = useContext(QuestionnaireActiveContext);

  const questionnaireResponse = questionnaireResponseProvider.questionnaireResponse;

  return (
    <Container maxWidth="lg">
      <Box displayPrint="none">
        <Stack direction="row" spacing={2}>
          <RoundButton
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => questionnaireActiveContext.setQuestionnaireActive(false)}>
            Back to Questionnaires
          </RoundButton>
          <RoundButton variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print Preview
          </RoundButton>

          {questionnaireResponse.status === 'completed' ? null : (
            <RoundButton
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => questionnaireActiveContext.setQuestionnaireActive(true)}>
              Edit Response
            </RoundButton>
          )}
        </Stack>
      </Box>
      <FormPreview />
    </Container>
  );
}

export default PreviewFromPicker;
