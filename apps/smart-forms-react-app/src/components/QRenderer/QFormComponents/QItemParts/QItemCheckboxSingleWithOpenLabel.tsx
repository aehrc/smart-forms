/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';

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
      <StandardTextField
        disabled={!isChecked}
        value={value}
        onChange={handleInputChange}
        fullWidth
        isTabled={false}
      />
    </>
  );
}

export default QItemCheckboxSingleWithOpenLabel;
