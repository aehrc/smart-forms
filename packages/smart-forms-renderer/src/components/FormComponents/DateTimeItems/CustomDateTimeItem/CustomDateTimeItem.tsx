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
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import useDateNonEmptyValidation from '../../../../hooks/useDateTimeNonEmpty';
import useDateValidation from '../../../../hooks/useDateValidation';
import useReadOnly from '../../../../hooks/useReadOnly';
import useTimeValidation from '../../../../hooks/useTimeValidation';
import type { BaseItemProps } from '../../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../../stores';
import { createEmptyQrItem, getQRItemId } from '../../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../../Box.styles';
import ItemFieldGrid from '../../ItemParts/ItemFieldGrid';
import ItemLabel from '../../ItemParts/ItemLabel';
import { parseFhirDateToDisplayDate } from '../utils';
import { parseInputDateToFhirDate, validateDateInput } from '../utils/parseDate';
import {
  parseDateTimeToDisplayTime,
  parseInputDateTimeToFhirDateTime,
  validateTimeInput
} from '../utils/parseTime';
import DateTimeField from './DateTimeField';

function CustomDateTimeItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    calcExpUpdated,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayPrompt, entryFormat } = renderingExtensions;

  // Init input value
  const answerKey = getQRItemId(qrItem?.answer?.[0]?.id);
  const qrDateTime = qrItem ?? createEmptyQrItem(qItem, answerKey);

  // Store dateTime in FHIR and DayJs formats for downstream parsing
  let valueDateTimeFhir: string = '';
  let dateTimeDayJs: Dayjs | null = null;

  // Seperately store date in FHIR
  let valueDateFhir: string = '';

  // Extract valueDateTimeFhir, dateTimeDayJs and valueDateFhir from qrDateTime
  if (qrDateTime.answer) {
    if (qrDateTime.answer[0].valueDate) {
      // NOTE: valueDate will not contain time, but we should handle it just in case
      valueDateTimeFhir = qrDateTime.answer[0].valueDate;
    } else if (qrDateTime.answer[0].valueDateTime) {
      valueDateTimeFhir = qrDateTime.answer[0].valueDateTime;
    }

    // Split date and time at "T", 2015-02-07T13:28:17-05:00
    if (valueDateTimeFhir.includes('T')) {
      valueDateFhir = valueDateTimeFhir.split('T')[0];
      dateTimeDayJs = dayjs(valueDateTimeFhir);
    }
    // valueDateTimeFhir does not contain "T", that means it's a date only
    else {
      valueDateFhir = valueDateTimeFhir;
    }
  }

  const { displayDate, dateParseFail } = parseFhirDateToDisplayDate(valueDateFhir);
  const { displayTime, displayPeriod, timeParseFail } = parseDateTimeToDisplayTime(dateTimeDayJs);

  const [dateInput, setDateInput] = useState(displayDate);
  const [timeInput, setTimeInput] = useState(displayTime);
  const [periodInput, setPeriodInput] = useState(displayPeriod);
  const [dateFocused, setDateFocused] = useState(false);

  // Perform validation checks
  let dateFeedback = useDateValidation(dateInput, dateParseFail);
  const { timeFeedback, is24HourNotation } = useTimeValidation(
    timeInput,
    periodInput,
    timeParseFail
  );

  dateFeedback = useDateNonEmptyValidation(dateInput, timeInput, dateFeedback, timeFeedback);

  function handleSelectDate(selectedDate: string) {
    setDateInput(selectedDate);
    updateQRDateTime(selectedDate, timeInput, periodInput, is24HourNotation);
  }

  function handleDateInputChange(newDateInput: string) {
    setDateInput(newDateInput);

    if (newDateInput === '') {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    if (!validateDateInput(newDateInput)) {
      return;
    }

    updateQRDateTime(newDateInput, timeInput, periodInput, is24HourNotation);
  }

  function handleTimeInputChange(newTimeInput: string, newPeriodInput: string) {
    setTimeInput(newTimeInput);
    setPeriodInput(newPeriodInput);

    if (newTimeInput === '') {
      updateQRDateTime(dateInput, '', '', false);
      return;
    }

    const { timeIsValid, is24HourNotation } = validateTimeInput(newTimeInput, newPeriodInput);
    if (!validateDateInput(dateInput) || !timeIsValid) {
      return;
    }

    updateQRDateTime(dateInput, newTimeInput, newPeriodInput, is24HourNotation);
  }

  function updateQRDateTime(
    dateInput: string,
    timeInput: string,
    periodInput: string,
    is24HourNotation: boolean
  ) {
    let fhirDateTime = '';
    if (timeInput) {
      fhirDateTime = parseInputDateTimeToFhirDateTime(
        parseInputDateToFhirDate(dateInput),
        timeInput,
        periodInput,
        is24HourNotation
      );
    } else {
      fhirDateTime = parseInputDateToFhirDate(dateInput);
    }

    if (fhirDateTime === 'Invalid Date') {
      return;
    }

    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueDateTime: fhirDateTime }]
    });
  }

  if (isRepeated) {
    return (
      <Stack width="100%">
        <DateTimeField
          linkId={qItem.linkId}
          itemType={qItem.type}
          itemText={qItem.text}
          displayDate={displayDate}
          dateInput={dateInput}
          timeInput={timeInput}
          periodInput={periodInput}
          is24HourNotation={is24HourNotation}
          dateFeedback={dateFeedback ?? ''}
          timeFeedback={timeFeedback ?? ''}
          dateFocused={dateFocused}
          displayPrompt={displayPrompt}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onDateInputChange={handleDateInputChange}
          onSelectDate={handleSelectDate}
          setDateFocused={setDateFocused}
          onTimeInputChange={handleTimeInputChange}
        />
      </Stack>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-datetime-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <DateTimeField
            linkId={qItem.linkId}
            itemType={qItem.type}
            itemText={qItem.text}
            displayDate={displayDate}
            dateInput={dateInput}
            timeInput={timeInput}
            periodInput={periodInput}
            is24HourNotation={is24HourNotation}
            dateFeedback={dateFeedback ?? ''}
            timeFeedback={timeFeedback ?? ''}
            dateFocused={dateFocused}
            displayPrompt={displayPrompt}
            entryFormat={entryFormat}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            onDateInputChange={handleDateInputChange}
            onSelectDate={handleSelectDate}
            setDateFocused={setDateFocused}
            onTimeInputChange={handleTimeInputChange}
          />
        }
        dateFeedback={dateFeedback ?? undefined}
        timeFeedback={timeFeedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default CustomDateTimeItem;
