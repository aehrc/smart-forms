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
import type { Dayjs } from 'dayjs';
import { LocalizationProvider, TimePicker as MuiTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TEXT_FIELD_WIDTH } from '../Textfield.styles';

interface TimeFieldProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  onTimeChange: (newValue: Dayjs | null) => unknown;
}

function TimeField(props: TimeFieldProps) {
  const { value, displayPrompt, entryFormat, readOnly, isTabled, onTimeChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiTimePicker
        format={entryFormat !== '' ? entryFormat : 'hh:mm a'}
        value={value}
        disabled={readOnly}
        label={displayPrompt}
        sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160 }}
        slotProps={{
          textField: {
            fullWidth: true
          }
        }}
        onChange={onTimeChange}
      />
    </LocalizationProvider>
  );
}

export default TimeField;
