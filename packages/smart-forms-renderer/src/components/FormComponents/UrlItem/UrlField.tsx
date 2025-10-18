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
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import InputAdornment from '@mui/material/InputAdornment';
import { StandardTextField } from '../Textfield.styles';
import { useRendererConfigStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';

interface UrlFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  instructionsId?: string;
  onInputChange: (value: string) => void;
}

function UrlField(props: UrlFieldProps) {
  const {
    linkId,
    itemType,
    input,
    feedback,
    displayPrompt,
    displayUnit,
    entryFormat,
    readOnly,
    isTabled,
    instructionsId,
    onInputChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  // Generate ID for unit text to associate with input via aria-describedby
  const unitId = displayUnit ? `unit-${linkId}` : undefined;
  
  // Combine unit and instructions IDs for aria-describedby
  const ariaDescribedBy = [unitId, instructionsId].filter(Boolean).join(' ') || undefined;

  return (
    <StandardTextField
      id={itemType + '-' + linkId}
      multiline
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      placeholder={entryFormat || displayPrompt}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      size="small"
      slotProps={{
        htmlInput: {
          'aria-describedby': ariaDescribedBy
        },
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position="end">
              <ClearButtonAdornment
                readOnly={readOnly}
                onClear={() => {
                  onInputChange('');
                }}
              />
              <DisplayUnitText id={unitId} readOnly={readOnly}>
                {displayUnit}
              </DisplayUnitText>
            </InputAdornment>
          )
        }
      }}
      helperText={feedback}
      data-test="q-item-url-field"
    />
  );
}

export default UrlField;
