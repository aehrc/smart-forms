import React, { useContext } from 'react';
import { Box, Container, Stack } from '@mui/material';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { ArrowBack } from '@mui/icons-material';
import FormPreview from './FormPreview';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function PreviewFromPicker(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const questionnaireActiveContext = useContext(QuestionnaireActiveContext);

  const qResponse = questionnaireResponseProvider.questionnaireResponse;

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

          {qResponse.status === 'completed' ? null : (
            <RoundButton
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => questionnaireActiveContext.setQuestionnaireActive(true)}>
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
