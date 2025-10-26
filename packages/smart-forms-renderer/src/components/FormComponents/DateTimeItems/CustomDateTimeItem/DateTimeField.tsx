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

import Stack from '@mui/material/Stack';
import type { Dispatch, SetStateAction } from 'react';
import type { PropsWithIsTabledAttribute } from '../../../../interfaces/renderProps.interface';
import CustomDateField from '../CustomDateItem/CustomDateField';
import CustomTimeField from './CustomTimeField';

interface DateTimeFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  itemText: string | undefined;
  displayDate: string;
  dateInput: string;
  timeInput: string;
  periodInput: string;
  is24HourNotation: boolean;
  dateFeedback: string;
  timeFeedback: string;
  dateFocused: boolean;
  displayPrompt: string;
  entryFormat: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onDateInputChange: (newDateInput: string) => void;
  onSelectDate: (selectedDate: string) => void;
  setDateFocused: Dispatch<SetStateAction<boolean>>;
  onTimeInputChange: (newTimeInput: string, newPeriodInput: string) => void;
}

function DateTimeField(props: DateTimeFieldProps) {
  const {
    linkId,
    itemType,
    itemText,
    displayDate,
    dateInput,
    timeInput,
    periodInput,
    is24HourNotation,
    dateFeedback,
    timeFeedback,
    dateFocused,
    displayPrompt,
    entryFormat,
    readOnly,
    calcExpUpdated,
    isTabled,
    onDateInputChange,
    onSelectDate,
    setDateFocused,
    onTimeInputChange
  } = props;

  return (
    <Stack id={itemType + '-' + linkId} rowGap={1}>
      <CustomDateField
        linkId={linkId}
        itemType={itemType}
        itemText={itemText}
        valueDate={displayDate}
        input={dateInput}
        feedback={dateFeedback ?? ''}
        isFocused={dateFocused}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isPartOfDateTime={true}
        isTabled={isTabled}
        setFocused={setDateFocused}
        onInputChange={onDateInputChange}
        onSelectDate={onSelectDate}
      />
      <CustomTimeField
        linkId={linkId}
        itemType={itemType}
        timeInput={timeInput}
        periodInput={periodInput}
        is24HourNotation={is24HourNotation}
        feedback={timeFeedback ?? ''}
        displayPrompt={displayPrompt}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isPartOfDateTime={true}
        isTabled={isTabled}
        onTimeInputChange={(newTimeInput) => onTimeInputChange(newTimeInput, periodInput)}
        onPeriodChange={(newPeriodInput) => onTimeInputChange(timeInput, newPeriodInput)}
      />
    </Stack>
  );
}

export default DateTimeField;
