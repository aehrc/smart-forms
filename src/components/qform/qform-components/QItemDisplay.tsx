import React from 'react';
import { Typography } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplay(props: Props) {
  const { qItem } = props;

  return <Typography>{qItem.text}</Typography>;
}

export default QItemDisplay;
