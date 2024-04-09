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
import dayjs from 'dayjs';

const inputMatchRegex = /^\d{2}:\d{2}$/;

export function getTimeSegments(timeInput: string): {
  hourSegment: string | null;
  minuteSegment: string | null;
} {
  if (!inputMatchRegex.test(timeInput)) {
    return { hourSegment: null, minuteSegment: null };
  }

  const timeInputSegments = timeInput.split(':');
  if (timeInputSegments.length !== 2) {
    return { hourSegment: null, minuteSegment: null };
  }

  return { hourSegment: timeInputSegments[0], minuteSegment: timeInputSegments[1] };
}

export function validateTimeInput(
  timeInput: string,
  periodInput: string
): {
  timeIsValid: boolean;
  is24HourNotation: boolean;
} {
  // Test time input is valid
  const { hourSegment, minuteSegment } = getTimeSegments(timeInput);

  if (!hourSegment || !minuteSegment) {
    return { timeIsValid: false, is24HourNotation: false };
  }

  const { hourSegmentValid, is24HourNotation } = validateHourSegment(hourSegment);
  const minuteSegmentValid = validateMinuteSegment(minuteSegment);

  if (!hourSegmentValid || !minuteSegmentValid) {
    return { timeIsValid: false, is24HourNotation: false };
  }

  // Test period input is valid
  if (!(periodInput === 'AM' || periodInput === 'PM' || is24HourNotation)) {
    return { timeIsValid: false, is24HourNotation: false };
  }

  return { timeIsValid: true, is24HourNotation: !!is24HourNotation };
}

export function validateHourSegment(hourSegment: string): {
  hourSegmentValid: boolean;
  is24HourNotation: boolean | null;
} {
  const hour = parseInt(hourSegment, 10);
  const hourSegmentValid = hour >= 0 && hour <= 23;
  const is24HourNotation = hourSegmentValid ? hour >= 13 && hour <= 23 : null;

  return { hourSegmentValid, is24HourNotation };
}

function validateMinuteSegment(minuteSegment: string) {
  const minutes = parseInt(minuteSegment, 10);
  return minutes >= 0 && minutes <= 59;
}

export function parseDateTimeToDisplayTime(dateTime: Dayjs | null): {
  displayTime: string;
  displayPeriod: string;
  timeParseFail?: boolean;
} {
  if (!dateTime) {
    return { displayTime: '', displayPeriod: '' };
  }

  if (!dateTime.isValid()) {
    return { displayTime: '', displayPeriod: '', timeParseFail: true };
  }

  const displayTime = dateTime.format('HH:mm');
  const displayPeriod = dateTime.format('A');

  return { displayTime, displayPeriod };
}

function convertTo12HourFormat(timeInput: string) {
  const timeSegments = timeInput.split(':');
  const hour = parseInt(timeSegments[0], 10);
  if (hour >= 12) {
    timeSegments[0] = `${hour - 12}`;
  }
  return `${timeSegments[0]}:${timeSegments[1]}`;
}

export function parseInputDateTimeToFhirDateTime(
  dateInput: string,
  newTimeInput: string,
  periodInput: string,
  is24HourNotation: boolean
) {
  periodInput = is24HourNotation ? 'PM' : periodInput;
  const new12HourTimeInput = convertTo12HourFormat(newTimeInput);

  const dateTimeDayJs = dayjs(
    `${dateInput} ${new12HourTimeInput} ${periodInput}`,
    `YYYY-MM-DD hh:mm A`
  );

  return dayjs(dateTimeDayJs).format('YYYY-MM-DDTHH:mm:ssZ');
}
