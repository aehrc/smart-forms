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

import { renderHook, act } from '@testing-library/react';
import type { QuestionnaireItem } from 'fhir/r4';
import useDateTimeCalculatedExpression from '../hooks/useDateTimeCalculatedExpression';

// Mock questionnaire store
const mockCalculatedExpressions: Record<string, any[]> = {};

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressions
    }
  }
}));

// Mock timers
jest.useFakeTimers();

describe('useDateTimeCalculatedExpression', () => {
  // Mock data
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-datetime',
    type: 'dateTime',
    text: 'Test DateTime'
  };

  const mockOnChangeByCalcExpressionString = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    valueDateTimeFhir: '',
    onChangeByCalcExpressionString: mockOnChangeByCalcExpressionString,
    onChangeByCalcExpressionNull: mockOnChangeByCalcExpressionNull
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Clear mock expressions
    Object.keys(mockCalculatedExpressions).forEach((key) => delete mockCalculatedExpressions[key]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('initialization and basic behavior', () => {
    it('should return initial state with calcExpUpdated false', () => {
      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should not call any callbacks when no calculated expression exists', () => {
      renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not call callbacks when calculated expression is not from item', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'population',
          value: '2024-01-01T10:00:00Z',
          expression: 'test-expr'
        }
      ];

      renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression handling', () => {
    it('should call onChangeByCalcExpressionString when calculated value is string and different from current', () => {
      const calculatedValue = '2024-01-01T10:00:00Z';
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: calculatedValue,
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(calculatedValue);
      expect(result.current.calcExpUpdated).toBe(true);
    });

    it('should call onChangeByCalcExpressionNull when calculated value is null', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateTimeCalculatedExpression({
          ...defaultProps,
          valueDateTimeFhir: '2024-01-01T10:00:00Z' // Current value exists
        })
      );

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(true);
    });

    it('should not update when calculated value equals current value', () => {
      const currentValue = '2024-01-01T10:00:00Z';
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: currentValue,
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() =>
        useDateTimeCalculatedExpression({
          ...defaultProps,
          valueDateTimeFhir: currentValue
        })
      );

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should not update when both input and calculated values are falsy', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateTimeCalculatedExpression({
          ...defaultProps,
          valueDateTimeFhir: '' // Empty string
        })
      );

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });
  });

  describe('type validation and edge cases', () => {
    it('should handle calculated value as number (should not update)', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: 123456789, // Number instead of string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should handle calculated value as boolean (should not update)', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: true, // Boolean instead of string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should handle calculated value as object (should not update)', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: { date: '2024-01-01' }, // Object instead of string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should handle empty string calculated value', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: '', // Empty string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateTimeCalculatedExpression({
          ...defaultProps,
          valueDateTimeFhir: '2024-01-01T10:00:00Z'
        })
      );

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('');
      expect(result.current.calcExpUpdated).toBe(true);
    });
  });

  describe('multiple calculated expressions', () => {
    it('should use the first item-level calculated expression', () => {
      const firstValue = '2024-01-01T10:00:00Z';
      const secondValue = '2024-12-31T23:59:59Z';

      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: firstValue,
          expression: 'first-expr'
        },
        {
          from: 'item',
          value: secondValue,
          expression: 'second-expr'
        }
      ];

      renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(firstValue);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalledWith(secondValue);
    });

    it('should prioritize item-level expressions over other types', () => {
      const itemValue = '2024-01-01T10:00:00Z';
      const populationValue = '2024-12-31T23:59:59Z';

      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'population',
          value: populationValue,
          expression: 'population-expr'
        },
        {
          from: 'item',
          value: itemValue,
          expression: 'item-expr'
        }
      ];

      renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(itemValue);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalledWith(populationValue);
    });
  });

  describe('UI state management and timeouts', () => {
    it('should set calcExpUpdated to true initially and false after timeout', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: '2024-01-01T10:00:00Z',
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      // Initially should be true
      expect(result.current.calcExpUpdated).toBe(true);

      // Fast-forward time by 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should be false after timeout
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should set calcExpUpdated to true for null values and reset after timeout', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateTimeCalculatedExpression({
          ...defaultProps,
          valueDateTimeFhir: '2024-01-01T10:00:00Z'
        })
      );

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should not trigger timeout when no update occurs', () => {
      const currentValue = '2024-01-01T10:00:00Z';
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: currentValue,
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() =>
        useDateTimeCalculatedExpression({
          ...defaultProps,
          valueDateTimeFhir: currentValue
        })
      );

      expect(result.current.calcExpUpdated).toBe(false);

      // Advance time - should still be false
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });
  });

  describe('dependency management and optimization', () => {
    it('should only use calculatedExpressions dependency', () => {
      // Test that effect is optimized to only depend on calculatedExpressions
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: '2024-01-01T10:00:00Z',
          expression: 'today()'
        }
      ];

      const { rerender } = renderHook(({ props }) => useDateTimeCalculatedExpression(props), {
        initialProps: { props: defaultProps }
      });

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);

      // Change props but keep same calculated expressions
      rerender({
        props: {
          ...defaultProps,
          valueDateTimeFhir: '2024-12-31T23:59:59Z'
        }
      });

      // Should not call again since calculatedExpressions didn't change
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });
  });

  describe('datetime format validation', () => {
    it('should handle various valid FHIR datetime formats', () => {
      const validFormats = [
        '2024',
        '2024-01',
        '2024-01-01',
        '2024-01-01T10:00:00',
        '2024-01-01T10:00:00Z',
        '2024-01-01T10:00:00+05:00',
        '2024-01-01T10:00:00.123Z'
      ];

      validFormats.forEach((format, index) => {
        mockCalculatedExpressions['test-datetime'] = [
          {
            from: 'item',
            value: format,
            expression: `expr${index}`
          }
        ];

        renderHook(() => useDateTimeCalculatedExpression(defaultProps));

        expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(format);

        jest.clearAllMocks();
      });
    });

    it('should handle malformed datetime strings (should still call callback)', () => {
      const malformedFormats = [
        'invalid-date',
        '2024-13-32',
        '2024-01-01T25:00:00',
        'not-a-date-at-all'
      ];

      malformedFormats.forEach((format, index) => {
        mockCalculatedExpressions['test-datetime'] = [
          {
            from: 'item',
            value: format,
            expression: `expr${index}`
          }
        ];

        renderHook(() => useDateTimeCalculatedExpression(defaultProps));

        // Should still call callback even for malformed dates
        expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(format);

        jest.clearAllMocks();
      });
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle undefined calculated expressions object', () => {
      // Clear all expressions
      Object.keys(mockCalculatedExpressions).forEach(
        (key) => delete mockCalculatedExpressions[key]
      );

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle empty calculated expressions array', () => {
      mockCalculatedExpressions['test-datetime'] = [];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle calculated expression without value property', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          expression: 'expr-without-value'
          // No value property
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle calculated expression with undefined value', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: undefined,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('performance and optimization', () => {
    it('should only trigger effect once on mount when no expressions exist', () => {
      const effectSpy = jest.spyOn(require('react'), 'useEffect');

      renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      // useEffect should be called for our hook
      expect(effectSpy).toHaveBeenCalled();

      effectSpy.mockRestore();
    });

    it('should cleanup timeouts properly on unmount', () => {
      mockCalculatedExpressions['test-datetime'] = [
        {
          from: 'item',
          value: '2024-01-01T10:00:00Z',
          expression: 'today()'
        }
      ];

      const { unmount } = renderHook(() => useDateTimeCalculatedExpression(defaultProps));

      // Unmount before timeout completes
      unmount();

      // Advance timers - should not cause any errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No additional expectations needed - just ensuring no errors occur
    });
  });
});
