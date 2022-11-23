import React from 'react';
import { FormControl } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';
import { QItemTypography } from '../../../StyledComponents/Item.styles';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return (
    <FormControl>
      <QItemTypography>{qItem.text}</QItemTypography>
    </FormControl>
  );
}

export default QItemDisplay;
