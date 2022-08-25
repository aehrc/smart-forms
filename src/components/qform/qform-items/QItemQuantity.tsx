import React from 'react';
import { TextField } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemQuantity(props: Props) {
  const { item } = props;
  return (
    <div>
      <TextField type="number" id={item.linkId} />
    </div>
  );
}

export default QItemQuantity;
