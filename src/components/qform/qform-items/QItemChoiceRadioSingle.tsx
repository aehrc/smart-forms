import React from 'react';
import { FormControlLabel, Radio } from '@mui/material';

interface Props {
  value: string;
  label: string;
}

function QItemChoiceRadioSingle(props: Props) {
  const { value, label } = props;

  return <FormControlLabel value={value} control={<Radio />} label={label} sx={{ mr: 3 }} />;
}

export default QItemChoiceRadioSingle;
