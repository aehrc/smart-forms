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

import { renderHook } from '@testing-library/react';
import useDateValidation from '../hooks/useDateValidation';

// Mock the parseDate utilities
const mockGetNumOfSeparators = jest.fn();
const mockValidateThreeMatches = jest.fn();
const mockValidateTwoMatches = jest.fn();

jest.mock('../components/FormComponents/DateTimeItems/utils/parseDate', () => ({
  getNumOfSeparators: (...args: any[]) => mockGetNumOfSeparators(...args),
  validateThreeMatches: (...args: any[]) => mockValidateThreeMatches(...args),
  validateTwoMatches: (...args: any[]) => mockValidateTwoMatches(...args)
}));

// Mock dayjs
const mockDayjs = jest.fn();
const mockIsValid = jest.fn();

jest.mock('dayjs', () => {
  const mockDayjsInstance = {
    isValid: () => mockIsValid()
  };
  return (...args: any[]) => {
    mockDayjs(...args);
    return mockDayjsInstance;
  };
});

describe('useDateValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockGetNumOfSeparators.mockReturnValue(0);
    mockValidateThreeMatches.mockReturnValue(true);
    mockValidateTwoMatches.mockReturnValue(true);
    mockIsValid.mockReturnValue(true);
  });

  describe('empty input handling', () => {
    it('should return empty string for empty input', () => {
      const { result } = renderHook(() => useDateValidation(''));

      expect(result.current).toBe('');
      expect(mockGetNumOfSeparators).not.toHaveBeenCalled();
      expect(mockDayjs).not.toHaveBeenCalled();
    });

    it('should return empty string for empty input with parseFail true', () => {
      const { result } = renderHook(() => useDateValidation('', true));

      expect(result.current).toBe('');
      expect(mockGetNumOfSeparators).not.toHaveBeenCalled();
    });
  });

  describe('separator validation', () => {
    it('should reject input with dash separator', () => {
      const { result } = renderHook(() => useDateValidation('01-01-2024'));

      expect(result.current).toBe(
        'Input does not match the required format with "/" as the separator.'
      );
      expect(mockGetNumOfSeparators).not.toHaveBeenCalled();
    });

    it('should reject input with mixed separators', () => {
      const { result } = renderHook(() => useDateValidation('01/01-2024'));

      expect(result.current).toBe(
        'Input does not match the required format with "/" as the separator.'
      );
    });

    it('should reject input with only dash', () => {
      const { result } = renderHook(() => useDateValidation('2024-01'));

      expect(result.current).toBe(
        'Input does not match the required format with "/" as the separator.'
      );
    });

    it('should accept input with only forward slashes', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('01/01/2024'));

      expect(result.current).toBe('');
      expect(mockGetNumOfSeparators).toHaveBeenCalledWith('01/01/2024', '/');
    });
  });

  describe('DD/MM/YYYY format validation (2 separators)', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(2);
    });

    it('should validate correct DD/MM/YYYY format', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('15/03/2024'));

      expect(result.current).toBe('');
      expect(mockDayjs).toHaveBeenCalledWith('15/03/2024', 'DD/MM/YYYY');
      expect(mockValidateThreeMatches).toHaveBeenCalledWith('15', '03', '2024');
    });

    it('should reject invalid dayjs format', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('32/13/2024'));

      expect(result.current).toBe('Input does not match the format DD/MM/YYYY.');
      expect(mockValidateThreeMatches).not.toHaveBeenCalled();
    });

    it('should reject invalid date components even if dayjs is valid', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('29/02/2023'));

      expect(result.current).toBe('Input is an invalid date.');
      expect(mockValidateThreeMatches).toHaveBeenCalledWith('29', '02', '2023');
    });

    it('should handle edge case dates', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('29/02/2024')); // Leap year

      expect(result.current).toBe('');
      expect(mockValidateThreeMatches).toHaveBeenCalledWith('29', '02', '2024');
    });

    it('should handle single digit day and month', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('1/1/2024'));

      expect(result.current).toBe('');
      expect(mockValidateThreeMatches).toHaveBeenCalledWith('1', '1', '2024');
    });

    it('should handle malformed input with 2 separators', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('abc/def/ghi'));

      expect(result.current).toBe('Input does not match the format DD/MM/YYYY.');
    });
  });

  describe('MM/YYYY format validation (1 separator)', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(1);
    });

    it('should validate correct MM/YYYY format', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('03/2024'));

      expect(result.current).toBe('');
      expect(mockDayjs).toHaveBeenCalledWith('03/2024', 'MM/YYYY');
      expect(mockValidateTwoMatches).toHaveBeenCalledWith('03', '2024');
    });

    it('should reject invalid dayjs format for MM/YYYY', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('13/2024'));

      expect(result.current).toBe('Input does not match the formats MM/YYYY or DD/MM/YYYY.');
      expect(mockValidateTwoMatches).not.toHaveBeenCalled();
    });

    it('should reject invalid date components for MM/YYYY', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('00/2024'));

      expect(result.current).toBe('Input is an invalid date.');
      expect(mockValidateTwoMatches).toHaveBeenCalledWith('00', '2024');
    });

    it('should handle single digit month', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('1/2024'));

      expect(result.current).toBe('');
      expect(mockValidateTwoMatches).toHaveBeenCalledWith('1', '2024');
    });

    it('should handle malformed input with 1 separator', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('abc/def'));

      expect(result.current).toBe('Input does not match the formats MM/YYYY or DD/MM/YYYY.');
    });
  });

  describe('YYYY format validation (no separators)', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(0);
    });

    it('should validate correct 4-digit year', () => {
      mockIsValid.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('2024'));

      expect(result.current).toBe('');
      expect(mockDayjs).toHaveBeenCalledWith('2024', 'YYYY');
    });

    it('should reject invalid 4-digit year', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('abcd'));

      expect(result.current).toBe('Input does not match any date format.');
    });

    it('should reject non-4-digit input', () => {
      const { result } = renderHook(() => useDateValidation('24'));

      expect(result.current).toBe('Input does not match any date format.');
      expect(mockDayjs).not.toHaveBeenCalled();
    });

    it('should reject 5-digit input', () => {
      const { result } = renderHook(() => useDateValidation('20241'));

      expect(result.current).toBe('Input does not match any date format.');
      expect(mockDayjs).not.toHaveBeenCalled();
    });

    it('should handle historical years', () => {
      mockIsValid.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('1900'));

      expect(result.current).toBe('');
      expect(mockDayjs).toHaveBeenCalledWith('1900', 'YYYY');
    });

    it('should handle future years', () => {
      mockIsValid.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('2100'));

      expect(result.current).toBe('');
      expect(mockDayjs).toHaveBeenCalledWith('2100', 'YYYY');
    });
  });

  describe('parseFail parameter handling', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(0);
    });

    it('should return generic error message when parseFail is true and no format matches', () => {
      const { result } = renderHook(() => useDateValidation('invalid', true));

      expect(result.current).toBe('Input is an invalid date.');
    });

    it('should return specific error message when parseFail is false and no format matches', () => {
      const { result } = renderHook(() => useDateValidation('invalid', false));

      expect(result.current).toBe('Input does not match any date format.');
    });

    it('should use parseFail true as default for non-4-digit input', () => {
      const { result } = renderHook(() => useDateValidation('abc'));

      expect(result.current).toBe('Input does not match any date format.');
    });

    it('should handle parseFail with valid 4-digit year', () => {
      mockIsValid.mockReturnValue(true);

      const { result } = renderHook(() => useDateValidation('2024', true));

      expect(result.current).toBe('');
    });

    it('should handle parseFail with invalid 4-digit input', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('abcd', true));

      expect(result.current).toBe('Input is an invalid date.');
    });
  });

  describe('edge cases and special characters', () => {
    it('should handle input with multiple dashes', () => {
      const { result } = renderHook(() => useDateValidation('01-01-2024-extra'));

      expect(result.current).toBe(
        'Input does not match the required format with "/" as the separator.'
      );
    });

    it('should handle input with spaces', () => {
      mockGetNumOfSeparators.mockReturnValue(0);

      const { result } = renderHook(() => useDateValidation('2024 '));

      expect(result.current).toBe('Input does not match any date format.');
    });

    it('should handle input with special characters', () => {
      mockGetNumOfSeparators.mockReturnValue(0);
      mockIsValid.mockReturnValue(true); // dayjs accepts some special chars

      const { result } = renderHook(() => useDateValidation('20!4'));

      expect(result.current).toBe(''); // dayjs treats this as valid year input
    });

    it('should handle very long input', () => {
      mockGetNumOfSeparators.mockReturnValue(0);

      const { result } = renderHook(() => useDateValidation('20240101extra'));

      expect(result.current).toBe('Input does not match any date format.');
    });

    it('should handle input with only separators', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useDateValidation('//'));

      expect(result.current).toBe('Input does not match the format DD/MM/YYYY.');
    });

    it('should handle input with mixed content', () => {
      const { result } = renderHook(() => useDateValidation('abc-123/456'));

      expect(result.current).toBe(
        'Input does not match the required format with "/" as the separator.'
      );
    });
  });

  describe('mock interaction validation', () => {
    it('should call getNumOfSeparators with correct parameters', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(true);

      renderHook(() => useDateValidation('12/2024'));

      expect(mockGetNumOfSeparators).toHaveBeenCalledWith('12/2024', '/');
      expect(mockGetNumOfSeparators).toHaveBeenCalledTimes(1);
    });

    it('should call dayjs with correct format for 3 matches', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      renderHook(() => useDateValidation('01/02/2024'));

      expect(mockDayjs).toHaveBeenCalledWith('01/02/2024', 'DD/MM/YYYY');
    });

    it('should call dayjs with correct format for 2 matches', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(true);

      renderHook(() => useDateValidation('02/2024'));

      expect(mockDayjs).toHaveBeenCalledWith('02/2024', 'MM/YYYY');
    });

    it('should call dayjs with correct format for year only', () => {
      mockGetNumOfSeparators.mockReturnValue(0);
      mockIsValid.mockReturnValue(true);

      renderHook(() => useDateValidation('2024'));

      expect(mockDayjs).toHaveBeenCalledWith('2024', 'YYYY');
    });

    it('should not call validation functions when dayjs fails', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(false);

      renderHook(() => useDateValidation('32/13/2024'));

      expect(mockValidateThreeMatches).not.toHaveBeenCalled();
    });

    it('should call validateThreeMatches with split components', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      renderHook(() => useDateValidation('15/06/2024'));

      expect(mockValidateThreeMatches).toHaveBeenCalledWith('15', '06', '2024');
    });

    it('should call validateTwoMatches with split components', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(true);

      renderHook(() => useDateValidation('06/2024'));

      expect(mockValidateTwoMatches).toHaveBeenCalledWith('06', '2024');
    });
  });

  describe('performance and consistency', () => {
    it('should return consistent results for same input', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);

      const { result: result1 } = renderHook(() => useDateValidation('01/01/2024'));
      const { result: result2 } = renderHook(() => useDateValidation('01/01/2024'));

      expect(result1.current).toBe(result2.current);
      expect(result1.current).toBe('');
    });

    it('should handle multiple validation calls efficiently', () => {
      const inputs = ['2024', '01/2024', '01/01/2024', 'invalid'];
      mockGetNumOfSeparators
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2)
        .mockReturnValueOnce(0);
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(true);
      mockValidateTwoMatches.mockReturnValue(true);

      const results = inputs.map((input) => {
        const { result } = renderHook(() => useDateValidation(input));
        return result.current;
      });

      expect(results).toEqual(['', '', '', 'Input does not match any date format.']);
      expect(mockGetNumOfSeparators).toHaveBeenCalledTimes(4);
    });

    it('should not have side effects between calls', () => {
      mockGetNumOfSeparators.mockReturnValue(2);
      mockIsValid.mockReturnValue(true);
      mockValidateThreeMatches.mockReturnValue(false);

      const { result: result1 } = renderHook(() => useDateValidation('01/01/2024'));

      mockValidateThreeMatches.mockReturnValue(true);
      const { result: result2 } = renderHook(() => useDateValidation('01/01/2024'));

      expect(result1.current).toBe('Input is an invalid date.');
      expect(result2.current).toBe('');
    });
  });
});
