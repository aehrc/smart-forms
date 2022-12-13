import React from 'react';
import { FormControl } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';
import { QItemLabelMarkdown } from '../../../StyledComponents/Item.styles';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return (
    <FormControl>
      <QItemLabelMarkdown>{qItem.text}</QItemLabelMarkdown>
    </FormControl>
  );
}

export default QItemDisplay;
