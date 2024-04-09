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
import type {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection
} from '@mui/x-date-pickers/models';
import type { Dayjs } from 'dayjs';
import IconButton from '@mui/material/IconButton';
import EventIcon from '@mui/icons-material/Event';

interface DatePickerButtonProps
  extends BaseSingleInputFieldProps<Dayjs | null, Dayjs, FieldSection, DateValidationError> {
  onOpen?: () => void;
  readOnly?: boolean;
}

function DatePickerButton(props: DatePickerButtonProps) {
  const { onOpen, readOnly } = props;

  return (
    <IconButton
      sx={{ height: 30, width: 30 }}
      disabled={readOnly}
      onClick={(e) => {
        e.stopPropagation();
        onOpen?.();
      }}>
      <EventIcon fontSize="small" />
    </IconButton>
  );
}

export default DatePickerButton;
