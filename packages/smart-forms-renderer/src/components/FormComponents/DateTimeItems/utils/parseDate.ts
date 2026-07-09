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

import dayjs from 'dayjs';
import { rendererConfigStore } from '../../../../stores';

const inputMatchRegex = /(\d{4}|\d{3}|\d{2})/g;

const fallbackDateFormat = 'DD/MM/YYYY';

/**
 * Derives a dayjs full-date format from a locale using the built-in `Intl.DateTimeFormat`,
 * which carries data for every locale (no locale imports/bundle needed).
 * For example `de-CH` -> `DD.MM.YYYY`, `en-US` -> `MM/DD/YYYY`, `ja-JP` -> `YYYY/MM/DD`.
 *
 * Returns `undefined` for an invalid locale, or if the locale's short date uses anything other
 * than day/month/year separated by punctuation (in which case the caller falls back).
 */
function deriveDateFormatFromLocale(locale: string): string | undefined {
  let format: string;
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      numberingSystem: 'latn' // keep Latin digits so the format stays dayjs-parseable
    }).formatToParts(new Date(Date.UTC(2000, 0, 2)));

    format = parts
      .map((part) => {
        if (part.type === 'day') return 'DD';
        if (part.type === 'month') return 'MM';
        if (part.type === 'year') return 'YYYY';
        return part.value;
      })
      .join('');
  } catch {
    return undefined;
  }

  const hasAllTokens = format.includes('DD') && format.includes('MM') && format.includes('YYYY');
  const onlySeparatorsRemain = /^[^A-Za-z0-9]*$/.test(format.replace(/DD|MM|YYYY/g, ''));

  return hasAllTokens && onlySeparatorsRemain ? format : undefined;
}

/**
 * Resolves the full-date input/display format from an optional explicit override and the active locale.
 *
 * Resolution order:
 * 1. `override` (the `dateFormat` renderer string), if set;
 * 2. the locale's short-date format, derived via `Intl` (e.g. `de-CH` -> `DD.MM.YYYY`);
 * 3. `DD/MM/YYYY` as a final fallback (no locale, or an unusable locale format).
 */
export function resolveDateFormat(locale?: string, override?: string): string {
  if (override) {
    return override;
  }

  if (locale) {
    const localeFormat = deriveDateFormatFromLocale(locale);
    if (localeFormat) {
      return localeFormat;
    }
  }

  return fallbackDateFormat;
}

/**
 * The full-date input/display format currently configured on the renderer, e.g.
 * `DD/MM/YYYY` (default) or `DD.MM.YYYY` (Switzerland). Reads from the renderer config store;
 * use {@link resolveDateFormat} directly in React components so they re-render on config changes.
 */
export function getDateFormat(): string {
  const { locale, rendererStrings } = rendererConfigStore.getState();
  return resolveDateFormat(locale, rendererStrings.dateFormat);
}

/**
 * Derives the single separator character from a date format string.
 * For example `DD.MM.YYYY` -> `.`, `DD/MM/YYYY` -> `/`. Falls back to `/`.
 */
export function getDateSeparator(dateFormat: string): string {
  const separators = dateFormat.replace(/[DMY]/g, '');
  return separators.charAt(0) || '/';
}

/**
 * Derives the month-year format from a full-date format string.
 * For example `DD.MM.YYYY` -> `MM.YYYY`.
 */
export function getMonthYearFormat(dateFormat: string): string {
  return `MM${getDateSeparator(dateFormat)}YYYY`;
}

/**
 * Derives the day/month/year token order of a date format.
 * For example `DD/MM/YYYY` -> `['D', 'M', 'Y']`, `MM/DD/YYYY` (US) -> `['M', 'D', 'Y']`.
 */
export function getDateTokenOrder(dateFormat: string): Array<'D' | 'M' | 'Y'> {
  const order: Array<'D' | 'M' | 'Y'> = [];
  for (const char of dateFormat) {
    if ((char === 'D' || char === 'M' || char === 'Y') && !order.includes(char)) {
      order.push(char);
    }
  }
  return order;
}

/**
 * Maps positional date parts (in the order they appear in the input/format) to day/month/year
 * using the token order of `dateFormat`. For a US format `MM/DD/YYYY`, `['03', '15', '2024']`
 * maps to `{ month: '03', day: '15', year: '2024' }`.
 */
export function orderDateParts(
  parts: string[],
  dateFormat: string
): { day: string; month: string; year: string } {
  const order = getDateTokenOrder(dateFormat);
  const result = { day: '', month: '', year: '' };
  order.forEach((token, index) => {
    const part = parts[index] ?? '';
    if (token === 'D') {
      result.day = part;
    } else if (token === 'M') {
      result.month = part;
    } else {
      result.year = part;
    }
  });
  return result;
}

/** Escapes a string for safe use as a literal inside a RegExp (e.g. `.` -> `\.`). */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateDateInput(input: string) {
  const matches = input.match(inputMatchRegex);

  if (!matches) {
    return false;
  }

  const dateFormat = getDateFormat();
  const dateSeparator = getDateSeparator(dateFormat);
  const separator = input.includes(dateSeparator) ? dateSeparator : null;

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

  // Handle full-date format (e.g. DD/MM/YYYY or MM/DD/YYYY)
  if (matches.length === 3) {
    return validateThreeMatches(matches[0], matches[1], matches[2], dateFormat);
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

/**
 * Validates the three positional parts of a full date (in the order they appear in the input),
 * mapping them to day/month/year according to `dateFormat`. This makes validation work for
 * day-first (`DD/MM/YYYY`), month-first (`MM/DD/YYYY`, US) and year-first formats alike.
 */
export function validateThreeMatches(
  firstInput: string,
  secondInput: string,
  thirdInput: string,
  dateFormat: string
) {
  const { day, month, year } = orderDateParts([firstInput, secondInput, thirdInput], dateFormat);

  const dayNum = parseInt(day, 10);
  if (dayNum < 1 || dayNum > 31) {
    return false;
  }

  const monthNum = parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  return (
    (day.length === 1 || day.length === 2) &&
    (month.length === 1 || month.length === 2) &&
    year.length === 4
  );
}

export function getNumOfSeparators(valueDate: string, seperator: string) {
  const regex = new RegExp(escapeRegExp(seperator), 'g');
  return [...valueDate.matchAll(regex)].length;
}

/**
 * Parse a FHIR date string to a human-readable display format.
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

  const dateFormat = getDateFormat();
  const numOfSeparators = getNumOfSeparators(fhirDate, '-');

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(fhirDate, `YYYY-MM-DD`);
    if (threeMatchesDate.isValid()) {
      return { displayDate: threeMatchesDate.format(dateFormat) };
    }
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(fhirDate, `YYYY-MM`);
    if (twoMatchesDate.isValid()) {
      return { displayDate: twoMatchesDate.format(getMonthYearFormat(dateFormat)) };
    }
  }

  const oneMatchDate = dayjs(fhirDate, `YYYY`);
  if (oneMatchDate.isValid()) {
    return { displayDate: oneMatchDate.format('YYYY') };
  }

  return { displayDate: fhirDate, dateParseFail: true };
}

/**
 * Parse a FHIR dateTime string to a human-readable display format.
 * Supports full and partial FHIR dateTime values.
 *
 * @author Sean Fong
 */
export function parseFhirDateTimeToDisplayDateTime(fhirDateTime: string): {
  displayDateTime: string;
  dateParseFail?: boolean;
} {
  if (fhirDateTime.length === 0) {
    return { displayDateTime: '' };
  }

  const fullDateTime = dayjs(fhirDateTime);
  if (fullDateTime.isValid()) {
    return { displayDateTime: fullDateTime.format(`${getDateFormat()} HH:mm`) };
  }

  const { displayDate, dateParseFail } = parseFhirDateToDisplayDate(fhirDateTime);

  return { displayDateTime: displayDate, dateParseFail };
}

export function parseInputDateToFhirDate(displayDate: string) {
  const dateFormat = getDateFormat();
  const separator = getDateSeparator(dateFormat);
  const numOfSeparators = getNumOfSeparators(displayDate, separator);

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(displayDate, dateFormat);
    if (threeMatchesDate.isValid()) {
      return threeMatchesDate.format('YYYY-MM-DD');
    }
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(displayDate, getMonthYearFormat(dateFormat));
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
