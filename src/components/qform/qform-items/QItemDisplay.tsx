import React from 'react';
import { Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { item } = props;
  return (
    <div>
      <Typography id={item.linkId}>{item.text}</Typography>
    </div>
  );
}

export default QItemDisplay;
