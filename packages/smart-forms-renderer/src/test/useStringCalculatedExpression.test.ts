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
import useStringCalculatedExpression from '../hooks/useStringCalculatedExpression';

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

describe('useStringCalculatedExpression', () => {
  // Mock props
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-string',
    type: 'string'
  };

  const mockOnChangeByCalcExpressionString = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    inputValue: '',
    onChangeByCalcExpressionString: mockOnChangeByCalcExpressionString,
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
      const { result } = renderHook(() => useStringCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not trigger callbacks when input and calculated values are both falsy', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression processing', () => {
    it('should handle null calculated value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'existing-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
    });

    it('should handle string calculated value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'new-string-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('new-string-value');
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle number calculated value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 42,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('42');
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not update when calculated value equals current input value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'same-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'same-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: { complex: 'object' },
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore boolean value types', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore array value types', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: ['value1', 'value2'],
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('expression filtering', () => {
    it('should only process calculated expressions with from="item"', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'questionnaire',
          value: 'questionnaire-value',
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 'item-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('item-value');
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });

    it('should not process when no item-level calculated expressions exist', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'questionnaire',
          value: 'questionnaire-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('state management and timeouts', () => {
    it('should reset calcExpUpdated after timeout', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'new-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should clean up timeout on unmount for null value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result, unmount } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });

    it('should clean up timeout on unmount for string/number value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'new-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result, unmount } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });
  });

  describe('edge cases', () => {
    it('should handle zero as a number value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 0,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('0');
    });

    it('should handle empty string as calculated value', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: '',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('');
    });

    it('should handle negative numbers correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: -42,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('-42');
    });

    it('should handle floating point numbers correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 3.14159,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('3.14159');
    });

    it('should handle very large numbers correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 9007199254740991, // Number.MAX_SAFE_INTEGER
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('9007199254740991');
    });

    it('should handle special number values correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: Infinity,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('Infinity');
    });

    it('should handle NaN values correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: NaN,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('NaN');
    });

    it('should handle multiline strings correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'Line 1\nLine 2\nLine 3',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('Line 1\nLine 2\nLine 3');
    });

    it('should handle strings with special characters correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'Special chars: !@#$%^&*()[]{}|;:,.<>?',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('Special chars: !@#$%^&*()[]{}|;:,.<>?');
    });

    it('should handle unicode strings correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: '🚀 Unicode test 日本語 emoji! 🎉',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('🚀 Unicode test 日本語 emoji! 🎉');
    });
  });

  describe('memoization and re-rendering', () => {
    it('should memoize results correctly', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'test-value',
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(
        ({ props }) => useStringCalculatedExpression(props),
        { initialProps: { props: defaultProps } }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ props: defaultProps });

      expect(result.current).toStrictEqual(firstResult);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });

    it('should recompute when calculatedExpressions change', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'item',
          value: 'first-value',
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(
        ({ props }) => useStringCalculatedExpression(props),
        { initialProps: { props: defaultProps } }
      );

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('first-value');

      // Change the calculated expressions - force new object reference 
      const newCalculatedExpressions = {
        'test-string': [
          {
            from: 'item',
            value: 'second-value',
            expression: 'test-expr'
          }
        ]
      };
      
      mockCalculatedExpressionsFunction.mockReturnValueOnce(newCalculatedExpressions);

      rerender({ props: defaultProps });

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('second-value');
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(2);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple expressions and pick the first item-level one', () => {
      mockCalculatedExpressions['test-string'] = [
        {
          from: 'questionnaire',
          value: 'questionnaire-first',
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 'item-first',
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 'item-second',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'old-value' };
      renderHook(() => useStringCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('item-first');
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });

    it('should handle empty expressions array', () => {
      mockCalculatedExpressions['test-string'] = [];

      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle missing linkId in expressions', () => {
      // No expressions for this linkId at all
      const props = { ...defaultProps, inputValue: 'old-value' };
      const { result } = renderHook(() => useStringCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });
});
