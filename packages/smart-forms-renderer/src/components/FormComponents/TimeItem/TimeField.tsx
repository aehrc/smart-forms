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

import React, { useRef } from 'react';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import type { Dayjs } from 'dayjs';
import { LocalizationProvider, TimePicker as MuiTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useRendererConfigStore } from '../../../stores';

interface TimeFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  itemText: string | undefined;
  value: Dayjs | null;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  instructionsId: string | undefined;
  onTimeChange: (newValue: Dayjs | null) => unknown;
}

function TimeField(props: TimeFieldProps) {
  const {
    linkId,
    itemType,
    itemText,
    value,
    displayPrompt,
    entryFormat,
    readOnly,
    isTabled,
    instructionsId,
    onTimeChange
  } = props;

  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();
  const groupRef = useRef<HTMLDivElement | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        ref={groupRef}
        role="group"
        tabIndex={0}
        {...(!isTabled && {
          'aria-labelledby': instructionsId
            ? `label-${linkId} ${instructionsId}`
            : `label-${linkId}`
        })}
        {...(isTabled && instructionsId && { 'aria-describedby': instructionsId })}
        {...(isTabled && { 'aria-label': itemText ?? 'Unnamed time field' })}
        style={{
          display: 'inline-block',
          maxWidth: !isTabled ? textFieldWidth : 3000,
          minWidth: 160,
          width: isTabled ? '100%' : 'fit-content'
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const focusTarget =
              groupRef.current?.querySelector<HTMLElement>('[role="spinbutton"]') ??
              groupRef.current?.querySelector<HTMLElement>('input');
            focusTarget?.focus();
          }
        }}
        data-test="q-item-time-field">
        <MuiTimePicker
          // TODO no way to add an id attribute to this time input field
          // TODO ignore this - we will be creating our own custom time field anyway
          name={itemType + '-' + linkId}
          format={entryFormat !== '' ? entryFormat : 'hh:mm a'}
          value={value}
          disabled={readOnly}
          label={displayPrompt || itemText || 'Time'}
          sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160 }}
          slotProps={{
            field: {
              ...(instructionsId && { 'aria-describedby': instructionsId }),
              ...(isTabled
                ? { 'aria-label': itemText ?? 'Unnamed time field' }
                : { 'aria-labelledby': `label-${linkId}` })
            } as any,
            textField: {
              fullWidth: true,
              slotProps: {
                htmlInput: {
                  ...(instructionsId && { 'aria-describedby': instructionsId }),
                  ...(isTabled
                    ? { 'aria-label': itemText ?? 'Unnamed time field' }
                    : { 'aria-labelledby': `label-${linkId}` })
                }
              }
            }
            // EndAdornment not available here
          }}
          onChange={onTimeChange}
        />
      </div>
    </LocalizationProvider>
  );
}

export default TimeField;
