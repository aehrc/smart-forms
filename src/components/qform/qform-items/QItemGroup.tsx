import React from 'react';
import { Typography, Container } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { grey } from '@mui/material/colors';
import QItems from '../QItems';

interface Props {
  item: QuestionnaireItem;
}

function QItemGroup(props: Props) {
  const { item } = props;
  return (
    <div>
      <Container sx={{ border: 0.5, mb: 2, p: 3, borderColor: grey.A400 }}>
        <Typography variant="h6">{item.text}</Typography>
        {item.item && <QItems items={item.item}></QItems>}
      </Container>
    </div>
  );
}

export default QItemGroup;
