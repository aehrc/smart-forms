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
import MuiTextField from './MuiTextField';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { useRendererConfigStore } from '../../../stores';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { RenderingExtensions } from '../../../hooks/useRenderingExtensions';
import ItemRepopulateButton from '../ItemParts/ItemRepopulateButton';

interface TextFieldProps {
  qItem: QuestionnaireItem;
  input: string;
  feedback: string;
  renderingExtensions: RenderingExtensions;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onRepopulateSync: (newQrItem: QuestionnaireResponseItem | null) => unknown;
}

function TextField(props: TextFieldProps) {
  const {
    qItem,
    input,
    feedback,
    renderingExtensions,
    readOnly,
    calcExpUpdated,
    onInputChange,
    onRepopulateSync
  } = props;

  const { displayPrompt, displayUnit, entryFormat, isRepopulatable } = renderingExtensions;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();

  // Generate ID for unit text to associate with input via aria-describedby
  const unitId = displayUnit ? `unit-${qItem.linkId}` : undefined;

  return (
    <MuiTextField
      id={qItem.type + '-' + qItem.linkId}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      placeholder={entryFormat || displayPrompt}
      fullWidth
      multiline
      size="small"
      minRows={3}
      slotProps={{
        htmlInput: {
          'aria-describedby': unitId
        },
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position="end">
              <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
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
      helperText={feedback}
      data-test="q-item-text-field"
    />
  );
}

export default TextField;
