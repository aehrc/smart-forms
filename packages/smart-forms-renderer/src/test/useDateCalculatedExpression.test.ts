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
import useDateCalculatedExpression from '../hooks/useDateCalculatedExpression';

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

describe('useDateCalculatedExpression', () => {
  // Mock data
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-date',
    type: 'date',
    text: 'Test Date'
  };

  const mockOnChangeByCalcExpressionString = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    valueDateFhir: '',
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
      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should not call any callbacks when no calculated expression exists', () => {
      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not call callbacks when calculated expression is not from item', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'population',
          value: '2024-01-01',
          expression: 'test-expr'
        }
      ];

      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression handling', () => {
    it('should call onChangeByCalcExpressionString when calculated value is string and different from current', () => {
      const calculatedValue = '2024-01-01';
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: calculatedValue,
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(calculatedValue);
      expect(result.current.calcExpUpdated).toBe(true);
    });

    it('should call onChangeByCalcExpressionNull when calculated value is null', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateCalculatedExpression({
          ...defaultProps,
          valueDateFhir: '2024-01-01' // Current value exists
        })
      );

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(true);
    });

    it('should not update when calculated value equals current value', () => {
      const currentValue = '2024-01-01';
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: currentValue,
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() =>
        useDateCalculatedExpression({
          ...defaultProps,
          valueDateFhir: currentValue
        })
      );

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should not update when both input and calculated values are falsy', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateCalculatedExpression({
          ...defaultProps,
          valueDateFhir: '' // Empty string
        })
      );

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });
  });

  describe('type validation and edge cases', () => {
    it('should handle calculated value as number (should not update)', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: 20240101, // Number instead of string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should handle calculated value as boolean (should not update)', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: true, // Boolean instead of string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should handle calculated value as object (should not update)', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: { date: '2024-01-01' }, // Object instead of string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should handle empty string calculated value', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: '', // Empty string
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateCalculatedExpression({
          ...defaultProps,
          valueDateFhir: '2024-01-01'
        })
      );

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('');
      expect(result.current.calcExpUpdated).toBe(true);
    });
  });

  describe('multiple calculated expressions', () => {
    it('should use the first item-level calculated expression', () => {
      const firstValue = '2024-01-01';
      const secondValue = '2024-12-31';

      mockCalculatedExpressions['test-date'] = [
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

      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(firstValue);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalledWith(secondValue);
    });

    it('should prioritize item-level expressions over other types', () => {
      const itemValue = '2024-01-01';
      const populationValue = '2024-12-31';

      mockCalculatedExpressions['test-date'] = [
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

      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(itemValue);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalledWith(populationValue);
    });
  });

  describe('UI state management and timeouts', () => {
    it('should set calcExpUpdated to true initially and false after timeout', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: '2024-01-01',
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

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
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() =>
        useDateCalculatedExpression({
          ...defaultProps,
          valueDateFhir: '2024-01-01'
        })
      );

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should not trigger timeout when no update occurs', () => {
      const currentValue = '2024-01-01';
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: currentValue,
          expression: 'today()'
        }
      ];

      const { result } = renderHook(() =>
        useDateCalculatedExpression({
          ...defaultProps,
          valueDateFhir: currentValue
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
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: '2024-01-01',
          expression: 'today()'
        }
      ];

      const { rerender } = renderHook(({ props }) => useDateCalculatedExpression(props), {
        initialProps: { props: defaultProps }
      });

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);

      // Change props but keep same calculated expressions
      rerender({
        props: {
          ...defaultProps,
          valueDateFhir: '2024-12-31'
        }
      });

      // Should not call again since calculatedExpressions didn't change
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });
  });

  describe('date format validation', () => {
    it('should handle various valid FHIR date formats', () => {
      const validFormats = ['2024', '2024-01', '2024-01-01', '2024-12-31'];

      validFormats.forEach((format, index) => {
        mockCalculatedExpressions['test-date'] = [
          {
            from: 'item',
            value: format,
            expression: `expr${index}`
          }
        ];

        renderHook(() => useDateCalculatedExpression(defaultProps));

        expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(format);

        jest.clearAllMocks();
      });
    });

    it('should handle malformed date strings (should still call callback)', () => {
      const malformedFormats = [
        'invalid-date',
        '2024-13-32',
        '2024-00-01',
        'not-a-date-at-all',
        '24-01-01', // Wrong year format
        '2024/01/01' // Wrong separator
      ];

      malformedFormats.forEach((format, index) => {
        mockCalculatedExpressions['test-date'] = [
          {
            from: 'item',
            value: format,
            expression: `expr${index}`
          }
        ];

        renderHook(() => useDateCalculatedExpression(defaultProps));

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

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle empty calculated expressions array', () => {
      mockCalculatedExpressions['test-date'] = [];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle calculated expression without value property', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          expression: 'expr-without-value'
          // No value property
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle calculated expression with undefined value', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: undefined,
          expression: 'test-expr'
        }
      ];

      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('date-specific scenarios', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29'; // 2024 is a leap year
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: leapYearDate,
          expression: 'leap-year-expr'
        }
      ];

      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(leapYearDate);
    });

    it('should handle invalid leap year dates', () => {
      const invalidLeapDate = '2023-02-29'; // 2023 is not a leap year
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: invalidLeapDate,
          expression: 'invalid-leap-expr'
        }
      ];

      renderHook(() => useDateCalculatedExpression(defaultProps));

      // Should still call callback - validation is not the hook's responsibility
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(invalidLeapDate);
    });

    it('should handle year-only dates', () => {
      const yearOnly = '2024';
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: yearOnly,
          expression: 'year-only-expr'
        }
      ];

      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(yearOnly);
    });

    it('should handle year-month dates', () => {
      const yearMonth = '2024-12';
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: yearMonth,
          expression: 'year-month-expr'
        }
      ];

      renderHook(() => useDateCalculatedExpression(defaultProps));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(yearMonth);
    });

    it('should handle different date transitions', () => {
      const transitions = [
        { from: '2023-12-31', to: '2024-01-01' }, // Year transition
        { from: '2024-01-31', to: '2024-02-01' }, // Month transition
        { from: '2024-02-28', to: '2024-02-29' } // Leap year transition
      ];

      transitions.forEach(({ from, to }, index) => {
        mockCalculatedExpressions['test-date'] = [
          {
            from: 'item',
            value: to,
            expression: `transition-expr-${index}`
          }
        ];

        const { result } = renderHook(() =>
          useDateCalculatedExpression({
            ...defaultProps,
            valueDateFhir: from
          })
        );

        expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith(to);
        expect(result.current.calcExpUpdated).toBe(true);

        jest.clearAllMocks();
      });
    });
  });

  describe('performance and optimization', () => {
    it('should only trigger effect once on mount when no expressions exist', () => {
      // This test verifies that the hook initializes correctly without calculated expressions
      // The hook should still mount and initialize state properly
      const { result } = renderHook(() => useDateCalculatedExpression(defaultProps));

      // Verify initial state is correct
      expect(result.current.calcExpUpdated).toBe(false);

      // Verify no callbacks were called since there are no calculated expressions
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should cleanup timeouts properly on unmount', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: '2024-01-01',
          expression: 'today()'
        }
      ];

      const { unmount } = renderHook(() => useDateCalculatedExpression(defaultProps));

      // Unmount before timeout completes
      unmount();

      // Advance timers - should not cause any errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No additional expectations needed - just ensuring no errors occur
    });

    it('should handle rapid prop changes efficiently', () => {
      mockCalculatedExpressions['test-date'] = [
        {
          from: 'item',
          value: '2024-01-01',
          expression: 'today()'
        }
      ];

      const { rerender } = renderHook(({ props }) => useDateCalculatedExpression(props), {
        initialProps: { props: defaultProps }
      });

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);

      // Rapid prop changes
      for (let i = 2; i <= 5; i++) {
        rerender({
          props: {
            ...defaultProps,
            valueDateFhir: `2024-01-0${i}`
          }
        });
      }

      // Should still only be called once since calculatedExpressions didn't change
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });
  });
});
