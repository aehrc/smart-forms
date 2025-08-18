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
import useIntegerCalculatedExpression from '../hooks/useIntegerCalculatedExpression';

// Mock stores
const mockCalculatedExpressions: Record<string, any[]> = {};
let mockCalculatedExpressionsFunction = jest.fn(() => mockCalculatedExpressions);

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressionsFunction()
    }
  }
}));

describe('useIntegerCalculatedExpression', () => {
  // Mock props
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-integer',
    type: 'integer'
  };

  const mockOnChangeByCalcExpressionInteger = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    inputValue: '',
    onChangeByCalcExpressionInteger: mockOnChangeByCalcExpressionInteger,
    onChangeByCalcExpressionNull: mockOnChangeByCalcExpressionNull
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Clear mock objects
    Object.keys(mockCalculatedExpressions).forEach(key => delete mockCalculatedExpressions[key]);
    
    // Reset mock function
    mockCalculatedExpressionsFunction.mockClear();
    mockCalculatedExpressionsFunction.mockReturnValue(mockCalculatedExpressions);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization and basic behavior', () => {
    it('should return initial state when no calculated expression exists', () => {
      const { result } = renderHook(() => useIntegerCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not trigger callbacks when input and calculated values are both falsy', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression processing', () => {
    it('should handle null calculated value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '42' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
    });

    it('should handle integer calculated value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(100);
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle zero as calculated value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 0,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(0);
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle negative integer calculated value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: -25,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      renderHook(() => useIntegerCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(-25);
    });

    it('should handle large integer calculated value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 2147483647, // Max 32-bit signed integer
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100' };
      renderHook(() => useIntegerCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(2147483647);
    });

    it('should not update when calculated value equals parsed input value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 42,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '42' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (string)', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 'not-a-number',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (object)', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: { complex: 'object' },
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (boolean)', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('expression filtering', () => {
    it('should only process calculated expressions with from="item"', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'questionnaire',
          value: 200,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 150,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(150);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledTimes(1);
    });

    it('should not process when no item-level calculated expressions exist', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'questionnaire',
          value: 200,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('state management and timeouts', () => {
    it('should reset calcExpUpdated after timeout', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 75,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should clean up timeout on unmount for null value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50' };
      const { result, unmount } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });

    it('should clean up timeout on unmount for integer value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 75,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50' };
      const { result, unmount } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });
  });

  describe('integer parsing edge cases', () => {
    it('should handle input with leading/trailing whitespace', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: ' 100 ' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      // parseInt(' 100 ') === 100, so they should be equal, no update
      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
    });

    it('should handle non-numeric input value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'abc' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      // parseInt('abc') is NaN, NaN !== 100, so should update
      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(100);
    });

    it('should handle decimal input value (parsed as integer)', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 42,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '42.7' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      // parseInt('42.7') === 42, so they should be equal, no update
      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
    });

    it('should handle empty string input value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 50,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      // parseInt('') is NaN, NaN !== 50, so should update
      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(50);
    });

    it('should handle input value starting with zero', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 123,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '0123' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      // parseInt('0123') === 123, so they should be equal, no update
      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
    });

    it('should handle floating point calculated value', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 42.8, // Float, but should be treated as number
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '42' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      // 42.8 !== parseInt('42') (which is 42), so should update
      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(42.8);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple expressions and pick the first item-level one', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'questionnaire',
          value: 300,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 200,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50' };
      renderHook(() => useIntegerCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(200);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledTimes(1);
    });

    it('should handle empty expressions array', () => {
      mockCalculatedExpressions['test-integer'] = [];

      const props = { ...defaultProps, inputValue: '50' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle missing linkId in expressions', () => {
      // No expressions for this linkId at all
      const props = { ...defaultProps, inputValue: '50' };
      const { result } = renderHook(() => useIntegerCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionInteger).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('memoization and re-rendering', () => {
    it('should memoize results correctly', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(
        ({ props }) => useIntegerCalculatedExpression(props),
        { initialProps: { props: defaultProps } }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ props: defaultProps });

      expect(result.current).toStrictEqual(firstResult);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledTimes(1);
    });

    it('should recompute when calculatedExpressions change', () => {
      mockCalculatedExpressions['test-integer'] = [
        {
          from: 'item',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(
        ({ props }) => useIntegerCalculatedExpression(props),
        { initialProps: { props: defaultProps } }
      );

      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(100);

      // Change the calculated expressions - force new object reference
      const newCalculatedExpressions = {
        'test-integer': [
          {
            from: 'item',
            value: 200,
            expression: 'test-expr'
          }
        ]
      };
      
      mockCalculatedExpressionsFunction.mockReturnValueOnce(newCalculatedExpressions);

      rerender({ props: defaultProps });

      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledWith(200);
      expect(mockOnChangeByCalcExpressionInteger).toHaveBeenCalledTimes(2);
    });
  });
});
