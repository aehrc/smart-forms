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

import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection
} from '@mui/x-date-pickers/models';
import EventIcon from '@mui/icons-material/Event';
import { IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

interface ButtonFieldProps
  extends BaseSingleInputFieldProps<Dayjs | null, Dayjs, FieldSection, DateValidationError> {
  onOpen?: () => void;
}

function ButtonField(props: ButtonFieldProps) {
  const { onOpen } = props;

  return (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onOpen?.();
      }}>
      <EventIcon fontSize="small" />
    </IconButton>
  );
}

interface PickerWithButtonFieldProps {
  valueString: string;
  anchorEl: HTMLElement | null;
  onSelectDate: (newValueDayjs: Dayjs) => void;
  onFocus: (focus: boolean) => void;
}

function PickerWithButtonField(props: PickerWithButtonFieldProps) {
  const { valueString, anchorEl, onSelectDate, onFocus } = props;

  const [open, setOpen] = useState(false);

  const valueDayJs = valueString ? dayjs(valueString, 'DD/MM/YYYY') : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={valueDayJs ?? null}
        slots={{ field: ButtonField }}
        slotProps={{
          field: {
            onOpen: () => {
              setOpen(!open);
              onFocus(true);
            }
          } as any,
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

export default PickerWithButtonField;
