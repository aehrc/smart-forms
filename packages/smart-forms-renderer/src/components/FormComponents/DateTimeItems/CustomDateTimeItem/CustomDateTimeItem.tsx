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
import type { BaseItemProps } from '../../../../interfaces/renderProps.interface';
import useReadOnly from '../../../../hooks/useReadOnly';
import { FullWidthFormComponentBox } from '../../../Box.styles';
import ItemFieldGrid from '../../ItemParts/ItemFieldGrid';
import { createEmptyQrItem } from '../../../../utils/qrItem';
import useDateValidation from '../../../../hooks/useDateValidation';
import { useQuestionnaireStore } from '../../../../stores';
import { parseFhirDateToDisplayDate } from '../utils';
import { parseInputDateToFhirDate, validateDateInput } from '../utils/parseDate';
import Stack from '@mui/material/Stack';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  parseDateTimeToDisplayTime,
  parseInputDateTimeToFhirDateTime,
  validateTimeInput
} from '../utils/parseTime';
import useTimeValidation from '../../../../hooks/useTimeValidation';
import useDateNonEmptyValidation from '../../../../hooks/useDateTimeNonEmpty';
import DateTimeField from './DateTimeField';
import ItemLabel from '../../ItemParts/ItemLabel';

interface CustomDateTimeItemProps extends BaseItemProps {}

function CustomDateTimeItem(props: CustomDateTimeItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayPrompt, entryFormat } = renderingExtensions;

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrDateTime = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueDate: string = '';
  let dateTimeDayJs: Dayjs | null = null;
  if (qrDateTime.answer) {
    let tempDateTime = '';
    if (qrDateTime.answer[0].valueDate) {
      tempDateTime = qrDateTime.answer[0].valueDate;
    } else if (qrDateTime.answer[0].valueDateTime) {
      tempDateTime = qrDateTime.answer[0].valueDateTime;
    }

    // split date and time at "T", 2015-02-07T13:28:17-05:00
    if (tempDateTime.includes('T')) {
      valueDate = tempDateTime.split('T')[0];
      dateTimeDayJs = dayjs(tempDateTime);
    } else {
      valueDate = tempDateTime;
    }
  }

  const { displayDate, dateParseFail } = parseFhirDateToDisplayDate(valueDate);
  const { displayTime, displayPeriod, timeParseFail } = parseDateTimeToDisplayTime(dateTimeDayJs);

  const [dateInput, setDateInput] = useState(displayDate);
  const [timeInput, setTimeInput] = useState(displayTime);
  const [periodInput, setPeriodInput] = useState(displayPeriod);
  const [dateFocused, setDateFocused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true); //provides a way to hide the feedback when the user is typing

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
    setShowFeedback(false);

    if (newDateInput === '') {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    if (!validateDateInput(newDateInput)) {
      return;
    }

    updateQRDateTime(newDateInput, timeInput, periodInput, is24HourNotation);
  }
  function handleDateBlur() {
    setShowFeedback(true);
  }

  function handleTimeInputChange(newTimeInput: string, newPeriodInput: string) {
    setTimeInput(newTimeInput);
    setPeriodInput(newPeriodInput);
    setShowFeedback(false);

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

  function handleTimeBlur() {
    setShowFeedback(true);
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

  // FIXME entryFormat and displayPrompt, put them beneath the entire component instead of at the date field

  if (isRepeated) {
    return (
      <Stack>
        <DateTimeField
          linkId={qItem.linkId}
          itemType={qItem.type}
          displayDate={displayDate}
          dateInput={dateInput}
          timeInput={timeInput}
          periodInput={periodInput}
          is24HourNotation={is24HourNotation}
          dateFeedback={showFeedback ? (dateFeedback ?? '') : ''}
          timeFeedback={showFeedback ? (timeFeedback ?? '') : ''}
          dateFocused={dateFocused}
          displayPrompt={displayPrompt}
          entryFormat={entryFormat}
          readOnly={readOnly}
          isTabled={isTabled}
          onDateInputChange={handleDateInputChange}
          onSelectDate={handleSelectDate}
          setDateFocused={setDateFocused}
          onTimeInputChange={handleTimeInputChange}
          onDateBlur={handleDateBlur}
          onTimeBlur={handleTimeBlur}
          showFeedback={showFeedback}
        />
      </Stack>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-datetime-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <DateTimeField
            linkId={qItem.linkId}
            itemType={qItem.type}
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
            isTabled={isTabled}
            onDateInputChange={handleDateInputChange}
            onSelectDate={handleSelectDate}
            setDateFocused={setDateFocused}
            onTimeInputChange={handleTimeInputChange}
            onDateBlur={handleDateBlur}
            onTimeBlur={handleTimeBlur}
            showFeedback={showFeedback}
          />
        }
        dateFeedback={dateFeedback ?? undefined}
        timeFeedback={timeFeedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default CustomDateTimeItem;
