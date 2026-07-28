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

import { describe, expect, it } from '@jest/globals';
import { checkIsDateTime, checkIsTime, convertDateTimeToDate } from '../utils/constructResponse';

// These tests lock the date versus dateTime discrimination used by parseValueToAnswer() to decide
// whether a populated answer becomes a valueDate or a valueDateTime. The suite runs with
// TZ=Australia/Sydney (see the package test script), which is why values without an explicit
// offset resolve against +10:00 or +11:00.

describe('checkIsDateTime', () => {
  it('accepts a full ISO dateTime with a Z offset', () => {
    expect(checkIsDateTime('2023-06-15T14:30:45Z')).toBe(true);
  });

  it('accepts a full ISO dateTime with a numeric offset', () => {
    expect(checkIsDateTime('2023-06-15T14:30:45+10:00')).toBe(true);
    expect(checkIsDateTime('2023-06-15T14:30:45-05:00')).toBe(true);
  });

  it('accepts an ISO dateTime with fractional seconds', () => {
    expect(checkIsDateTime('2023-06-15T14:30:45.123Z')).toBe(true);
  });

  it('accepts an ISO dateTime with no offset', () => {
    expect(checkIsDateTime('2023-06-15T14:30:45')).toBe(true);
  });

  it('accepts a date', () => {
    expect(checkIsDateTime('2023-06-15')).toBe(true);
  });

  it('accepts a bare year-month', () => {
    expect(checkIsDateTime('2023-06')).toBe(true);
  });

  it('accepts a bare year', () => {
    expect(checkIsDateTime('2023')).toBe(true);
  });

  it('rejects an empty or whitespace-only string', () => {
    expect(checkIsDateTime('')).toBe(false);
    expect(checkIsDateTime(' ')).toBe(false);
  });

  it('rejects a time-only value', () => {
    expect(checkIsDateTime('10:00:00')).toBe(false);
    expect(checkIsDateTime('14:30:45')).toBe(false);
  });

  it('rejects a non-date string', () => {
    expect(checkIsDateTime('not-a-date')).toBe(false);
  });

  it('rejects a non-ISO date ordering', () => {
    expect(checkIsDateTime('15/06/2023')).toBe(false);
  });

  it('accepts out-of-range date components, which are normalised before the format check', () => {
    // The value is normalised by dayjs before being checked, so an overflowing month or day rolls
    // over rather than failing. Locked in as existing behaviour, not as a recommendation.
    expect(checkIsDateTime('2023-13-01')).toBe(true);
    expect(checkIsDateTime('2023-01-32')).toBe(true);
    expect(checkIsDateTime('2023-02-29')).toBe(true);
    expect(checkIsDateTime('2024-02-29')).toBe(true);
  });
});

describe('convertDateTimeToDate', () => {
  it('converts a full ISO dateTime with a Z offset to a local date', () => {
    // 14:30:45Z is 2023-06-16 in Australia/Sydney.
    expect(convertDateTimeToDate('2023-06-15T14:30:45Z')).toBe('2023-06-16');
  });

  it('converts a full ISO dateTime with a numeric offset to a local date', () => {
    expect(convertDateTimeToDate('2023-06-15T14:30:45+10:00')).toBe('2023-06-15');
    expect(convertDateTimeToDate('2023-06-15T14:30:45-05:00')).toBe('2023-06-16');
  });

  it('converts an ISO dateTime with fractional seconds', () => {
    expect(convertDateTimeToDate('2023-06-15T14:30:45.123Z')).toBe('2023-06-16');
  });

  it('converts an ISO dateTime with no offset', () => {
    expect(convertDateTimeToDate('2023-06-15T14:30:45')).toBe('2023-06-15');
  });

  it('applies the offset when it crosses a year boundary', () => {
    expect(convertDateTimeToDate('2023-12-31T23:59:59+10:00')).toBe('2024-01-01');
  });

  it('expands a date to a full date', () => {
    expect(convertDateTimeToDate('2023-06-15')).toBe('2023-06-15');
  });

  it('expands a bare year-month to the first of the month', () => {
    expect(convertDateTimeToDate('2023-06')).toBe('2023-06-01');
  });

  it('expands a bare year to the first of January', () => {
    expect(convertDateTimeToDate('2023')).toBe('2023-01-01');
  });

  it('returns the original value when it is not parseable', () => {
    expect(convertDateTimeToDate('')).toBe('');
    expect(convertDateTimeToDate(' ')).toBe(' ');
    expect(convertDateTimeToDate('not-a-date')).toBe('not-a-date');
    expect(convertDateTimeToDate('15/06/2023')).toBe('15/06/2023');
  });

  it('returns the original value for a time-only value', () => {
    expect(convertDateTimeToDate('10:00:00')).toBe('10:00:00');
  });
});

describe('checkIsTime', () => {
  it('accepts a time, with or without fractional seconds', () => {
    expect(checkIsTime('00:00:00')).toBe(true);
    expect(checkIsTime('14:30:45')).toBe(true);
    expect(checkIsTime('23:59:60')).toBe(true);
    expect(checkIsTime('14:30:45.123')).toBe(true);
  });

  it('rejects an out-of-range or malformed time', () => {
    expect(checkIsTime('24:00:00')).toBe(false);
    expect(checkIsTime('14:60:00')).toBe(false);
    expect(checkIsTime('14:30')).toBe(false);
    expect(checkIsTime('2023-06-15T14:30:45Z')).toBe(false);
    expect(checkIsTime('')).toBe(false);
  });
});
