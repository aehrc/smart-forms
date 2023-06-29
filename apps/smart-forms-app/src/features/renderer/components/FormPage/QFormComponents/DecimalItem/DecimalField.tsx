/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { InputAdornment } from '@mui/material';
import { memo } from 'react';
import FadingCheckIcon from '../../../../../calculatedExpression/components/FadingCheckIcon.tsx';
import { StandardTextField } from '../Textfield.styles.tsx';
import { PropsWithIsTabledAttribute } from '../../../../types/renderProps.interface.ts';

interface DecimalFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onFieldFocus: (focused: boolean) => void;
  onInputChange: (value: string) => void;
}

const DecimalField = memo(function DecimalField(props: DecimalFieldProps) {
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
    onFieldFocus,
    onInputChange
  } = props;

  return (
    <StandardTextField
      id={linkId}
      value={input}
      error={!!feedback}
      onFocus={() => onFieldFocus(true)}
      onBlur={() => onFieldFocus(false)}
      onChange={(event) => onInputChange(event.target.value)}
      disabled={readOnly}
      label={displayPrompt}
      placeholder={entryFormat}
      fullWidth
      isTabled={isTabled}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position={'end'}>
            <FadingCheckIcon fadeIn={calcExpUpdated} />
            {displayUnit}
          </InputAdornment>
        )
      }}
      data-test="q-item-decimal-field"
    />
  );
});

export default DecimalField;
