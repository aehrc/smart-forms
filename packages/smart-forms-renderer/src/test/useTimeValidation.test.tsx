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
import useTimeValidation from '../hooks/useTimeValidation';

// Mock the parseDate utility
const mockGetNumOfSeparators = jest.fn();
jest.mock('../components/FormComponents/DateTimeItems/utils/parseDate', () => ({
  getNumOfSeparators: (...args: any[]) => mockGetNumOfSeparators(...args)
}));

// Mock the parseTime utility
const mockValidateTimeInput = jest.fn();
jest.mock('../components/FormComponents/DateTimeItems/utils/parseTime', () => ({
  validateTimeInput: (...args: any[]) => mockValidateTimeInput(...args)
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

describe('useTimeValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockGetNumOfSeparators.mockReturnValue(1);
    mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });
    mockIsValid.mockReturnValue(true);
  });

  describe('empty input handling', () => {
    it('should return empty feedback for empty time input', () => {
      const { result } = renderHook(() => useTimeValidation('', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: false
      });
      expect(mockGetNumOfSeparators).not.toHaveBeenCalled();
      expect(mockDayjs).not.toHaveBeenCalled();
    });

    it('should return empty feedback for empty time input with period', () => {
      const { result } = renderHook(() => useTimeValidation('', 'AM'));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: false
      });
    });

    it('should return empty feedback for empty time input with parseFail true', () => {
      const { result } = renderHook(() => useTimeValidation('', '', true));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: false
      });
    });
  });

  describe('separator validation', () => {
    it('should reject input with dot separator', () => {
      const { result } = renderHook(() => useTimeValidation('12.30', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the required format with ":" as the separator.',
        is24HourNotation: false
      });
      expect(mockGetNumOfSeparators).not.toHaveBeenCalled();
    });

    it('should reject input with mixed separators', () => {
      const { result } = renderHook(() => useTimeValidation('12:30.45', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the required format with ":" as the separator.',
        is24HourNotation: false
      });
    });

    it('should reject input with only dots', () => {
      const { result } = renderHook(() => useTimeValidation('12.30', 'AM'));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the required format with ":" as the separator.',
        is24HourNotation: false
      });
    });

    it('should accept input with only colons', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('12:30', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
      expect(mockGetNumOfSeparators).toHaveBeenCalledWith('12:30', ':');
    });
  });

  describe('format validation', () => {
    it('should reject input with incorrect length (too short)', () => {
      const { result } = renderHook(() => useTimeValidation('1:30', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
      expect(mockGetNumOfSeparators).not.toHaveBeenCalled();
    });

    it('should reject input with incorrect length (too long)', () => {
      const { result } = renderHook(() => useTimeValidation('12:300', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should reject input without colon separator', () => {
      const { result } = renderHook(() => useTimeValidation('12345', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should accept correctly formatted input', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('12:30', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });
  });

  describe('dayjs validation', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(1);
    });

    it('should reject when dayjs parsing fails', () => {
      mockIsValid.mockReturnValue(false);

      const { result } = renderHook(() => useTimeValidation('25:60', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format hh:mm.',
        is24HourNotation: false
      });
      expect(mockDayjs).toHaveBeenCalledWith('25:60', 'hh:mm');
      expect(mockValidateTimeInput).not.toHaveBeenCalled();
    });

    it('should proceed when dayjs parsing succeeds', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('12:30', 'PM'));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: false
      });
      expect(mockDayjs).toHaveBeenCalledWith('12:30', 'hh:mm');
    });

    it('should handle edge time values', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('00:00', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });

    it('should handle maximum time values', () => {
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('23:59', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });
  });

  describe('12-hour and 24-hour format handling', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
    });

    it('should handle 24-hour format correctly', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('15:30', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
      expect(mockValidateTimeInput).toHaveBeenCalledWith('15:30', '');
    });

    it('should handle 12-hour format with AM correctly', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('09:30', 'AM'));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: false
      });
      expect(mockValidateTimeInput).toHaveBeenCalledWith('09:30', 'AM');
    });

    it('should handle 12-hour format with PM correctly', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('03:45', 'PM'));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: false
      });
      expect(mockValidateTimeInput).toHaveBeenCalledWith('03:45', 'PM');
    });

    it('should require period for 12-hour format', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('09:30', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Specify the period as AM or PM.',
        is24HourNotation: false
      });
    });

    it('should not require period for 24-hour format', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('15:30', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });
  });

  describe('time validation function integration', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
    });

    it('should reject invalid time from validateTimeInput', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: false, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('12:30', 'AM'));

      expect(result.current).toEqual({
        timeFeedback: 'Input is an invalid time.',
        is24HourNotation: false
      });
    });

    it('should accept valid time from validateTimeInput', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('14:30', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });

    it('should call validateTimeInput with correct parameters', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      renderHook(() => useTimeValidation('11:45', 'PM'));

      expect(mockValidateTimeInput).toHaveBeenCalledWith('11:45', 'PM');
      expect(mockValidateTimeInput).toHaveBeenCalledTimes(1);
    });

    it('should handle different period inputs', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const periods = ['AM', 'PM', 'am', 'pm', 'A.M.', 'P.M.'];
      
      periods.forEach(period => {
        jest.clearAllMocks();
        mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });
        
        const { result } = renderHook(() => useTimeValidation('10:30', period));
        
        expect(mockValidateTimeInput).toHaveBeenCalledWith('10:30', period);
        expect(result.current.timeFeedback).toBe('');
      });
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle non-numeric time input', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('ab:cd', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Specify the period as AM or PM.',
        is24HourNotation: false
      });
    });

    it('should handle input with multiple colons', () => {
      // Input '12:30:45' is 8 characters, so it fails the length check
      const { result } = renderHook(() => useTimeValidation('12:30:45', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should handle input with no colons but correct length', () => {
      const { result } = renderHook(() => useTimeValidation('12345', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should handle special characters', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('12:3@', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Specify the period as AM or PM.',
        is24HourNotation: false
      });
    });

    it('should handle spaces in input', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('12: 0', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Specify the period as AM or PM.',
        is24HourNotation: false
      });
    });

    it('should handle empty period with various inputs', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      const { result } = renderHook(() => useTimeValidation('08:30', ''));

      expect(result.current).toEqual({
        timeFeedback: 'Specify the period as AM or PM.',
        is24HourNotation: false
      });
    });
  });

  describe('parseFail parameter handling', () => {
    it('should return generic error message when parseFail is true and validation fails', () => {
      // Input 'invalid' is 7 characters and doesn't contain ':', so it fails format check
      const { result } = renderHook(() => useTimeValidation('invalid', '', true));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should return generic error message when parseFail is false and validation fails', () => {
      // Input 'invalid' is 7 characters and doesn't contain ':', so it fails format check
      const { result } = renderHook(() => useTimeValidation('invalid', '', false));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should handle parseFail with multiple separator scenario', () => {
      // Input '12:30:45' is 8 characters, so it fails the length check first
      const { result } = renderHook(() => useTimeValidation('12:30:45', '', true));

      expect(result.current).toEqual({
        timeFeedback: 'Input does not match the format HH:MM.',
        is24HourNotation: false
      });
    });

    it('should handle parseFail with valid input', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('12:30', '', true));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });
  });

  describe('mock interaction validation', () => {
    it('should call getNumOfSeparators with correct parameters', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      renderHook(() => useTimeValidation('12:30', ''));

      expect(mockGetNumOfSeparators).toHaveBeenCalledWith('12:30', ':');
      expect(mockGetNumOfSeparators).toHaveBeenCalledTimes(1);
    });

    it('should call dayjs with correct format', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      renderHook(() => useTimeValidation('09:45', 'AM'));

      expect(mockDayjs).toHaveBeenCalledWith('09:45', 'hh:mm');
    });

    it('should not call validateTimeInput when dayjs fails', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(false);

      renderHook(() => useTimeValidation('25:70', ''));

      expect(mockValidateTimeInput).not.toHaveBeenCalled();
    });

    it('should call validateTimeInput with time and period', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });

      renderHook(() => useTimeValidation('07:15', 'AM'));

      expect(mockValidateTimeInput).toHaveBeenCalledWith('07:15', 'AM');
    });
  });

  describe('performance and consistency', () => {
    it('should return consistent results for same input', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result: result1 } = renderHook(() => useTimeValidation('14:30', ''));
      const { result: result2 } = renderHook(() => useTimeValidation('14:30', ''));

      expect(result1.current).toEqual(result2.current);
      expect(result1.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });

    it('should handle multiple validation calls efficiently', () => {
      const timeInputs = [
        { time: '09:30', period: 'AM' },
        { time: '15:45', period: '' },
        { time: '12:00', period: 'PM' },
        { time: 'invalid', period: '' }
      ];

      mockGetNumOfSeparators
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(0);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput
        .mockReturnValueOnce({ timeIsValid: true, is24HourNotation: false })
        .mockReturnValueOnce({ timeIsValid: true, is24HourNotation: true })
        .mockReturnValueOnce({ timeIsValid: true, is24HourNotation: false });

      const results = timeInputs.map(({ time, period }) => {
        const { result } = renderHook(() => useTimeValidation(time, period));
        return result.current;
      });

      expect(results).toEqual([
        { timeFeedback: '', is24HourNotation: false },
        { timeFeedback: '', is24HourNotation: true },
        { timeFeedback: '', is24HourNotation: false },
        { timeFeedback: 'Input does not match the format HH:MM.', is24HourNotation: false }
      ]);
    });

    it('should not have side effects between calls', () => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
      mockValidateTimeInput.mockReturnValue({ timeIsValid: false, is24HourNotation: false });

      const { result: result1 } = renderHook(() => useTimeValidation('12:30', 'AM'));
      
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: false });
      const { result: result2 } = renderHook(() => useTimeValidation('12:30', 'AM'));

      expect(result1.current.timeFeedback).toBe('Input is an invalid time.');
      expect(result2.current.timeFeedback).toBe('');
    });
  });

  describe('comprehensive time scenarios', () => {
    beforeEach(() => {
      mockGetNumOfSeparators.mockReturnValue(1);
      mockIsValid.mockReturnValue(true);
    });

    it('should handle midnight in 24-hour format', () => {
      mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: true });

      const { result } = renderHook(() => useTimeValidation('00:00', ''));

      expect(result.current).toEqual({
        timeFeedback: '',
        is24HourNotation: true
      });
    });

    it('should handle noon in different formats', () => {
      mockValidateTimeInput
        .mockReturnValueOnce({ timeIsValid: true, is24HourNotation: true })
        .mockReturnValueOnce({ timeIsValid: true, is24HourNotation: false });

      const { result: result24 } = renderHook(() => useTimeValidation('12:00', ''));
      const { result: result12 } = renderHook(() => useTimeValidation('12:00', 'PM'));

      expect(result24.current.is24HourNotation).toBe(true);
      expect(result12.current.is24HourNotation).toBe(false);
    });

    it('should handle edge times correctly', () => {
      const edgeTimes = [
        { time: '00:01', period: '', is24Hour: true },
        { time: '11:59', period: 'PM', is24Hour: false },
        { time: '23:59', period: '', is24Hour: true }
      ];

      edgeTimes.forEach(({ time, period, is24Hour }) => {
        jest.clearAllMocks();
        mockGetNumOfSeparators.mockReturnValue(1);
        mockIsValid.mockReturnValue(true);
        mockValidateTimeInput.mockReturnValue({ timeIsValid: true, is24HourNotation: is24Hour });

        const { result } = renderHook(() => useTimeValidation(time, period));

        expect(result.current).toEqual({
          timeFeedback: '',
          is24HourNotation: is24Hour
        });
      });
    });
  });
});
