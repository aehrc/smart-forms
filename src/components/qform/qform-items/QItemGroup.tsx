import React from 'react';
import { Typography, Container } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { grey } from '@mui/material/colors';
import QItems from '../QItems';

interface Props {
  item: QuestionnaireItem;
}

// A generic form item
function QItemGroup(props: Props) {
  const { item } = props;
  return (
    <div>
      <Container sx={{ border: 0.5, mb: 2, p: 3, borderRadius: 5, borderColor: grey.A400 }}>
        {item.item && <QItems items={item.item}></QItems>}
        <Typography>{item.text}</Typography>
        <Typography>{item.type}</Typography>
        <Typography>{item.id}</Typography>
      </Container>
    </div>
  );
}

export default QItemGroup;
