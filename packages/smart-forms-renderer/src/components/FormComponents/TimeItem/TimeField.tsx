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

import React from 'react';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import type { Dayjs } from 'dayjs';
import { LocalizationProvider, TimePicker as MuiTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useRendererConfigStore } from '../../../stores';

interface TimeFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  value: Dayjs | null;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  onTimeChange: (newValue: Dayjs | null) => unknown;
}

function TimeField(props: TimeFieldProps) {
  const { linkId, itemType, value, displayPrompt, entryFormat, readOnly, isTabled, onTimeChange } =
    props;

  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiTimePicker
        // TODO no way to add an id attribute to this time input field
        // TODO ignore this - we will be creating our own custom time field anyway
        name={itemType + '-' + linkId}
        format={entryFormat !== '' ? entryFormat : 'hh:mm a'}
        value={value}
        disabled={readOnly}
        label={displayPrompt}
        sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160 }}
        slotProps={{
          textField: {
            fullWidth: true
          }
          // EndAdornment not available here
        }}
        onChange={onTimeChange}
      />
    </LocalizationProvider>
  );
}

export default TimeField;
