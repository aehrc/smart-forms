import React from 'react';
import { FormControl } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';
import QItemLabel from '../QItemParts/QItemLabel';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return (
    <FormControl>
      <QItemLabel qItem={qItem} />
    </FormControl>
  );
}

export default QItemDisplay;
