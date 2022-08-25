import React from 'react';
import { Checkbox } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';

interface Props {
  item: QuestionnaireItem;
}

function QItemBoolean(props: Props) {
  const { item } = props;
  return (
    <div>
      <Checkbox id={item.linkId} />
    </div>
  );
}

export default QItemBoolean;
