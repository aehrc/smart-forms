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

import {
  getNumOfSeparators,
  validateThreeMatches,
  validateTwoMatches
} from '../components/FormComponents/DateTimeItems/utils/parseDate';
import dayjs from 'dayjs';

function useDateValidation(input: string, parseFail: boolean = false): string | null {
  if (input === '') {
    return null;
  }

  if (input.includes('-')) {
    return 'Input does not match the required format with "/" as the separator.';
  }

  const numOfSeparators = getNumOfSeparators(input, '/');

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(input, `DD/MM/YYYY`);
    if (!threeMatchesDate.isValid()) {
      return 'Input does not match the format DD/MM/YYYY.';
    }

    const matches = input.split('/');
    if (!validateThreeMatches(matches[0], matches[1], matches[2])) {
      return 'Input is an invalid date.';
    }

    return null;
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(input, `MM/YYYY`);
    if (!twoMatchesDate.isValid()) {
      return 'Input does not match the formats MM/YYYY or DD/MM/YYYY.';
    }

    const matches = input.split('/');

    if (!validateTwoMatches(matches[0], matches[1])) {
      return 'Input is an invalid date.';
    }

    return null;
  }

  if (input.length === 4) {
    const oneMatchDate = dayjs(input, 'YYYY');
    if (oneMatchDate.isValid()) {
      return null;
    }
  }

  if (parseFail) {
    return 'Input is an invalid date.';
  }

  return 'Input does not match any date format.';
}

export default useDateValidation;
