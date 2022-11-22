import React from 'react';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';

interface Props {
  value: string | null;
  label: string;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => unknown;
  onInputChange: (input: string) => unknown;
}

function QItemCheckboxSingleWithOpenLabel(props: Props) {
  const { value, label, isChecked, onCheckedChange, onInputChange } = props;

  function handleCheckedChange(event: React.ChangeEvent<HTMLInputElement>) {
    onCheckedChange(event.target.checked);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    onInputChange(event.target.value);
  }

  return (
    <>
      <FormControlLabel
        control={<Checkbox checked={isChecked} onChange={handleCheckedChange} />}
        label={label + ':'}
        sx={{ mr: 3 }}
      />
      <TextField disabled={!isChecked} value={value} onChange={handleInputChange} />
    </>
  );
}

export default QItemCheckboxSingleWithOpenLabel;
