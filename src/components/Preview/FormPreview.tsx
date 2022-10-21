import React from 'react';
import { Box, Container } from '@mui/material';
import parse from 'html-react-parser';
import { qrToHTML } from '../../functions/PreviewFunctions';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function FormPreview(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;

  const questionnaire = questionnaireProvider.questionnaire;
  const qResponse = questionnaireResponseProvider.questionnaireResponse;

  const test = qrToHTML(questionnaire, qResponse);
  const parsed = parse(test);

  // TODO fix preview page styling
  // TODO text too big and too close to borders
  // TODO fix dark mode grey text when printing

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 3 }}>
        <div>{parsed}</div>
      </Box>
    </Container>
  );
}

export default FormPreview;
