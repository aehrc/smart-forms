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
import type { QuestionnaireItem, Coding } from 'fhir/r4';
import useCodingCalculatedExpression, {
  objectIsCoding
} from '../hooks/useCodingCalculatedExpression';

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

describe('useCodingCalculatedExpression', () => {
  // Mock props
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-coding',
    type: 'choice'
  };

  const mockOnChangeByCalcExpressionString = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    valueInString: '',
    onChangeByCalcExpressionString: mockOnChangeByCalcExpressionString,
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
      const { result } = renderHook(() => useCodingCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not trigger callbacks when input and calculated values are both falsy', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: '' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression processing', () => {
    it('should handle null calculated value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'existing-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
    });

    it('should handle string calculated value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 'new-code-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('new-code-value');
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle number calculated value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 42,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('42');
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle Coding object calculated value', () => {
      const mockCoding: Coding = {
        system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
        code: 'DD',
        display: 'Discharge diagnosis'
      };

      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: mockCoding,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('DD');
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle Coding object without code property', () => {
      const mockCoding = {
        system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
        display: 'Discharge diagnosis'
        // Missing code property
      };

      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: mockCoding,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      // Should not call the string callback since no code property
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should handle invalid object (not a Coding)', () => {
      const mockObject = {
        name: 'not-a-coding',
        value: 'some-value'
      };

      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: mockObject,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      // Should fall through to string conversion
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('[object Object]');
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not update when calculated value equals current input value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 'same-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'same-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('expression filtering', () => {
    it('should only process calculated expressions with from="item"', () => {
      mockCalculatedExpressions['test-coding'] = [
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

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('item-value');
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });

    it('should not process when no item-level calculated expressions exist', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'questionnaire',
          value: 'questionnaire-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionString).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('state management and timeouts', () => {
    it('should reset calcExpUpdated after timeout', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 'new-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should clean up timeout on unmount for null value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result, unmount } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });

    it('should clean up timeout on unmount for Coding value', () => {
      const mockCoding: Coding = {
        code: 'test-code'
      };

      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: mockCoding,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result, unmount } = renderHook(() => useCodingCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(true);

      unmount();

      // Fast-forward past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No errors should occur from the timeout trying to update state after unmount
    });

    it('should clean up timeout on unmount for string/number value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 'new-value',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      const { result, unmount } = renderHook(() => useCodingCalculatedExpression(props));

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
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 0,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      renderHook(() => useCodingCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('0');
    });

    it('should handle empty string as calculated value', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: '',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      renderHook(() => useCodingCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('');
    });

    it('should handle boolean values (converted to string)', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: true,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      renderHook(() => useCodingCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('true');
    });

    it('should handle array values (converted to string)', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: ['value1', 'value2'],
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, valueInString: 'old-value' };
      renderHook(() => useCodingCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('value1,value2');
    });
  });

  describe('memoization and re-rendering', () => {
    it('should memoize results correctly', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 'test-value',
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(({ props }) => useCodingCalculatedExpression(props), {
        initialProps: { props: defaultProps }
      });

      const firstResult = result.current;

      // Rerender with same props
      rerender({ props: defaultProps });

      expect(result.current).toStrictEqual(firstResult);
      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledTimes(1);
    });

    it('should recompute when calculatedExpressions change', () => {
      mockCalculatedExpressions['test-coding'] = [
        {
          from: 'item',
          value: 'first-value',
          expression: 'test-expr'
        }
      ];

      const { result, rerender } = renderHook(({ props }) => useCodingCalculatedExpression(props), {
        initialProps: { props: defaultProps }
      });

      expect(mockOnChangeByCalcExpressionString).toHaveBeenCalledWith('first-value');

      // Change the calculated expressions - force new object reference
      const newCalculatedExpressions = {
        'test-coding': [
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
});

describe('objectIsCoding', () => {
  it('should return true for valid Coding objects', () => {
    const validCoding: Coding = {
      system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
      code: 'DD',
      display: 'Discharge diagnosis'
    };

    expect(objectIsCoding(validCoding)).toBe(true);
  });

  it('should return true for minimal Coding objects with just code', () => {
    const minimalCoding = {
      code: 'test-code'
    };

    expect(objectIsCoding(minimalCoding)).toBe(true);
  });

  it('should return false for objects without code property', () => {
    const invalidCoding = {
      system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
      display: 'Discharge diagnosis'
    };

    expect(objectIsCoding(invalidCoding)).toBe(false);
  });

  it('should return false for objects with non-string code', () => {
    const invalidCoding = {
      code: 123,
      display: 'Invalid code'
    };

    expect(objectIsCoding(invalidCoding)).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(objectIsCoding(null)).toBe(false);
    expect(objectIsCoding(undefined)).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(objectIsCoding('string')).toBe(false);
    expect(objectIsCoding(123)).toBe(false);
    expect(objectIsCoding(true)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(objectIsCoding(['code'])).toBe(false);
    expect(objectIsCoding([{ code: 'test' }])).toBe(false);
  });

  it('should return false for empty objects', () => {
    expect(objectIsCoding({})).toBe(false);
  });
});
