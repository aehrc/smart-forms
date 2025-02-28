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
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import InputAdornment from '@mui/material/InputAdornment';
import { StandardTextField } from '../Textfield.styles';
import { useRendererStylingStore } from '../../../stores';
import Typography from '@mui/material/Typography';

interface UrlFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
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
    onInputChange
  } = props;

  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  return (
    <StandardTextField
      id={itemType + '-' + linkId}
      fullWidth
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}
      value={input}
      error={!!feedback}
      onChange={(event) => onInputChange(event.target.value)}
      label={displayPrompt}
      placeholder={entryFormat}
      disabled={readOnly}
      size="small"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Typography color={readOnly ? 'text.disabled' : 'text.secondary'}>
              {displayUnit}
            </Typography>
          </InputAdornment>
        )
      }}
      helperText={feedback}
      data-test="q-item-url-field"
    />
  );
}

export default UrlField;
