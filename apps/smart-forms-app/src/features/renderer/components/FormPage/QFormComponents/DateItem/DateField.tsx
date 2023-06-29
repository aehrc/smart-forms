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

import { memo } from 'react';
import { PropsWithIsTabledAttribute } from '../../../../types/renderProps.interface.ts';
import { Dayjs } from 'dayjs';
import { DateField as MuiDateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface DateFieldProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  onDateChange: (newValue: Dayjs | null) => unknown;
}

const DateField = memo(function DateField(props: DateFieldProps) {
  const { value, displayPrompt, entryFormat, readOnly, isTabled, onDateChange } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDateField
        format={entryFormat !== '' ? entryFormat : 'DD/MM/YYYY'}
        value={value}
        fullWidth
        disabled={readOnly}
        label={displayPrompt}
        sx={{ maxWidth: !isTabled ? 280 : 3000 }}
        onChange={onDateChange}
        data-test="q-item-date-field"
      />
    </LocalizationProvider>
  );
});

export default DateField;
