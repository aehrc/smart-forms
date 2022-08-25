import React from 'react';
import { TextField } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemText(props: Props) {
  const { item } = props;
  return (
    <div>
      <TextField id={item.linkId} multiline />
    </div>
  );
}

export default QItemText;
