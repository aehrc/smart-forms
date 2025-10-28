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
import AccessibleFeedback from '../ItemParts/AccessibleFeedback';

interface QuantityFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  itemText: string | undefined;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
}

function QuantityField(props: QuantityFieldProps) {
  const {
    linkId,
    itemType,
    itemText,
    input,
    feedback,
    displayPrompt,
    displayUnit,
    entryFormat,
    readOnly,
    calcExpUpdated,
    isTabled,
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

  const inputId = itemType + '-' + linkId + '-input';

  // Construct aria-label with unit for better accessibility
  const ariaLabel = displayUnit ? `${itemText || ''} (${displayUnit})`.trim() : undefined;

  return (
    <StandardTextField
      id={inputId}
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
          ...(ariaLabel && { 'aria-label': ariaLabel })
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
              <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
            </InputAdornment>
          )
        }
      }}
      helperText={<AccessibleFeedback>{feedback}</AccessibleFeedback>}
      data-test="q-item-quantity-field"
    />
  );
}

export default QuantityField;
