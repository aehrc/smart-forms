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

import type { Dayjs } from 'dayjs';
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import React, { useRef } from 'react';
import type { PropsWithIsTabledAttribute } from '../../../../interfaces/renderProps.interface';
import { StandardTextField } from '../../Textfield.styles';
import DatePicker from './DatePicker';
import Tooltip from '@mui/material/Tooltip';

interface CustomDateFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  valueDate: string;
  input: string;
  feedback: string;
  isFocused: boolean;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  onInputChange: (newInput: string) => void;
  onSelectDate: (newDateValue: string) => void;
}

function CustomDateField(props: CustomDateFieldProps) {
  const {
    linkId,
    valueDate,
    input,
    feedback,
    isFocused,
    displayPrompt,
    entryFormat,
    readOnly,
    isTabled,
    setFocused,
    onInputChange,
    onSelectDate
  } = props;

  const anchorRef: RefObject<HTMLDivElement> = useRef(null);

  return (
    <Tooltip title={isTabled ? feedback : ''}>
      <StandardTextField
        id={linkId + '-date'}
        ref={anchorRef}
        fullWidth
        isTabled={isTabled}
        value={input}
        error={!!feedback}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
        label={displayPrompt}
        placeholder={entryFormat !== '' ? entryFormat : 'DD/MM/YYYY'}
        disabled={readOnly}
        size="small"
        focused={isFocused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        InputProps={{
          endAdornment: (
            <>
              <DatePicker
                valueString={valueDate}
                readOnly={readOnly}
                anchorEl={anchorRef.current}
                onSelectDate={(valueDayjs: Dayjs) => {
                  onSelectDate(valueDayjs.format('DD/MM/YYYY'));
                }}
                onFocus={(focus) => setFocused(focus)}
              />
            </>
          )
        }}
        helperText={isTabled ? '' : feedback}
      />
    </Tooltip>
  );
}

export default CustomDateField;
