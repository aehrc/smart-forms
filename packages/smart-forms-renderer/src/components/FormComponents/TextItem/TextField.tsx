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
import { useRendererStylingStore } from '../../../stores';
import { expressionUpdateFadingGlow } from '../../ExpressionUpdateFadingGlow.styles';

interface TextFieldProps {
  linkId: string;
  itemType: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onBlur: () => void;
}

function TextField(props: TextFieldProps) {
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
    onInputChange,
    onBlur
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();

  return (
    <MuiTextField
      id={itemType + '-' + linkId}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      onBlur={onBlur}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      placeholder={entryFormat || displayPrompt}
      fullWidth
      multiline
      size="small"
      minRows={3}
      sx={[expressionUpdateFadingGlow(calcExpUpdated)]}
      slotProps={{
        input: {
          readOnly: readOnly && readOnlyVisualStyle === 'readonly',
          endAdornment: (
            <InputAdornment position="end">
              <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
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
