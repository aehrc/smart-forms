import React from 'react';
import { Box, Container, Stack } from '@mui/material';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { ArrowBack } from '@mui/icons-material';
import FormPreview from './FormPreview';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';

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
          <RoundButton
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/picker')}>
            Back to Questionnaires
          </RoundButton>
          <RoundButton variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print Preview
          </RoundButton>

          {qResponse.status === 'completed' ? null : (
            <RoundButton variant="outlined" startIcon={<EditIcon />} onClick={() => navigate('/')}>
              Edit Response
            </RoundButton>
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
