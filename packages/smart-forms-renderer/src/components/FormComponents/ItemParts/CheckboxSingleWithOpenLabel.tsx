/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import type { ChangeEvent } from 'react';
import React from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useRendererConfigStore } from '../../../stores';
import { StandardCheckbox } from '../../Checkbox.styles';
import OpenLabelField from './OpenLabelField';

interface Props {
  value: string | null;
  label: string;
  isChecked: boolean;
  readOnly: boolean;
  onCheckedChange: (checked: boolean) => unknown;
  onInputChange: (input: string) => unknown;
}

function CheckboxSingleWithOpenLabel(props: Props) {
  const { value, label, isChecked, readOnly, onCheckedChange, onInputChange } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();

  // When an option is disabled via toggle expression, it should truly be "disabled", regardless of readOnlyVisualStyle.
  // Both isDisabled and isReadOnly are mutually exclusive.
  const isHtmlDisabled = readOnly && readOnlyVisualStyle === 'disabled';
  const isHtmlReadOnly = readOnly && readOnlyVisualStyle === 'readonly';

  function handleCheckedChange(event: ChangeEvent<HTMLInputElement>) {
    onCheckedChange(event.target.checked);
  }

  return (
    <Box data-test="q-item-checkbox-open-label-box">
      <FormControlLabel
        sx={{
          ...(isHtmlReadOnly && {
            cursor: 'default',
            color: 'text.secondary'
          })
        }}
        disabled={isHtmlDisabled}
        control={
          <StandardCheckbox
            size="small"
            checked={isChecked}
            readOnly={isHtmlReadOnly}
            aria-readonly={isHtmlReadOnly}
            role="checkbox"
            aria-checked={isChecked}
            onChange={handleCheckedChange}
            slotProps={{
              input: {
                'aria-label': label ?? 'Unnamed checkbox'
              }
            }}
          />
        }
        label={label + ':'}
      />
      <OpenLabelField
        value={value}
        readOnly={readOnly}
        openLabelOptionSelected={isChecked}
        label={label}
        onInputChange={onInputChange}
      />
    </Box>
  );
}

export default CheckboxSingleWithOpenLabel;
