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
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import React, { useRef } from 'react';
import type { PropsWithIsTabledRequiredAttribute } from '../../../../interfaces/renderProps.interface';
import { StandardTextField } from '../../Textfield.styles';
import DatePicker from './DatePicker';
import Tooltip from '@mui/material/Tooltip';
import { useRendererStylingStore } from '../../../../stores';

interface CustomDateFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  itemText: string | undefined;
  valueDate: string;
  input: string;
  feedback: string;
  isFocused: boolean;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  isPartOfDateTime: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  onInputChange: (newInput: string) => void;
  onDateBlur: () => void;
  onSelectDate: (newDateValue: string) => void;
}

function CustomDateField(props: CustomDateFieldProps) {
  const {
    linkId,
    itemType,
    itemText,
    valueDate,
    input,
    feedback,
    isFocused,
    displayPrompt,
    entryFormat,
    readOnly,
    isPartOfDateTime,
    isTabled,
    setFocused,
    onInputChange,
    onDateBlur,
    onSelectDate
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const anchorRef = useRef<HTMLDivElement | null>(null);

  // If this reusable date field is part of a DateTime component, the id should be appended with '-date'
  const id = isPartOfDateTime ? itemType + '-' + linkId + '-date' : itemType + '-' + linkId;

  return (
    <Tooltip title={null}>
      <StandardTextField
        {...(!isTabled && { id: id })}
        ref={anchorRef}
        fullWidth
        textFieldWidth={textFieldWidth}
        isTabled={isTabled}
        value={input}
        error={!!feedback}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
        label={displayPrompt}
        placeholder={entryFormat !== '' ? entryFormat : 'DD/MM/YYYY'}
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        size="small"
        focused={isFocused}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          onDateBlur();
          setFocused(false);
        }}
        slotProps={{
          input: {
            readOnly: readOnly && readOnlyVisualStyle === 'readonly',
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
            ),
            inputProps: {
              ...(isTabled ? {} : { 'aria-label': itemText ?? `Unnamed ${itemType} item` })
            }
          }
        }}
        helperText={isTabled ? '' : feedback}
      />
    </Tooltip>
  );
}

export default CustomDateField;
