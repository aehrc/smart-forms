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

import React, { useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import MuiDatePicker from './MuiDatePicker';
import DatePickerButton from './DatePickerButton';

interface DatePickerProps {
  valueString: string;
  readOnly: boolean;
  anchorEl: HTMLElement | null;
  onSelectDate: (newValueDayjs: Dayjs) => void;
  onFocus: (focus: boolean) => void;
}

function DatePicker(props: DatePickerProps) {
  const { valueString, readOnly, anchorEl, onSelectDate, onFocus } = props;

  const [open, setOpen] = useState(false);

  const valueDayJs = valueString ? dayjs(valueString, 'DD/MM/YYYY') : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker
        value={valueDayJs ?? null}
        disabled={readOnly}
        slots={{ field: DatePickerButton }}
        slotProps={{
          field: {
            onOpen: () => {
              setOpen(!open);
              onFocus(true);
            },
            readOnly: readOnly
          } as any,
          textField: {
            size: 'small'
          },
          popper: {
            anchorEl: () => anchorEl as HTMLElement
          }
        }}
        open={open}
        onClose={() => {
          setOpen(false);
          onFocus(false);
        }}
        onChange={(newValue) => {
          if (!newValue) {
            return;
          }

          onSelectDate(newValue);
          onFocus(false);
        }}
      />
    </LocalizationProvider>
  );
}

export default DatePicker;
