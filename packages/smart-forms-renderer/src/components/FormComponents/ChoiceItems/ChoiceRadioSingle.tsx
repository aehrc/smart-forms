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
import { useRendererStylingStore } from '../../../stores';
import { StandardRadio } from '../../Radio.styles';

interface ChoiceRadioSingleProps {
  value: string;
  label: string;
  readOnly: boolean;
  disabledViaToggleExpression: boolean;
  fullWidth: boolean;
}

function ChoiceRadioSingle(props: ChoiceRadioSingleProps) {
  const { value, label, readOnly, disabledViaToggleExpression, fullWidth } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();

  // When an option is disabled via answerOptionsToggleExpression, it should truly be "disabled", regardless of readOnlyVisualStyle.
  // Both isHtmlDisabled and isHtmlReadOnly are mutually exclusive.
  const readOnlyWithDisabledStyle = readOnly && readOnlyVisualStyle === 'disabled';
  const readOnlyWithReadOnlyStyle = readOnly && readOnlyVisualStyle === 'readonly';

  const isHtmlDisabled = readOnlyWithDisabledStyle || disabledViaToggleExpression;
  const isHtmlReadOnly = readOnlyWithReadOnlyStyle && !disabledViaToggleExpression;

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
        <StandardRadio data-test={`radio-single-${label}`} size="small" readOnly={isHtmlReadOnly} />
      }
      label={label}
    />
  );
}

export default ChoiceRadioSingle;
