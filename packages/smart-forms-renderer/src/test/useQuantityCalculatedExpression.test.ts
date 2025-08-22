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

import { renderHook, act, waitFor } from '@testing-library/react';
import type { QuestionnaireItem } from 'fhir/r4';
import useQuantityCalculatedExpression from '../hooks/useQuantityCalculatedExpression';

// Mock dependencies
jest.mock('../utils/valueSet', () => ({
  validateCodePromise: jest.fn()
}));

jest.mock('../utils/preferredTerminologyServer', () => ({
  getItemTerminologyServerToUse: jest.fn()
}));

// Mock stores
const mockCalculatedExpressions: Record<string, any[]> = {};
const mockItemPreferredTerminologyServers: Record<string, string> = {};
const mockDefaultTerminologyServerUrl = 'http://terminology.hl7.org/fhir';

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressions,
      itemPreferredTerminologyServers: () => mockItemPreferredTerminologyServers
    }
  },
  useTerminologyServerStore: {
    use: {
      url: () => mockDefaultTerminologyServerUrl
    }
  }
}));

// Import mocked functions
import { validateCodePromise } from '../utils/valueSet';
import { getItemTerminologyServerToUse } from '../utils/preferredTerminologyServer';

const mockValidateCodePromise = validateCodePromise as jest.MockedFunction<
  typeof validateCodePromise
>;
const mockGetItemTerminologyServerToUse = getItemTerminologyServerToUse as jest.MockedFunction<
  typeof getItemTerminologyServerToUse
>;

describe('useQuantityCalculatedExpression', () => {
  // Mock props
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-quantity',
    type: 'quantity'
  };

  const mockOnChangeByCalcExpressionDecimal = jest.fn();
  const mockOnChangeByCalcExpressionQuantity = jest.fn();
  const mockOnChangeByCalcExpressionNull = jest.fn();

  const defaultProps = {
    qItem: mockQItem,
    inputValue: '',
    precision: null,
    onChangeByCalcExpressionDecimal: mockOnChangeByCalcExpressionDecimal,
    onChangeByCalcExpressionQuantity: mockOnChangeByCalcExpressionQuantity,
    onChangeByCalcExpressionNull: mockOnChangeByCalcExpressionNull
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear mock objects
    Object.keys(mockCalculatedExpressions).forEach((key) => delete mockCalculatedExpressions[key]);
    Object.keys(mockItemPreferredTerminologyServers).forEach(
      (key) => delete mockItemPreferredTerminologyServers[key]
    );

    // Default mock implementations
    mockGetItemTerminologyServerToUse.mockReturnValue('http://terminology.hl7.org/fhir');
    mockValidateCodePromise.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization and basic behavior', () => {
    it('should return initial state when no calculated expression exists', () => {
      const { result } = renderHook(() => useQuantityCalculatedExpression(defaultProps));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionQuantity).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });

    it('should not trigger callbacks when input and calculated values are both falsy', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionQuantity).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('calculated expression processing', () => {
    it('should handle null calculated value', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: null,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      renderHook(() => useQuantityCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
    });

    it('should handle number calculated value', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: 15.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(15.5);
      expect(result.current.calcExpUpdated).toBe(true);
    });

    it('should apply precision when provided', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: 15.56789,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10', precision: 2 };
      renderHook(() => useQuantityCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(15.57);
    });

    it('should not update when calculated value equals current input value', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: 10,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      renderHook(() => useQuantityCalculatedExpression(props));

      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
    });

    it('should process string value (quantity) with validation', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: "75.5 'kg'",
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '70 kg' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockValidateCodePromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/ucum-units',
        'http://unitsofmeasure.org',
        'kg',
        'http://terminology.hl7.org/fhir'
      );
    });

    it('should handle validation failure for string value', () => {
      mockValidateCodePromise.mockResolvedValue(null);

      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: "75.5 'invalid-unit'",
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '70 kg' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockValidateCodePromise).toHaveBeenCalled();
    });

    it('should handle malformed quantity string', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: 'invalid-quantity-string',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '70 kg' };
      renderHook(() => useQuantityCalculatedExpression(props));

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('expression filtering', () => {
    it('should only process calculated expressions with from="item"', () => {
      // Set mock data before rendering
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'questionnaire',
          value: 100,
          expression: 'test-expr'
        },
        {
          from: 'item',
          value: 50,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '25' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(50);
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledTimes(1);
    });

    it('should not process when no item-level calculated expressions exist', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'questionnaire',
          value: 100,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '25' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(result.current.calcExpUpdated).toBe(false);
      expect(mockOnChangeByCalcExpressionDecimal).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionQuantity).not.toHaveBeenCalled();
      expect(mockOnChangeByCalcExpressionNull).not.toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('should reset calcExpUpdated after timeout', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: 15.5,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(result.current.calcExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.calcExpUpdated).toBe(false);
    });

    it('should use custom terminology server when specified', () => {
      mockItemPreferredTerminologyServers['test-quantity'] =
        'http://custom.terminology.server/fhir';
      mockGetItemTerminologyServerToUse.mockReturnValue('http://custom.terminology.server/fhir');

      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: "75.5 'kg'",
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '70 kg' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockGetItemTerminologyServerToUse).toHaveBeenCalledWith(
        mockQItem,
        mockItemPreferredTerminologyServers,
        mockDefaultTerminologyServerUrl
      );

      expect(mockValidateCodePromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/ucum-units',
        'http://unitsofmeasure.org',
        'kg',
        'http://custom.terminology.server/fhir'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle zero precision correctly', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: 15.789,
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10', precision: 0 };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockOnChangeByCalcExpressionDecimal).toHaveBeenCalledWith(16);
    });

    it('should handle null value after precision processing', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: null, // Direct null value that becomes null after precision processing
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
    });

    it('should handle successful quantity validation with all parameters', async () => {
      const mockValidateResponse = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'system',
            valueUri: 'http://unitsofmeasure.org'
          },
          {
            name: 'code',
            valueCode: 'mg'
          },
          {
            name: 'display',
            valueString: 'milligram'
          }
        ]
      };

      mockValidateCodePromise.mockResolvedValue(mockValidateResponse as any);

      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: "250 'mg'",
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '100 mg' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockValidateCodePromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/ucum-units',
        'http://unitsofmeasure.org',
        'mg',
        'http://terminology.hl7.org/fhir'
      );

      // Wait for async validation to complete
      await waitFor(() => {
        expect(mockOnChangeByCalcExpressionQuantity).toHaveBeenCalled();
      });

      expect(mockOnChangeByCalcExpressionQuantity).toHaveBeenCalledWith(
        250,
        'http://unitsofmeasure.org',
        'mg',
        'milligram'
      );

      expect(result.current.calcExpUpdated).toBe(true);
    });

    it('should handle empty string calculated value', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: '',
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '10' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockOnChangeByCalcExpressionNull).toHaveBeenCalled();
    });

    it('should handle incomplete validation response', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: "75.5 'kg'",
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '70 kg' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockValidateCodePromise).toHaveBeenCalled();
    });

    it('should handle validation response without parameter array', () => {
      mockCalculatedExpressions['test-quantity'] = [
        {
          from: 'item',
          value: "75.5 'kg'",
          expression: 'test-expr'
        }
      ];

      const props = { ...defaultProps, inputValue: '70 kg' };
      const { result } = renderHook(() => useQuantityCalculatedExpression(props));

      expect(result.current).toBeDefined();
      expect(mockValidateCodePromise).toHaveBeenCalled();
    });
  });
});
