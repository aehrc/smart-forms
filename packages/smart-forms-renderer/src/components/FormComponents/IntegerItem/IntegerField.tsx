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
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import ItemRepopulateButton from '../ItemParts/ItemRepopulateButton';
import type { RenderingExtensions } from '../../../hooks/useRenderingExtensions';
import { StandardTextField } from '../Textfield.styles';

interface IntegerFieldProps extends PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  input: string;
  feedback: string;
  renderingExtensions: RenderingExtensions;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onRepopulateSync: (newQrItem: QuestionnaireResponseItem | null) => unknown;
}

function IntegerField(props: IntegerFieldProps) {
  const {
    qItem,
    input,
    feedback,
    renderingExtensions,
    readOnly,
    calcExpUpdated,
    isTabled,
    onInputChange,
    onRepopulateSync
  } = props;

  const { displayPrompt, displayUnit, entryFormat, isRepopulatable } = renderingExtensions;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  let placeholderText = '0';
  if (displayPrompt) {
    placeholderText = displayPrompt;
  }

  if (entryFormat) {
    placeholderText = entryFormat;
  }

  // Generate ID for unit text to associate with input via aria-describedby
  const unitId = displayUnit ? `unit-${qItem.linkId}` : undefined;

  return (
    <StandardTextField
      id={qItem.type + '-' + qItem.linkId}
      value={input}
      error={!!feedback}
      helperText={feedback}
      onChange={(event) => onInputChange(event.target.value)}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      label={displayPrompt}
      placeholder={placeholderText}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      size="small"
      slotProps={{
        htmlInput: {
          inputMode: 'numeric',
          pattern: '[0-9]*',
          'aria-describedby': unitId
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
              <ItemRepopulateButton
                qItem={qItem}
                repopulatable={isRepopulatable}
                onRepopulate={onRepopulateSync}
              />
              <DisplayUnitText id={unitId} readOnly={readOnly}>
                {displayUnit}
              </DisplayUnitText>
            </InputAdornment>
          )
        }
      }}
      data-test="q-item-integer-field"
    />
  );
}

export default IntegerField;
