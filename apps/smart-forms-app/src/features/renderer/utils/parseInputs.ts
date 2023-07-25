/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import moment from 'moment';

export function parseValidInteger(input: string): number {
  const validNumericString = parseValidNumericString(input);

  return parseInt(validNumericString);
}

export function parseValidNumericString(input: string): string {
  const hasNumber = /\d/;
  if (!hasNumber.test(input)) {
    return '0';
  }

  return input;
}

export function parseDecimalStringWithPrecision(input: string, precision: number | null): string {
  input = parseValidNumericString(input);

  let parsedInput = parseFloat(input).toString();

  // restore decimal digits if parseFloat() removes them
  const decimalPoint = input.indexOf('.');
  if (decimalPoint !== -1) {
    const decimalDigits = input.slice(decimalPoint);
    if (parsedInput.indexOf('.') === -1) {
      parsedInput += decimalDigits;
    }
  }

  // truncate decimal digits based on precision
  const parsedDecimalPoint = input.indexOf('.');
  if (precision && parsedDecimalPoint !== -1) {
    parsedInput = parsedInput.substring(0, parsedDecimalPoint + precision + 1);
  }

  return parsedInput;
}

export function parseDecimalStringToFloat(input: string, precision: number): number {
  return parseFloat(parseFloat(input).toFixed(precision));
}

export function checkStringIsDate(value: string): boolean {
  const acceptedFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'];
  return dayjs(value, acceptedFormats, true).isValid();
}

export function checkStringIsDateTime(value: string): boolean {
  const acceptedFormats = ['YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ'];
  return moment(value, acceptedFormats, true).isValid();
}
