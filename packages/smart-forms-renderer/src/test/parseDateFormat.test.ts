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
  validateDateInput,
  validateThreeMatches,
  validateTwoMatches
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
    expect(getMonthYearFormat('MM/DD/YYYY')).toBe('MM/YYYY');
  });

  it('preserves the token order of year-first formats', () => {
    expect(getMonthYearFormat('YYYY/MM/DD')).toBe('YYYY/MM');
    expect(getMonthYearFormat('YYYY-MM-DD')).toBe('YYYY-MM');
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

describe('validateTwoMatches (order-aware)', () => {
  it('accepts month-first input for a month-first format', () => {
    expect(validateTwoMatches('03', '2024', 'DD/MM/YYYY')).toBe(true);
    // Year-first input is not valid for a month-first format
    expect(validateTwoMatches('2024', '03', 'DD/MM/YYYY')).toBe(false);
  });

  it('accepts year-first input for a year-first format', () => {
    expect(validateTwoMatches('2024', '03', 'YYYY/MM/DD')).toBe(true);
    // Month-first input is not valid for a year-first format
    expect(validateTwoMatches('03', '2024', 'YYYY/MM/DD')).toBe(false);
  });

  it('rejects an out-of-range month regardless of position', () => {
    expect(validateTwoMatches('13', '2024', 'DD/MM/YYYY')).toBe(false);
    expect(validateTwoMatches('2024', '13', 'YYYY-MM-DD')).toBe(false);
  });
});

describe('validateDateInput', () => {
  it('accepts the natural year-first month-year input for a year-first locale', () => {
    rendererConfigStore.getState().setRendererConfig({ locale: 'ja-JP' });

    expect(validateDateInput('2024/03')).toBe(true);
    expect(validateDateInput('03/2024')).toBe(false);
  });

  it('accepts month-first month-year input by default', () => {
    expect(validateDateInput('03/2024')).toBe(true);
    expect(validateDateInput('2024/03')).toBe(false);
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

  it('falls back to DD/MM/YYYY when the locale format is not a single-separator date', () => {
    // hu-HU/ko-KR short dates are "YYYY. MM. DD." — mixed separators plus a trailing literal, which
    // the separator-based input handling can't parse, so the fallback has to kick in.
    expect(resolveDateFormat('hu-HU')).toBe('DD/MM/YYYY');
    expect(resolveDateFormat('ko-KR')).toBe('DD/MM/YYYY');
  });

  it('only ever resolves formats joined by a single repeated separator', () => {
    const locales = [
      'en-AU',
      'en-US',
      'en-CA',
      'de-CH',
      'de-DE',
      'fr-FR',
      'it-IT',
      'ja-JP',
      'ko-KR',
      'zh-CN',
      'hu-HU',
      'lv-LV',
      'fi-FI',
      'nb-NO'
    ];

    for (const locale of locales) {
      const format = resolveDateFormat(locale);

      expect(format).toContain('DD');
      expect(format).toContain('MM');
      expect(format).toContain('YYYY');
      // e.g. "//" or ".." — never empty, never mixed
      expect(format.replace(/DD|MM|YYYY/g, '')).toMatch(/^([^A-Za-z0-9])\1*$/);
    }
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

  it('round-trips a year-first (YYYY/MM/DD) date when locale is ja-JP', () => {
    rendererConfigStore.getState().setRendererConfig({ locale: 'ja-JP' });

    expect(parseFhirDateToDisplayDate('2024-03-15')).toEqual({ displayDate: '2024/03/15' });
    expect(parseInputDateToFhirDate('2024/03/15')).toBe('2024-03-15');
  });

  it('keeps partial month-year dates year-first for a year-first locale', () => {
    rendererConfigStore.getState().setRendererConfig({ locale: 'ja-JP' });

    expect(parseFhirDateToDisplayDate('2024-03')).toEqual({ displayDate: '2024/03' });
    expect(parseInputDateToFhirDate('2024/03')).toBe('2024-03');
  });

  it('round-trips a US (MM/DD/YYYY) date via an explicit override', () => {
    rendererConfigStore
      .getState()
      .setRendererConfig({ rendererStrings: { dateFormat: 'MM/DD/YYYY' } });

    expect(parseFhirDateToDisplayDate('2024-03-15')).toEqual({ displayDate: '03/15/2024' });
    expect(parseInputDateToFhirDate('03/15/2024')).toBe('2024-03-15');
  });
});
