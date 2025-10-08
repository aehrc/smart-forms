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
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import ItemRepopulateButton from '../ItemParts/ItemRepopulateButton';
import type { RenderingExtensions } from '../../../hooks/useRenderingExtensions';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { StandardTextField } from '../Textfield.styles';

interface StringFieldProps extends PropsWithIsTabledRequiredAttribute {
  qItem: QuestionnaireItem;
  input: string;
  feedback: string;
  renderingExtensions: RenderingExtensions;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onRepopulateSync: (newQrItem: QuestionnaireResponseItem | null) => unknown;
}

function StringField(props: StringFieldProps) {
  const {
    qItem,
    input,
    feedback,
    renderingExtensions,
    readOnly,
    isTabled,
    calcExpUpdated,
    onInputChange,
    onRepopulateSync
  } = props;

  const { displayPrompt, displayUnit, entryFormat, isRepopulatable } = renderingExtensions;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  return (
    <StandardTextField
      id={qItem.type + '-' + qItem.linkId}
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
              <ItemRepopulateButton
                qItem={qItem}
                repopulatable={isRepopulatable}
                onRepopulate={onRepopulateSync}
              />
              <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
            </InputAdornment>
          )
        }
      }}
      helperText={feedback}
      data-test="q-item-string-field"
    />
  );
}

export default StringField;
