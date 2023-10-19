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

import { Dayjs } from 'dayjs';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import React, { useRef } from 'react';
import useParseDates from './hooks/useParseDates';
import Autocomplete from '@mui/material/Autocomplete';
import { Box } from '@mui/material';
import type { PropsWithIsTabledAttribute } from '../../../../interfaces/renderProps.interface';
import { StandardTextField } from '../../Textfield.styles';
import DatePicker from './DatePicker';
import { getDateOptionLabel } from './utils/parseDates';

interface CustomDateFieldProps extends PropsWithIsTabledAttribute {
  valueDate: string;
  input: string;
  isFocused: boolean;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  onInputChange: (newInput: string) => void;
  onValueChange: (newDateValue: string) => void;
  onUnfocus?: () => void;
}

function CustomDateField(props: CustomDateFieldProps) {
  const {
    valueDate,
    input,
    isFocused,
    displayPrompt,
    entryFormat,
    readOnly,
    isTabled,
    setFocused,
    onInputChange,
    onValueChange,
    onUnfocus
  } = props;

  const anchorRef: MutableRefObject<null | HTMLElement> = useRef(null);

  let options: string[] = [];
  const { dateOptions, seperator } = useParseDates(input);
  if (dateOptions) {
    options = dateOptions;
  }

  return (
    <Box display="flex">
      <Autocomplete
        ref={anchorRef}
        value={valueDate}
        size="small"
        options={options}
        disabled={readOnly}
        filterOptions={(options) => options} // show all options, we are using regex to limit options
        freeSolo
        clearOnEscape
        disableClearable
        autoHighlight
        onFocus={() => setFocused(true)}
        sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 220, flexGrow: 1 }}
        onChange={(_, newValue) => {
          return onValueChange(newValue);
        }}
        getOptionLabel={(option) => getDateOptionLabel(option, seperator)}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            value={input}
            onBlur={onUnfocus}
            focused={isFocused}
            isTabled={isTabled}
            label={displayPrompt}
            size="small"
            placeholder={entryFormat !== '' ? entryFormat : 'DD/MM/YYYY'}
            onChange={(e) => onInputChange(e.target.value)}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  <DatePicker
                    valueString={valueDate}
                    anchorEl={anchorRef.current}
                    onSelectDate={(valueDayjs: Dayjs) => {
                      const valueInString = valueDayjs.format('DD/MM/YYYY');
                      onValueChange(valueInString);
                    }}
                    onFocus={(focus) => setFocused(focus)}
                  />
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </Box>
  );
}

export default CustomDateField;
