import React from 'react';
import { Typography, Container } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

// A generic form item
function QItemGroup(props: Props) {
  const { item } = props;
  return (
    <div>
      <Container maxWidth="sm" sx={{ p: 2, border: 1 }}>
        <Typography>{item.text}</Typography>
        <Typography>{item.type}</Typography>
        <Typography>{item.id}</Typography>
      </Container>
    </div>
  );
}

export default QItemGroup;
