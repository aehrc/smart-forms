/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import Box from '@mui/material/Box';
import ChoiceRadioSingle from '../ChoiceItems/ChoiceRadioSingle';
import OpenLabelField from './OpenLabelField';

interface RadioButtonWithOpenLabelProps {
  value: string | null;
  label: string;
  readOnly: boolean;
  isSelected: boolean;
  onInputChange: (input: string) => unknown;
}

function RadioButtonWithOpenLabel(props: RadioButtonWithOpenLabelProps) {
  const { value, label, readOnly, isSelected, onInputChange } = props;

  return (
    <Box data-test="q-item-radio-open-label-box">
      <ChoiceRadioSingle
        value={value ?? ''}
        label={label + ':'}
        readOnly={readOnly}
        fullWidth={false}
      />
      <OpenLabelField
        value={value}
        readOnly={readOnly}
        openLabelOptionSelected={isSelected}
        label={label}
        onInputChange={onInputChange}
      />
    </Box>
  );
}

export default RadioButtonWithOpenLabel;
