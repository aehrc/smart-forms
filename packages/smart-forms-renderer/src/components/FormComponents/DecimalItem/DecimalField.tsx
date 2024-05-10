/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import InputAdornment from '@mui/material/InputAdornment';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import { StandardTextField } from '../Textfield.styles';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';

interface DecimalFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
}

function DecimalField(props: DecimalFieldProps) {
  const {
    linkId,
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

  return (
    <StandardTextField
      id={linkId}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      disabled={readOnly}
      label={displayPrompt}
      placeholder={entryFormat === '' ? '0.0' : entryFormat}
      fullWidth
      isTabled={isTabled}
      size="small"
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position={'end'}>
            <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
            {displayUnit}
          </InputAdornment>
        )
      }}
      helperText={feedback}
      data-test="q-item-decimal-field"
    />
  );
}

export default DecimalField;
