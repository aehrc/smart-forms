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

import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import { StandardCheckbox } from '../../Checkbox.styles';
import { useRendererConfigStore } from '../../../stores';

interface CheckboxSingleProps {
  value: string;
  label: React.ReactNode;
  labelText?: string;
  readOnly: boolean;
  disabledViaToggleExpression: boolean;
  fullWidth: boolean;
  isChecked: boolean;
  onCheckedChange: (value: string) => unknown;
}

function CheckboxSingle(props: CheckboxSingleProps) {
  const {
    value,
    label,
    labelText,
    readOnly,
    disabledViaToggleExpression,
    fullWidth,
    isChecked,
    onCheckedChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();

  // When an option is disabled via toggle expression, it should truly be "disabled", regardless of readOnlyVisualStyle.
  // Both isDisabled and isReadOnly are mutually exclusive.
  const readOnlyWithDisabledStyle = readOnly && readOnlyVisualStyle === 'disabled';
  const readOnlyWithReadOnlyStyle = readOnly && readOnlyVisualStyle === 'readonly';

  const isHtmlDisabled = readOnlyWithDisabledStyle || disabledViaToggleExpression;
  const isHtmlReadOnly = readOnlyWithReadOnlyStyle && !disabledViaToggleExpression;

  const textForDataTest = labelText ?? (typeof label === 'string' ? label : value);

  return (
    <FormControlLabel
      sx={{
        width: fullWidth ? '100%' : 'unset',
        ...(isHtmlReadOnly && {
          cursor: 'default',
          color: 'text.secondary'
        })
      }}
      disabled={isHtmlDisabled}
      value={value}
      control={
        <StandardCheckbox
          data-test={`checkbox-single-${textForDataTest}`}
          size="small"
          checked={isChecked}
          readOnly={isHtmlReadOnly}
          aria-readonly={isHtmlReadOnly}
          role="checkbox"
          aria-checked={isChecked}
          onChange={() => {
            // If item.readOnly=true, do not allow any changes
            if (readOnly) {
              return;
            }

            onCheckedChange(value);
          }}
          slotProps={{
            input: {
              'aria-label': (typeof label === 'string' ? label : labelText) ?? 'Unnamed checkbox'
            }
          }}
        />
      }
      label={label}
    />
  );
}

export default CheckboxSingle;
