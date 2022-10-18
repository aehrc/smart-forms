import React from 'react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { Box, Container } from '@mui/material';
import parse from 'html-react-parser';
import { qrToHTML } from '../../functions/PreviewFunctions';

interface Props {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
}

function Preview(props: Props) {
  const { questionnaire, questionnaireResponse } = props;

  const test = qrToHTML(questionnaire, questionnaireResponse);
  const parsed = parse(test);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 20 }}>
        <div>{parsed}</div>
      </Box>
    </Container>
  );
}

export default Preview;
