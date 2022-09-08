import React from 'react';
import { Container, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return (
    <Container sx={{ m: 1, p: 1 }}>
      <Typography>{qItem.text}</Typography>
    </Container>
  );
}

export default QItemDisplay;
