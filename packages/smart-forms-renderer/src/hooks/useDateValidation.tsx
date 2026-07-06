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

import {
  getDateSeparator,
  getMonthYearFormat,
  getNumOfSeparators,
  validateThreeMatches,
  validateTwoMatches
} from '../components/FormComponents/DateTimeItems/utils/parseDate';
import dayjs from 'dayjs';
import useDateFormat from './useDateFormat';
import { useRendererConfigStore } from '../stores';
import { interpolate } from '../i18n';

// Separators we know how to recognise; anything other than the configured one is rejected.
const knownDateSeparators = ['/', '.', '-'];

function useDateValidation(input: string, parseFail: boolean = false): string {
  const dateFormat = useDateFormat();
  const rendererStrings = useRendererConfigStore.use.rendererStrings();
  const separator = getDateSeparator(dateFormat);
  const monthYearFormat = getMonthYearFormat(dateFormat);

  if (input === '') {
    return '';
  }

  const hasForeignSeparator = knownDateSeparators.some(
    (knownSeparator) => knownSeparator !== separator && input.includes(knownSeparator)
  );
  if (hasForeignSeparator) {
    return interpolate(rendererStrings.dateSeparatorError, { separator });
  }

  const numOfSeparators = getNumOfSeparators(input, separator);

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(input, dateFormat);
    if (!threeMatchesDate.isValid()) {
      return interpolate(rendererStrings.dateFullFormatError, { format: dateFormat });
    }

    const matches = input.split(separator);
    if (!validateThreeMatches(matches[0], matches[1], matches[2], dateFormat)) {
      return rendererStrings.dateInvalidError;
    }

    return '';
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(input, monthYearFormat);
    if (!twoMatchesDate.isValid()) {
      return interpolate(rendererStrings.dateMonthOrFullFormatError, {
        monthYearFormat,
        format: dateFormat
      });
    }

    const matches = input.split(separator);

    if (!validateTwoMatches(matches[0], matches[1])) {
      return rendererStrings.dateInvalidError;
    }

    return '';
  }

  if (input.length === 4) {
    const oneMatchDate = dayjs(input, 'YYYY');
    if (oneMatchDate.isValid()) {
      return '';
    }
  }

  if (parseFail) {
    return rendererStrings.dateInvalidError;
  }

  return rendererStrings.dateUnrecognizedError;
}

export default useDateValidation;
