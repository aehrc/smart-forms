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

import { getNumOfSeparators } from '../components/FormComponents/DateTimeItems/utils/parseDate';
import dayjs from 'dayjs';
import { validateTimeInput } from '../components/FormComponents/DateTimeItems/utils/parseTime';

function useTimeValidation(
  timeInput: string,
  periodInput: string,
  parseFail: boolean = false
): { timeFeedback: string | null; is24HourNotation: boolean } {
  if (timeInput === '') {
    return { timeFeedback: null, is24HourNotation: false };
  }

  if (timeInput.includes('.')) {
    return {
      timeFeedback: 'Input does not match the required format with ":" as the separator.',
      is24HourNotation: false
    };
  }

  if (timeInput.length !== 5 || !timeInput.includes(':')) {
    return { timeFeedback: 'Input does not match the format HH:MM.', is24HourNotation: false };
  }

  const numOfSeparators = getNumOfSeparators(timeInput, ':');

  if (numOfSeparators === 1) {
    const timeDayJs = dayjs(timeInput, `hh:mm`);
    if (!timeDayJs.isValid()) {
      return { timeFeedback: 'Input does not match the format hh:mm.', is24HourNotation: false };
    }

    const { timeIsValid, is24HourNotation } = validateTimeInput(timeInput, periodInput);

    if (periodInput === '' && !is24HourNotation) {
      return { timeFeedback: 'Specify the period as AM or PM.', is24HourNotation: false };
    }

    if (!timeIsValid) {
      return { timeFeedback: 'Input is an invalid time.', is24HourNotation: false };
    }

    return { timeFeedback: null, is24HourNotation };
  }

  if (parseFail) {
    return { timeFeedback: 'Input is an invalid time.', is24HourNotation: false };
  }

  return { timeFeedback: 'Input is an invalid time.', is24HourNotation: false };
}

export default useTimeValidation;
