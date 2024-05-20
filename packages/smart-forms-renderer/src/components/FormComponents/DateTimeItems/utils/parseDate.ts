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

import dayjs from 'dayjs';

const inputMatchRegex = /(\d{4}|\d{3}|\d{2})/g;

export function validateDateInput(input: string) {
  const matches = input.match(inputMatchRegex);

  if (!matches) {
    return false;
  }

  const separator = input.includes('/') ? '/' : null;

  if (matches.length === 1) {
    // separator not supposed to be present if only one match present
    if (separator) {
      return false;
    }

    return matches[0].length === 4;
  }

  // Invalid if separator is not present
  if (!separator) {
    return false;
  }

  // Invalid if num of slots don't match the number of regex matches
  const slotsMatched = input.split(separator);
  if (slotsMatched.length != matches.length) {
    return false;
  }

  // Handle MM/YYYY format
  if (matches.length === 2) {
    return validateTwoMatches(matches[0], matches[1]);
  }

  // Handle DD/MM/YYYY format
  if (matches.length === 3) {
    return validateThreeMatches(matches[0], matches[1], matches[2]);
  }

  return false;
}

export function validateTwoMatches(monthInput: string, yearInput: string) {
  const monthNum = parseInt(monthInput, 10);
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  return (monthInput.length === 1 || monthInput.length === 2) && yearInput.length === 4;
}

export function validateThreeMatches(dayInput: string, monthInput: string, yearInput: string) {
  const dayNum = parseInt(dayInput, 10);
  if (dayNum < 1 || dayNum > 31) {
    return false;
  }

  const monthNum = parseInt(monthInput, 10);
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  return (
    (dayInput.length === 1 || dayInput.length === 2) &&
    (monthInput.length === 1 || monthInput.length === 2) &&
    yearInput.length === 4
  );
}

export function getNumOfSeparators(valueDate: string, seperator: string) {
  const regex = new RegExp(seperator, 'g');
  return [...valueDate.matchAll(regex)].length;
}

/**
 * Parse a FHIR date string to a date to be consumed and displayed by the DateItem component.
 *
 * @author Sean Fong
 */
export function parseFhirDateToDisplayDate(fhirDate: string): {
  displayDate: string;
  dateParseFail?: boolean;
} {
  if (fhirDate.length === 0) {
    return { displayDate: '' };
  }

  const numOfSeparators = getNumOfSeparators(fhirDate, '-');

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(fhirDate, `YYYY-MM-DD`);
    if (threeMatchesDate.isValid()) {
      return { displayDate: threeMatchesDate.format('DD/MM/YYYY') };
    }
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(fhirDate, `YYYY-MM`);
    if (twoMatchesDate.isValid()) {
      return { displayDate: twoMatchesDate.format('MM/YYYY') };
    }
  }

  const oneMatchDate = dayjs(fhirDate, `YYYY`);
  if (oneMatchDate.isValid()) {
    return { displayDate: oneMatchDate.format('YYYY') };
  }

  return { displayDate: fhirDate, dateParseFail: true };
}

export function parseInputDateToFhirDate(displayDate: string) {
  const numOfSeparators = getNumOfSeparators(displayDate, '/');

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(displayDate, `DD/MM/YYYY`);
    if (threeMatchesDate.isValid()) {
      return threeMatchesDate.format('YYYY-MM-DD');
    }
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(displayDate, `MM/YYYY`);
    if (twoMatchesDate.isValid()) {
      return twoMatchesDate.format('YYYY-MM');
    }
  }

  if (displayDate.length === 4) {
    const oneMatchDate = dayjs(displayDate, 'YYYY');
    if (oneMatchDate.isValid()) {
      return displayDate;
    }
  }

  // Default to YYYY-MM-DD format if all else fails
  return dayjs(displayDate).format('YYYY-MM-DD');
}
