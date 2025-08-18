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
import useDateNonEmptyValidation from '../hooks/useDateTimeNonEmpty';

describe('useDateNonEmptyValidation', () => {
  describe('core validation logic', () => {
    it('should return "Date is required" when date is empty but time has value and no feedback', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should return existing date feedback when date feedback is present', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30', 'Invalid date format', '')
      );

      expect(result.current).toBe('Invalid date format');
    });

    it('should return existing date feedback when time feedback is present', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30', '', 'Invalid time format')
      );

      expect(result.current).toBe('');
    });

    it('should return date feedback when both date and time feedback present', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30', 'Date error', 'Time error')
      );

      expect(result.current).toBe('Date error');
    });
  });

  describe('date input variations', () => {
    it('should not require date when date input has value', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('2024-01-01', '10:30', '', '')
      );

      expect(result.current).toBe('');
    });

    it('should not require date when date input is whitespace-only', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('   ', '10:30', '', '')
      );

      expect(result.current).toBe('');
    });

    it('should handle partial date input', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('2024', '10:30', '', '')
      );

      expect(result.current).toBe('');
    });

    it('should handle invalid date format', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('invalid-date', '10:30', '', '')
      );

      expect(result.current).toBe('');
    });
  });

  describe('time input variations', () => {
    it('should not require date when time input is empty', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '', '', '')
      );

      expect(result.current).toBe('');
    });

    it('should require date when time is whitespace-only', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '   ', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should require date when time is valid format', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '14:30:45', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should require date when time is partial format', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '14', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should require date when time is invalid format', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', 'invalid-time', '', '')
      );

      expect(result.current).toBe('Date is required');
    });
  });

  describe('feedback priority', () => {
    it('should prioritize date feedback over date required message', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30', 'Custom date error', '')
      );

      expect(result.current).toBe('Custom date error');
    });

    it('should prioritize date feedback even when time feedback exists', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('2024-01-01', '10:30', 'Date warning', 'Time warning')
      );

      expect(result.current).toBe('Date warning');
    });

    it('should return empty string when no date feedback and conditions not met', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('2024-01-01', '', '', 'Time error')
      );

      expect(result.current).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle null-like inputs gracefully', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', 'null', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should handle undefined-like inputs', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', 'undefined', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should handle special characters in time', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30:00.000Z', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should handle empty feedback with non-empty date and time', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('2024-01-01', '10:30', '', '')
      );

      expect(result.current).toBe('');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical valid datetime scenario', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('2024-12-25', '09:00', '', '')
      );

      expect(result.current).toBe('');
    });

    it('should handle user filling time before date', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '15:45', '', '')
      );

      expect(result.current).toBe('Date is required');
    });

    it('should handle validation errors alongside requirement', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '25:00', 'Date cannot be empty', 'Invalid time')
      );

      expect(result.current).toBe('Date cannot be empty');
    });

    it('should handle form submission scenario with partial data', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('', '08:30', '', 'Time format incorrect')
      );

      expect(result.current).toBe('');
    });
  });

  describe('memoization and re-rendering', () => {
    it('should return consistent results for same inputs', () => {
      const { result, rerender } = renderHook(
        ({ dateInput, timeInput, dateFeedback, timeFeedback }) => 
          useDateNonEmptyValidation(dateInput, timeInput, dateFeedback, timeFeedback),
        { 
          initialProps: { 
            dateInput: '', 
            timeInput: '10:30', 
            dateFeedback: '', 
            timeFeedback: '' 
          } 
        }
      );

      const firstResult = result.current;
      expect(firstResult).toBe('Date is required');

      // Re-render with same props
      rerender({ 
        dateInput: '', 
        timeInput: '10:30', 
        dateFeedback: '', 
        timeFeedback: '' 
      });

      expect(result.current).toBe(firstResult);
    });

    it('should update when inputs change', () => {
      const { result, rerender } = renderHook(
        ({ dateInput, timeInput, dateFeedback, timeFeedback }) => 
          useDateNonEmptyValidation(dateInput, timeInput, dateFeedback, timeFeedback),
        { 
          initialProps: { 
            dateInput: '', 
            timeInput: '10:30', 
            dateFeedback: '', 
            timeFeedback: '' 
          } 
        }
      );

      expect(result.current).toBe('Date is required');

      // Change date input
      rerender({ 
        dateInput: '2024-01-01', 
        timeInput: '10:30', 
        dateFeedback: '', 
        timeFeedback: '' 
      });

      expect(result.current).toBe('');

      // Change to have date feedback
      rerender({ 
        dateInput: '', 
        timeInput: '10:30', 
        dateFeedback: 'Custom error', 
        timeFeedback: '' 
      });

      expect(result.current).toBe('Custom error');
    });
  });

  describe('boundary value testing', () => {
    it('should handle minimum valid inputs', () => {
      const { result } = renderHook(() => 
        useDateNonEmptyValidation('1', '1', '', '')
      );

      expect(result.current).toBe('');
    });

    it('should handle empty string variations', () => {
      // Only exact empty string triggers the requirement
      const { result: emptyResult } = renderHook(() => 
        useDateNonEmptyValidation('', '10:30', '', '')
      );
      expect(emptyResult.current).toBe('Date is required');

      // Whitespace variations are treated as non-empty
      const whitespaceVariations = ['    ', '\t', '\n'];
      whitespaceVariations.forEach(whitespaceValue => {
        const { result } = renderHook(() => 
          useDateNonEmptyValidation(whitespaceValue, '10:30', '', '')
        );

        expect(result.current).toBe('');
      });
    });

    it('should handle long input strings', () => {
      const longDate = 'a'.repeat(1000);
      const longTime = 'b'.repeat(1000);
      
      const { result } = renderHook(() => 
        useDateNonEmptyValidation(longDate, longTime, '', '')
      );

      expect(result.current).toBe('');
    });
  });
});
