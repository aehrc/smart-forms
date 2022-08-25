import React from 'react';
import { TextField } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemString(props: Props) {
  const { item } = props;
  return (
    <div>
      <TextField id={item.linkId} />
    </div>
  );
}

export default QItemString;
