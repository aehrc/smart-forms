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
import useBooleanCalculatedExpression from '../hooks/useBooleanCalculatedExpression';

// Mock stores
const mockCalculatedExpressions: Record<string, any[]> = {};
const mockCalculatedExpressionsFunction = jest.fn(() => mockCalculatedExpressions);

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressionsFunction()
    }
  }
}));

describe('useBooleanCalculatedExpression', () => {
  // Mock props
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-boolean',
    type: 'boolean'
  };

  const mockOnChangeByCalcExpressionBoolean = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    booleanValue: undefined,
    onChangeByCalcExpressionBoolean: mockOnChangeByCalcExpressionBoolean,
    onChangeByCalcExpressionNull: mockOnChangeByCalcExpressionNull
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear mock objects
    Object.keys(mockCalculatedExpressions).forEach((key) => {
      (mockCalculatedExpressions as any)[key] = undefined;
    });

    // Reset mock function
    mockCalculatedExpressionsFunction.mockClear();
    mockCalculatedExpressionsFunction.mockReturnValue(mockCalculatedExpressions);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization and basic behavior', () => {
    it('should return initial state when no calculated expression exists', () => {
      const { result } = renderHook(() => useBooleanCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not trigger callbacks when calculated expression is missing', () => {
      mockCalculatedExpressions['test-boolean'] = [];

      const { result } = renderHook(() => useBooleanCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression processing', () => {
    it('should handle null calculated value', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: true };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
    });

    it('should handle true calculated value', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle false calculated value', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: false,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: true };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(false);
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle changing from undefined to true', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: undefined };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);
    });

    it('should handle changing from undefined to false', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: false,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: undefined };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(false);
    });

    it('should handle changing from undefined to null', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: undefined };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
    });

    it('should not update when calculated value equals current value (true)', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: true };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not update when calculated value equals current value (false)', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: false,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (string)', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: 'not-a-boolean',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (number)', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: 1,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (object)', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: { complex: 'object' },
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (array)', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: [true, false],
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('expression filtering', () => {
    it('should only process calculated expressions with from="item"', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'questionnaire',
          value: false,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledTimes(1);
    });

    it('should not process when no item-level calculated expressions exist', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'questionnaire',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('state management and timeouts', () => {
    it('should reset calcExpUpdated after timeout', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should clean up timeout on unmount for null value', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: true };
      const { result, unmount } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });

    it('should clean up timeout on unmount for boolean value', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      const { result, unmount } = renderHook(() => useBooleanCalculatedExpression(props));

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
    it('should handle multiple expressions and pick the first item-level one', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'questionnaire',
          value: false,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: false,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledTimes(1);
    });

    it('should handle empty expressions array', () => {
      mockCalculatedExpressions['test-boolean'] = [];

      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle missing linkId in expressions', () => {
      // No expressions for this linkId at all
      const props = { ...defaultProps, booleanValue: false };
      const { result } = renderHook(() => useBooleanCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('complex boolean scenarios', () => {
    it('should handle switching from true to false', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: false,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: true };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(false);
    });

    it('should handle switching from false to true', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);
    });

    it('should handle switching from true to null', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: true };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
    });

    it('should handle switching from false to null', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, booleanValue: false };
      renderHook(() => useBooleanCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionBoolean).not.toHaveBeenCalled();
    });
  });

  describe('memoization and re-rendering', () => {
    it('should memoize results correctly', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(
        ({ props }) => useBooleanCalculatedExpression(props),
        { initialProps: { props: defaultProps } }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ props: defaultProps });

      expect(result.current).toStrictEqual(firstResult);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledTimes(1);
    });

    it('should recompute when calculatedExpressions change', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(
        ({ props }) => useBooleanCalculatedExpression(props),
        { initialProps: { props: defaultProps } }
      );

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);

      // Change the calculated expressions - force new object reference
      const newCalculatedExpressions = {
        'test-boolean': [
          {
            from: 'item',
            value: false,
            expression: 'test-expr'
          }
        ]
      };

      mockCalculatedExpressionsFunction.mockReturnValueOnce(newCalculatedExpressions);

      rerender({ props: defaultProps });

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(false);
      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledTimes(2);
    });

    it('should handle dynamic booleanValue changes', () => {
      mockCalculatedExpressions['test-boolean'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const { rerender } = renderHook(({ props }) => useBooleanCalculatedExpression(props), {
        initialProps: { props: { ...defaultProps, booleanValue: false } }
      });

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledWith(true);

      // Change booleanValue to match calculated value - should not trigger callback
      rerender({ props: { ...defaultProps, booleanValue: true } });

      expect(mockOnChangeByCalcExpressionBoolean).toHaveBeenCalledTimes(1);
    });
  });
});
