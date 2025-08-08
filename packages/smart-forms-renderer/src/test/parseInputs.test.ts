/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import { describe, expect, test } from '@jest/globals';
import {
  parseValidInteger,
  parseValidNumericString,
  parseIntegerString,
  parseDecimalStringWithPrecision,
  parseDecimalStringToFloat
} from '../utils/parseInputs';

describe('parseValidInteger', () => {
  test('should parse valid integer strings', () => {
    expect(parseValidInteger('123')).toBe(123);
    expect(parseValidInteger('456')).toBe(456);
    expect(parseValidInteger('0')).toBe(0);
  });

  test('should parse strings with leading/trailing spaces', () => {
    expect(parseValidInteger(' 123 ')).toBe(123);
    expect(parseValidInteger('\t456\n')).toBe(456);
  });

  test('should parse negative integers', () => {
    expect(parseValidInteger('-123')).toBe(-123);
    expect(parseValidInteger('-456')).toBe(-456);
  });

  test('should handle strings with mixed characters', () => {
    expect(parseValidInteger('abc123def')).toBeNaN(); // parseInt of 'abc123def' returns NaN
    expect(parseValidInteger('123abc')).toBe(123);
    expect(parseValidInteger('abc')).toBe(0);
  });

  test('should handle decimal strings by truncating', () => {
    expect(parseValidInteger('123.456')).toBe(123);
    expect(parseValidInteger('99.99')).toBe(99);
  });

  test('should handle empty or invalid strings', () => {
    expect(parseValidInteger('')).toBe(0);
    expect(parseValidInteger('   ')).toBe(0);
    expect(parseValidInteger('abc')).toBe(0);
  });
});

describe('parseValidNumericString', () => {
  test('should return original string if it contains numbers', () => {
    expect(parseValidNumericString('123')).toBe('123');
    expect(parseValidNumericString('456.789')).toBe('456.789');
    expect(parseValidNumericString('abc123')).toBe('abc123');
    expect(parseValidNumericString('123abc')).toBe('123abc');
  });

  test('should return "0" if string contains no numbers', () => {
    expect(parseValidNumericString('abc')).toBe('0');
    expect(parseValidNumericString('xyz')).toBe('0');
    expect(parseValidNumericString('   ')).toBe('0');
    expect(parseValidNumericString('')).toBe('0');
    expect(parseValidNumericString('!@#$%')).toBe('0');
  });

  test('should handle special characters with numbers', () => {
    expect(parseValidNumericString('$123.45')).toBe('$123.45');
    expect(parseValidNumericString('-456')).toBe('-456');
    expect(parseValidNumericString('+789')).toBe('+789');
  });

  test('should handle edge cases', () => {
    expect(parseValidNumericString('0')).toBe('0');
    expect(parseValidNumericString('0.0')).toBe('0.0');
    expect(parseValidNumericString('a1b2c3')).toBe('a1b2c3');
  });
});

describe('parseIntegerString', () => {
  test('should return empty string for empty input', () => {
    expect(parseIntegerString('')).toBe('');
  });

  test('should parse valid integer strings', () => {
    expect(parseIntegerString('123')).toBe('123');
    expect(parseIntegerString('456')).toBe('456');
    expect(parseIntegerString('0')).toBe('0');
  });

  test('should parse negative integers', () => {
    expect(parseIntegerString('-123')).toBe('-123');
    expect(parseIntegerString('-456')).toBe('-456');
  });

  test('should truncate decimal parts', () => {
    expect(parseIntegerString('123.456')).toBe('123');
    expect(parseIntegerString('99.99')).toBe('99');
    expect(parseIntegerString('0.9')).toBe('0');
  });

  test('should handle strings without numbers', () => {
    expect(parseIntegerString('abc')).toBe('0');
    expect(parseIntegerString('xyz')).toBe('0');
    expect(parseIntegerString('!@#')).toBe('0');
  });

  test('should handle mixed alphanumeric strings', () => {
    expect(parseIntegerString('abc123')).toBe('NaN');
    expect(parseIntegerString('123abc')).toBe('123');
  });

  test('should handle leading/trailing whitespace', () => {
    expect(parseIntegerString(' 123 ')).toBe('123');
    expect(parseIntegerString('\t456\n')).toBe('456');
  });
});

describe('parseDecimalStringWithPrecision', () => {
  test('should return empty string for empty input', () => {
    expect(parseDecimalStringWithPrecision('', null)).toBe('');
    expect(parseDecimalStringWithPrecision('', 2)).toBe('');
  });

  test('should parse valid decimal strings without precision limit', () => {
    expect(parseDecimalStringWithPrecision('123.456', null)).toBe('123.456');
    expect(parseDecimalStringWithPrecision('789.123', null)).toBe('789.123');
    expect(parseDecimalStringWithPrecision('0.5', null)).toBe('0.5');
  });

  test('should handle integers without decimal points', () => {
    expect(parseDecimalStringWithPrecision('123', null)).toBe('123');
    expect(parseDecimalStringWithPrecision('456', 2)).toBe('456');
  });

  test('should truncate decimal places based on precision', () => {
    expect(parseDecimalStringWithPrecision('123.456789', 2)).toBe('123.45');
    expect(parseDecimalStringWithPrecision('789.123', 1)).toBe('789.1');
    expect(parseDecimalStringWithPrecision('0.999', 2)).toBe('0.99');
  });

  test('should handle precision of 0', () => {
    expect(parseDecimalStringWithPrecision('123.456', 0)).toBe('123.');
    expect(parseDecimalStringWithPrecision('789.9', 0)).toBe('789.');
  });

  test('should preserve decimal digits when parseFloat removes them', () => {
    expect(parseDecimalStringWithPrecision('123.000', null)).toBe('123.000');
    expect(parseDecimalStringWithPrecision('456.100', null)).toBe('456.1');
  });

  test('should handle strings without numbers', () => {
    expect(parseDecimalStringWithPrecision('abc', null)).toBe('0');
    expect(parseDecimalStringWithPrecision('xyz', 2)).toBe('0');
  });

  test('should handle negative decimals', () => {
    expect(parseDecimalStringWithPrecision('-123.456', 2)).toBe('-123.45');
    expect(parseDecimalStringWithPrecision('-0.789', 1)).toBe('-0.7');
  });

  test('should handle mixed alphanumeric with precision', () => {
    expect(parseDecimalStringWithPrecision('abc123.456', 2)).toBe('NaN.456');
    expect(parseDecimalStringWithPrecision('123.456abc', 2)).toBe('123.45');
  });

  test('should handle very high precision', () => {
    expect(parseDecimalStringWithPrecision('123.456789', 10)).toBe('123.456789');
    expect(parseDecimalStringWithPrecision('0.123456789', 5)).toBe('0.12345');
  });
});

describe('parseDecimalStringToFloat', () => {
  test('should parse valid decimal strings with precision', () => {
    expect(parseDecimalStringToFloat('123.456', 2)).toBe(123.46);
    expect(parseDecimalStringToFloat('789.123', 1)).toBe(789.1);
    expect(parseDecimalStringToFloat('0.999', 2)).toBe(1.00);
  });

  test('should handle integers', () => {
    expect(parseDecimalStringToFloat('123', 2)).toBe(123.00);
    expect(parseDecimalStringToFloat('456', 0)).toBe(456);
  });

  test('should handle negative numbers', () => {
    expect(parseDecimalStringToFloat('-123.456', 2)).toBe(-123.46);
    expect(parseDecimalStringToFloat('-0.789', 1)).toBe(-0.8);
  });

  test('should handle rounding correctly', () => {
    expect(parseDecimalStringToFloat('123.455', 2)).toBe(123.45); // JavaScript rounding behavior
    expect(parseDecimalStringToFloat('123.454', 2)).toBe(123.45); // rounds down
    expect(parseDecimalStringToFloat('0.999', 0)).toBe(1); // rounds to integer
  });

  test('should handle very small numbers', () => {
    expect(parseDecimalStringToFloat('0.001', 3)).toBe(0.001);
    expect(parseDecimalStringToFloat('0.0001', 2)).toBe(0.00);
    expect(parseDecimalStringToFloat('0.0056', 3)).toBe(0.006);
  });

  test('should handle zero precision', () => {
    expect(parseDecimalStringToFloat('123.789', 0)).toBe(124);
    expect(parseDecimalStringToFloat('456.123', 0)).toBe(456);
  });

  test('should handle edge cases', () => {
    expect(parseDecimalStringToFloat('0', 2)).toBe(0.00);
    expect(parseDecimalStringToFloat('0.0', 1)).toBe(0.0);
    expect(parseDecimalStringToFloat('1000000.123456', 2)).toBe(1000000.12);
  });
});
