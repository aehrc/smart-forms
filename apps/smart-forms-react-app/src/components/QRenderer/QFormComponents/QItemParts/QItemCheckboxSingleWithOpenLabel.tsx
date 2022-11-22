import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

interface Props {
  value: string;
  label: string;
  isChecked: boolean;
  onCheckedChange: (value: string) => unknown;
}

function QItemCheckboxSingleWithOpenLabel(props: Props) {
  const { value, label, isChecked, onCheckedChange } = props;

  return (
    <FormControlLabel
      control={<Checkbox checked={isChecked} onChange={() => onCheckedChange(value)} />}
      label={label}
      sx={{ mr: 3 }}
    />
  );
}

export default QItemCheckboxSingleWithOpenLabel;
