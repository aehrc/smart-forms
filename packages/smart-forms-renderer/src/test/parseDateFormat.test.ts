/// <reference types="jest" />

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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  getDateSeparator,
  getDateTokenOrder,
  getMonthYearFormat,
  getNumOfSeparators,
  orderDateParts,
  parseFhirDateToDisplayDate,
  parseInputDateToFhirDate,
  resolveDateFormat,
  validateThreeMatches
} from '../components/FormComponents/DateTimeItems/utils/parseDate';
import { rendererConfigStore } from '../stores';
import { defaultRendererStrings } from '../i18n';

dayjs.extend(customParseFormat);

afterEach(() => {
  // Reset to the default English date format between tests. setRendererConfig merges with the
  // existing state (`?? state`), so reset the store directly to restore the default.
  rendererConfigStore.setState({ locale: undefined, rendererStrings: defaultRendererStrings });
});

describe('getDateSeparator', () => {
  it('derives the separator from a date format string', () => {
    expect(getDateSeparator('DD/MM/YYYY')).toBe('/');
    expect(getDateSeparator('DD.MM.YYYY')).toBe('.');
    expect(getDateSeparator('DD-MM-YYYY')).toBe('-');
  });

  it('falls back to "/" when no separator is present', () => {
    expect(getDateSeparator('YYYYMMDD')).toBe('/');
  });
});

describe('getMonthYearFormat', () => {
  it('derives the month-year format from the full-date format', () => {
    expect(getMonthYearFormat('DD/MM/YYYY')).toBe('MM/YYYY');
    expect(getMonthYearFormat('DD.MM.YYYY')).toBe('MM.YYYY');
  });
});

describe('getDateTokenOrder', () => {
  it('returns the day/month/year order of the format', () => {
    expect(getDateTokenOrder('DD/MM/YYYY')).toEqual(['D', 'M', 'Y']);
    expect(getDateTokenOrder('DD.MM.YYYY')).toEqual(['D', 'M', 'Y']);
    expect(getDateTokenOrder('MM/DD/YYYY')).toEqual(['M', 'D', 'Y']);
    expect(getDateTokenOrder('YYYY-MM-DD')).toEqual(['Y', 'M', 'D']);
  });
});

describe('orderDateParts', () => {
  it('maps positional parts to day/month/year for a day-first format', () => {
    expect(orderDateParts(['15', '03', '2024'], 'DD/MM/YYYY')).toEqual({
      day: '15',
      month: '03',
      year: '2024'
    });
  });

  it('maps positional parts to day/month/year for a US (month-first) format', () => {
    expect(orderDateParts(['03', '15', '2024'], 'MM/DD/YYYY')).toEqual({
      day: '15',
      month: '03',
      year: '2024'
    });
  });
});

describe('validateThreeMatches (order-aware)', () => {
  it('accepts a valid US date where the day is in the second position', () => {
    // 03/15/2024 = 15 March 2024; the "15" is the day, which is only valid month-first
    expect(validateThreeMatches('03', '15', '2024', 'MM/DD/YYYY')).toBe(true);
    // The same parts are invalid when interpreted day-first (15 would be the month)
    expect(validateThreeMatches('03', '15', '2024', 'DD/MM/YYYY')).toBe(false);
  });

  it('still validates day-first formats correctly', () => {
    expect(validateThreeMatches('15', '03', '2024', 'DD/MM/YYYY')).toBe(true);
    expect(validateThreeMatches('32', '03', '2024', 'DD/MM/YYYY')).toBe(false); // day out of range
  });
});

describe('resolveDateFormat', () => {
  it('falls back to DD/MM/YYYY when no locale or override is given', () => {
    expect(resolveDateFormat()).toBe('DD/MM/YYYY');
  });

  it('derives the format from any locale via Intl', () => {
    expect(resolveDateFormat('de-CH')).toBe('DD.MM.YYYY');
    expect(resolveDateFormat('en-US')).toBe('MM/DD/YYYY');
    expect(resolveDateFormat('ja-JP')).toBe('YYYY/MM/DD');
  });

  it('falls back to DD/MM/YYYY for an invalid locale tag', () => {
    expect(resolveDateFormat('invalid!')).toBe('DD/MM/YYYY');
  });

  it('lets an explicit override win over the locale', () => {
    expect(resolveDateFormat('de-CH', 'YYYY-MM-DD')).toBe('YYYY-MM-DD');
  });
});

describe('getNumOfSeparators', () => {
  it('counts slash separators', () => {
    expect(getNumOfSeparators('01/02/2024', '/')).toBe(2);
  });

  it('counts dot separators without treating "." as a regex wildcard', () => {
    // A naive `new RegExp('.')` would match every character and return the string length
    expect(getNumOfSeparators('01.02.2024', '.')).toBe(2);
  });
});

describe('date parsing with a configurable format', () => {
  it('round-trips a Swiss (DD.MM.YYYY) date when locale is de-CH', () => {
    rendererConfigStore.getState().setRendererConfig({ locale: 'de-CH' });

    expect(parseFhirDateToDisplayDate('2024-03-15')).toEqual({ displayDate: '15.03.2024' });
    expect(parseInputDateToFhirDate('15.03.2024')).toBe('2024-03-15');
  });

  it('uses DD/MM/YYYY by default', () => {
    expect(parseFhirDateToDisplayDate('2024-03-15')).toEqual({ displayDate: '15/03/2024' });
    expect(parseInputDateToFhirDate('15/03/2024')).toBe('2024-03-15');
  });

  it('round-trips a US (MM/DD/YYYY) date via an explicit override', () => {
    rendererConfigStore.getState().setRendererConfig({ rendererStrings: { dateFormat: 'MM/DD/YYYY' } });

    expect(parseFhirDateToDisplayDate('2024-03-15')).toEqual({ displayDate: '03/15/2024' });
    expect(parseInputDateToFhirDate('03/15/2024')).toBe('2024-03-15');
  });
});
