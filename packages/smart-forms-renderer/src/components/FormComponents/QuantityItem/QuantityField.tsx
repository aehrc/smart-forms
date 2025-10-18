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

import InputAdornment from '@mui/material/InputAdornment';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import { StandardTextField } from '../Textfield.styles';

interface QuantityFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  instructionsId?: string;
  onInputChange: (value: string) => void;
}

function QuantityField(props: QuantityFieldProps) {
  const {
    linkId,
    itemType,
    input,
    feedback,
    displayPrompt,
    displayUnit,
    entryFormat,
    readOnly,
    calcExpUpdated,
    isTabled,
    instructionsId,
    onInputChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  let placeholderText = '0.0';
  if (displayPrompt) {
    placeholderText = displayPrompt;
  }

  if (entryFormat) {
    placeholderText = entryFormat;
  }

  // Generate ID for unit text to associate with input via aria-describedby
  const unitId = displayUnit ? `unit-${linkId}` : undefined;
  
  // Combine unit and instructions IDs for aria-describedby
  const ariaDescribedBy = [unitId, instructionsId].filter(Boolean).join(' ') || undefined;

  return (
    <StandardTextField
      id={itemType + '-' + linkId + '-input'}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      placeholder={placeholderText}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      size="small"
      slotProps={{
        htmlInput: {
          inputMode: 'numeric',
          pattern: '[0-9]*',
          'aria-describedby': ariaDescribedBy
        },
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position={'end'}>
              <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
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
      data-test="q-item-quantity-field"
    />
  );
}

export default QuantityField;
