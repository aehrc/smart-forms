import React from 'react';
import { TextField } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemInteger(props: Props) {
  const { item } = props;
  return (
    <div>
      <TextField type="number" id={item.linkId}>
        {item.text}
      </TextField>
    </div>
  );
}

export default QItemInteger;
