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
import useDecimalCalculatedExpression from '../hooks/useDecimalCalculatedExpression';

// Mock stores
const mockCalculatedExpressions: Record<string, any[]> = {};

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressions
    }
  }
}));

describe('useDecimalCalculatedExpression', () => {
  // Mock props
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-decimal',
    type: 'decimal'
  };

  const mockOnChangeByCalcExpressionDecimal = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    inputValue: '',
    precision: null,
    onChangeByCalcExpressionDecimal: mockOnChangeByCalcExpressionDecimal,
    onChangeByCalcExpressionNull: mockOnChangeByCalcExpressionNull
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear mock objects
    Object.keys(mockCalculatedExpressions).forEach((key) => delete mockCalculatedExpressions[key]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization and basic behavior', () => {
    it('should return initial state when no calculated expression exists', () => {
      const { result } = renderHook(() => useDecimalCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not trigger callbacks when input and calculated values are both falsy', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression processing', () => {
    it('should handle null calculated value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '3.14' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
    });

    it('should handle decimal calculated value without precision', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 15.789,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(15.789);
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle decimal calculated value with precision', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 15.789123,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5', precision: 2 };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(15.79);
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle zero precision', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 15.789,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5', precision: 0 };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(16);
    });

    it('should handle high precision', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 3.141592653589793,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '3.14', precision: 5 };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(3.14159);
    });

    it('should handle integer calculated value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 42,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '25.5' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(42);
    });

    it('should handle zero as calculated value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 0,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(0);
    });

    it('should handle negative decimal calculated value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: -25.75,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(-25.75);
    });

    it('should not update when calculated value equals parsed input value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 42.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '42.5' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not update when precision-rounded value equals parsed input', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 42.567,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '42.57', precision: 2 };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (string)', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 'not-a-number',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (object)', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: { complex: 'object' },
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should ignore non-supported value types (boolean)', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('expression filtering', () => {
    it('should only process calculated expressions with from="item"', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'questionnaire',
          value: 200.5,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 150.75,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100.25' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(150.75);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledTimes(1);
    });

    it('should not process when no item-level calculated expressions exist', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'questionnaire',
          value: 200.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100.25' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('state management and timeouts', () => {
    it('should reset calcExpUpdated after timeout', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 75.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50.25' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should clean up timeout on unmount for null value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50.25' };
      const { result, unmount } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });

    it('should clean up timeout on unmount for decimal value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 75.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50.25' };
      const { result, unmount } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });
  });

  describe('decimal parsing edge cases', () => {
    it('should handle input with leading/trailing whitespace', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 100.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: ' 100.5 ' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      // parseFloat(' 100.5 ') === 100.5, so they should be equal, no update
      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
    });

    it('should handle non-numeric input value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 100.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: 'abc' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      // parseFloat('abc') is NaN, NaN !== 100.5, so should update
      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(100.5);
    });

    it('should handle empty string input value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 50.25,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      // parseFloat('') is NaN, NaN !== 50.25, so should update
      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(50.25);
    });

    it('should handle scientific notation input', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 0.001,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '1e-3' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      // parseFloat('1e-3') === 0.001, so they should be equal, no update
      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
    });

    it('should handle very large numbers correctly', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 1e10,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '5000000000' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(1e10);
    });

    it('should handle very small numbers correctly', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 1e-10,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '0.00001' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(1e-10);
    });

    it('should handle special values (Infinity)', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: Infinity,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(Infinity);
    });

    it('should handle special values (NaN)', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: NaN,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      // NaN !== parseFloat('100'), so should update
      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(NaN);
    });
  });

  describe('precision handling edge cases', () => {
    it('should not apply precision when precision is null', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 15.789123,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5', precision: null };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(15.789123);
    });

    it('should handle precision with null calculated value', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5', precision: 2 };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
    });

    it('should handle maximum precision (100)', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'item',
          value: 15.789123456789,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10.5', precision: 100 };
      renderHook(() => useDecimalCalculatedExpression(props));

      // toFixed(100) should work and pad with zeros
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalled();
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple expressions and pick the first item-level one', () => {
      mockCalculatedExpressions['test-decimal'] = [
        {
          from: 'questionnaire',
          value: 300.25,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 200.75,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 100.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '50.25' };
      renderHook(() => useDecimalCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(200.75);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledTimes(1);
    });

    it('should handle empty expressions array', () => {
      mockCalculatedExpressions['test-decimal'] = [];

      const props = { ...defaultProps, inputValue: '50.25' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle missing linkId in expressions', () => {
      // No expressions for this linkId at all
      const props = { ...defaultProps, inputValue: '50.25' };
      const { result } = renderHook(() => useDecimalCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });
});
