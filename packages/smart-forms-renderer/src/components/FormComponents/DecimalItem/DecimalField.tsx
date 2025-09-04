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
import { StandardTextField } from '../Textfield.styles';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererStylingStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import GranularRepopulateButton from '../ItemParts/GranularRepopulateButton';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { RenderingExtensions } from '../../../hooks/useRenderingExtensions';

interface DecimalFieldProps extends PropsWithIsTabledRequiredAttribute {
  qItem: QuestionnaireItem;
  input: string;
  feedback: string;
  renderingExtensions: RenderingExtensions;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onRepopulateSync: (newQrItem: QuestionnaireResponseItem | null) => unknown;
  onBlur: () => void;
}

function DecimalField(props: DecimalFieldProps) {
  const {
    qItem,
    input,
    feedback,
    renderingExtensions,
    readOnly,
    calcExpUpdated,
    isTabled,
    onInputChange,
    onRepopulateSync,
    onBlur
  } = props;

  const { displayPrompt, displayUnit, entryFormat, isRepopulatable } = renderingExtensions;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  let placeholderText = '0.0';
  if (displayPrompt) {
    placeholderText = displayPrompt;
  }

  if (entryFormat) {
    placeholderText = entryFormat;
  }

  return (
    <StandardTextField
      id={qItem.type + '-' + qItem.linkId}
      value={input}
      error={!!feedback}
      helperText={feedback}
      onChange={(event) => onInputChange(event.target.value)}
      onBlur={onBlur}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      placeholder={placeholderText}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      size="small"
      slotProps={{
        htmlInput: {
          inputMode: 'numeric',
          pattern: '[0-9]*'
        },
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position="end">
              <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
              <ClearButtonAdornment
                readOnly={readOnly}
                onClear={() => {
                  onInputChange('');
                }}
              />
              <GranularRepopulateButton
                qItem={qItem}
                repopulatable={isRepopulatable}
                onRepopulate={onRepopulateSync}
              />
              <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
            </InputAdornment>
          )
        }
      }}
      data-test="q-item-decimal-field"
    />
  );
}

export default DecimalField;
