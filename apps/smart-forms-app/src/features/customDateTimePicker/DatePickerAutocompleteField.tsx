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

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { MutableRefObject } from 'react';
import { useRef, useState } from 'react';
import useParseDates from './hooks/useParseDates.ts';
import Autocomplete from '@mui/material/Autocomplete';
import { StandardTextField } from '@aehrc/smart-forms-renderer/lib/components/FormComponents/Textfield.styles';
import PickerWithButtonField from './lib/DatePickerButton.tsx';
import { Box } from '@mui/material';
import { replaceMonthNameWithNumber } from './lib/parseDates.ts';

interface DatePickerAutocompleteFieldProps {
  value: string;
  onValueChange: (value: string) => void;
}

function DatePickerAutocompleteField(props: DatePickerAutocompleteFieldProps) {
  const { value, onValueChange } = props;

  const anchorRef: MutableRefObject<null | HTMLElement> = useRef(null);

  const [input, setInput] = useState(value);
  const [focused, setFocused] = useState(false);

  let options: string[] = [];
  const { dateOptions, seperator } = useParseDates(input);
  if (dateOptions) {
    options = dateOptions;
  }

  function handleUnfocus() {
    const replacedInput = replaceMonthNameWithNumber(input);
    const matchedOption = options.find((option) => replacedInput === option);
    if (matchedOption) {
      onValueChange(matchedOption.replaceAll(seperator, '/'));
    }

    setFocused(false);
  }

  return (
    <Box display="flex">
      <Autocomplete
        ref={anchorRef}
        value={value ?? ''}
        options={options}
        filterOptions={(options) => options} // show all options, we are using regex to limit options
        freeSolo
        clearOnEscape
        disableClearable
        autoHighlight
        onBlur={handleUnfocus}
        onFocus={() => setFocused(true)}
        // sx={{ maxWidth: !false ? 280 : 3000, minWidth: 220, flexGrow: 1 }}
        onChange={(_, newValue) => {
          if (seperator) {
            newValue = newValue.replaceAll(seperator, '/');
          }

          return onValueChange(newValue);
        }}
        getOptionLabel={(option) => {
          const threeMatchesOption = dayjs(option, `DD${seperator}MM${seperator}YYYY`);
          if (threeMatchesOption.isValid()) {
            return threeMatchesOption.format('DD MMM YYYY');
          }

          const twoMatchesOption = dayjs(option, [`MM${seperator}YYYY`]);
          if (twoMatchesOption.isValid()) {
            return twoMatchesOption.format('MMM YYYY');
          }

          const oneMatchOption = dayjs(option, `YYYY`);
          if (oneMatchOption.isValid()) {
            return option;
          }

          return '';
        }}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            focused={focused}
            isTabled={false}
            placeholder="DD/MM/YYYY"
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            sx={{ maxWidth: 280, minWidth: 160 }}
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <Box>
                  <PickerWithButtonField
                    valueString={value}
                    anchorEl={anchorRef.current}
                    onSelectDate={(valueDayjs: Dayjs) => {
                      const valueInString = valueDayjs.format('DD/MM/YYYY');
                      setInput(valueInString);
                      onValueChange(valueInString);
                    }}
                    onFocus={(focus) => setFocused(focus)}
                  />
                  {params.InputProps.endAdornment}
                </Box>
              )
            }}
          />
        )}
      />
    </Box>
  );
}

export default DatePickerAutocompleteField;
