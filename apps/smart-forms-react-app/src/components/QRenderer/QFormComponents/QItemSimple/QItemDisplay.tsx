import React from 'react';
import { FormControl, Typography } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return (
    <FormControl>
      <Typography>{qItem.text}</Typography>
    </FormControl>
  );
}

export default QItemDisplay;
