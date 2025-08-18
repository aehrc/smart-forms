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
import type { QuestionnaireItem, OperationOutcome } from 'fhir/r4';
import useValidationFeedback from '../hooks/useValidationFeedback';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';

// Mock dependencies
jest.mock('../utils/extensions', () => ({
  getMaxQuantityValue: jest.fn(),
  getMaxQuantityValueFeedback: jest.fn(),
  getMaxValue: jest.fn(),
  getMaxValueFeedback: jest.fn(),
  getMinQuantityValue: jest.fn(),
  getMinQuantityValueFeedback: jest.fn(),
  getMinValue: jest.fn(),
  getMinValueFeedback: jest.fn(),
  getRegexValidation: jest.fn(),
  getRequiredFeedback: jest.fn()
}));

jest.mock('fhir-sdc-helpers', () => ({
  structuredDataCapture: {
    getMinLength: jest.fn(),
    getMaxDecimalPlaces: jest.fn()
  }
}));

// Mock stores
let mockInvalidItems: Record<string, OperationOutcome> = {};
let mockRequiredItemsIsHighlighted = false;
let mockTargetConstraints: Record<string, TargetConstraint> = {};
let mockTargetConstraintLinkIds: Record<string, string[]> = {};

jest.mock('../stores', () => ({
  useQuestionnaireResponseStore: {
    use: {
      invalidItems: () => mockInvalidItems,
      requiredItemsIsHighlighted: () => mockRequiredItemsIsHighlighted
    }
  },
  useQuestionnaireStore: {
    use: {
      targetConstraints: () => mockTargetConstraints,
      targetConstraintLinkIds: () => mockTargetConstraintLinkIds
    }
  }
}));

// Import mocked functions
import {
  getMaxQuantityValue,
  getMaxQuantityValueFeedback,
  getMaxValue,
  getMaxValueFeedback,
  getMinQuantityValue,
  getMinQuantityValueFeedback,
  getMinValue,
  getMinValueFeedback,
  getRegexValidation,
  getRequiredFeedback
} from '../utils/extensions';
import { structuredDataCapture } from 'fhir-sdc-helpers';

const mockGetMaxQuantityValue = getMaxQuantityValue as jest.MockedFunction<typeof getMaxQuantityValue>;
const mockGetMaxQuantityValueFeedback = getMaxQuantityValueFeedback as jest.MockedFunction<typeof getMaxQuantityValueFeedback>;
const mockGetMaxValue = getMaxValue as jest.MockedFunction<typeof getMaxValue>;
const mockGetMaxValueFeedback = getMaxValueFeedback as jest.MockedFunction<typeof getMaxValueFeedback>;
const mockGetMinQuantityValue = getMinQuantityValue as jest.MockedFunction<typeof getMinQuantityValue>;
const mockGetMinQuantityValueFeedback = getMinQuantityValueFeedback as jest.MockedFunction<typeof getMinQuantityValueFeedback>;
const mockGetMinValue = getMinValue as jest.MockedFunction<typeof getMinValue>;
const mockGetMinValueFeedback = getMinValueFeedback as jest.MockedFunction<typeof getMinValueFeedback>;
const mockGetRegexValidation = getRegexValidation as jest.MockedFunction<typeof getRegexValidation>;
const mockGetRequiredFeedback = getRequiredFeedback as jest.MockedFunction<typeof getRequiredFeedback>;
const mockStructuredDataCapture = structuredDataCapture as jest.Mocked<typeof structuredDataCapture>;

describe('useValidationFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock state
    mockInvalidItems = {};
    mockRequiredItemsIsHighlighted = false;
    mockTargetConstraints = {};
    mockTargetConstraintLinkIds = {};
    
    // Reset mock implementations
    mockGetMaxQuantityValue.mockReturnValue(undefined);
    mockGetMaxQuantityValueFeedback.mockReturnValue(null);
    mockGetMaxValue.mockReturnValue(undefined);
    mockGetMaxValueFeedback.mockReturnValue(null);
    mockGetMinQuantityValue.mockReturnValue(undefined);
    mockGetMinQuantityValueFeedback.mockReturnValue(null);
    mockGetMinValue.mockReturnValue(undefined);
    mockGetMinValueFeedback.mockReturnValue(null);
    mockGetRegexValidation.mockReturnValue(undefined);
    mockGetRequiredFeedback.mockReturnValue(null);
    mockStructuredDataCapture.getMinLength.mockReturnValue(undefined);
    mockStructuredDataCapture.getMaxDecimalPlaces.mockReturnValue(undefined);
  });

  describe('target constraint validation', () => {
    it('should return target constraint feedback when constraint is invalid', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockTargetConstraintLinkIds = {
        'test-item': ['constraint1']
      };

      mockTargetConstraints = {
        'constraint1': {
          isInvalid: true,
          human: 'Target constraint violated'
        } as TargetConstraint
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Target constraint violated');
    });

    it('should skip valid target constraints', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockTargetConstraintLinkIds = {
        'test-item': ['constraint1']
      };

      mockTargetConstraints = {
        'constraint1': {
          isInvalid: false,
          human: 'Should not be returned'
        } as TargetConstraint
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('');
    });

    it('should return first invalid constraint when multiple constraints exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockTargetConstraintLinkIds = {
        'test-item': ['constraint1', 'constraint2']
      };

      mockTargetConstraints = {
        'constraint1': {
          isInvalid: true,
          human: 'First constraint error'
        } as TargetConstraint,
        'constraint2': {
          isInvalid: true,
          human: 'Second constraint error'
        } as TargetConstraint
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('First constraint error');
    });

    it('should handle missing target constraint', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockTargetConstraintLinkIds = {
        'test-item': ['missing-constraint']
      };

      mockTargetConstraints = {};

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('');
    });
  });

  describe('feedback from parent', () => {
    it('should return parent feedback when provided', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, 'Parent validation error'));

      expect(result.current).toBe('Parent validation error');
    });

    it('should prioritize target constraints over parent feedback', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockTargetConstraintLinkIds = {
        'test-item': ['constraint1']
      };

      mockTargetConstraints = {
        'constraint1': {
          isInvalid: true,
          human: 'Target constraint error'
        } as TargetConstraint
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, 'Parent error'));

      expect(result.current).toBe('Target constraint error');
    });
  });

  describe('invalid items validation', () => {
    it('should return empty string when no invalid items exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('');
    });

    it('should return error message when operation outcome has no issues', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: []
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.');
    });

    it('should return error message when operation outcome has no issues property', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: []
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.');
    });
  });

  describe('required field validation', () => {
    it('should return required feedback when required items are highlighted', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockRequiredItemsIsHighlighted = true;
      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'required',
              details: {
                coding: [{ code: 'required' }]
              }
            }
          ]
        }
      };

      mockGetRequiredFeedback.mockReturnValue('Custom required message');

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Custom required message');
      expect(mockGetRequiredFeedback).toHaveBeenCalledWith(qItem);
    });

    it('should return default required message when no custom feedback', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockRequiredItemsIsHighlighted = true;
      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'required',
              details: {
                coding: [{ code: 'required' }]
              }
            }
          ]
        }
      };

      mockGetRequiredFeedback.mockReturnValue(null);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('This field is required.');
    });

    it('should not return required feedback when required items are not highlighted', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockRequiredItemsIsHighlighted = false;
      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'required',
              details: {
                coding: [{ code: 'required' }]
              }
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('');
    });
  });

  describe('regex validation', () => {
    it('should return regex feedback with expression', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'regex' }]
              }
            }
          ]
        }
      };

      mockGetRegexValidation.mockReturnValue({
        expression: /^[A-Z]+$/,
        feedback: null
      });

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input should match the specified regex: /^[A-Z]+$/');
      expect(mockGetRegexValidation).toHaveBeenCalledWith(qItem);
    });

    it('should return default regex message when no expression found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'regex' }]
              }
            }
          ]
        }
      };

      mockGetRegexValidation.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input should match the specified regex.');
    });
  });

  describe('minLength validation', () => {
    it('should return minLength feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minLength' }]
              }
            }
          ]
        }
      };

      mockStructuredDataCapture.getMinLength.mockReturnValue(5);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter at least 5 characters.');
      expect(mockStructuredDataCapture.getMinLength).toHaveBeenCalledWith(qItem);
    });

    it('should return default minLength message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minLength' }]
              }
            }
          ]
        }
      };

      mockStructuredDataCapture.getMinLength.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is below the minimum character limit.');
    });
  });

  describe('maxLength validation', () => {
    it('should return maxLength feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        maxLength: 10
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxLength' }]
              }
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter no more than 10 characters.');
    });

    it('should return default maxLength message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxLength' }]
              }
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is above the maximum character limit.');
    });
  });

  describe('maxDecimalPlaces validation', () => {
    it('should return maxDecimalPlaces feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'decimal'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxDecimalPlaces' }]
              }
            }
          ]
        }
      };

      mockStructuredDataCapture.getMaxDecimalPlaces.mockReturnValue(2);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter a number with no more than 2 decimal places.');
      expect(mockStructuredDataCapture.getMaxDecimalPlaces).toHaveBeenCalledWith(qItem);
    });

    it('should return default maxDecimalPlaces message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'decimal'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxDecimalPlaces' }]
              }
            }
          ]
        }
      };

      mockStructuredDataCapture.getMaxDecimalPlaces.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input has too many decimal places.');
    });
  });

  describe('minValue validation', () => {
    it('should return custom minValue feedback when available', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'integer'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minValue' }]
              }
            }
          ]
        }
      };

      mockGetMinValueFeedback.mockReturnValue('Custom minimum value message');

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Custom minimum value message');
      expect(mockGetMinValueFeedback).toHaveBeenCalledWith(qItem);
    });

    it('should return default minValue feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'integer'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minValue' }]
              }
            }
          ]
        }
      };

      mockGetMinValueFeedback.mockReturnValue(null);
      mockGetMinValue.mockReturnValue(10);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter a value greater than or equal to 10.');
      expect(mockGetMinValue).toHaveBeenCalledWith(qItem);
    });

    it('should return generic minValue message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'integer'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minValue' }]
              }
            }
          ]
        }
      };

      mockGetMinValueFeedback.mockReturnValue(null);
      mockGetMinValue.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is less than the minimum value allowed.');
    });
  });

  describe('maxValue validation', () => {
    it('should return custom maxValue feedback when available', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'integer'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxValue' }]
              }
            }
          ]
        }
      };

      mockGetMaxValueFeedback.mockReturnValue('Custom maximum value message');

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Custom maximum value message');
      expect(mockGetMaxValueFeedback).toHaveBeenCalledWith(qItem);
    });

    it('should return default maxValue feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'integer'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxValue' }]
              }
            }
          ]
        }
      };

      mockGetMaxValueFeedback.mockReturnValue(null);
      mockGetMaxValue.mockReturnValue(100);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter a value less than or equal to 100.');
      expect(mockGetMaxValue).toHaveBeenCalledWith(qItem);
    });

    it('should return generic maxValue message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'integer'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxValue' }]
              }
            }
          ]
        }
      };

      mockGetMaxValueFeedback.mockReturnValue(null);
      mockGetMaxValue.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input exceeds the maximum value allowed.');
    });
  });

  describe('minQuantityValue validation', () => {
    it('should return custom minQuantityValue feedback when available', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'quantity'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minQuantityValue' }]
              }
            }
          ]
        }
      };

      mockGetMinQuantityValueFeedback.mockReturnValue('Custom minimum quantity message');

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Custom minimum quantity message');
      expect(mockGetMinQuantityValueFeedback).toHaveBeenCalledWith(qItem);
    });

    it('should return default minQuantityValue feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'quantity'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minQuantityValue' }]
              }
            }
          ]
        }
      };

      mockGetMinQuantityValueFeedback.mockReturnValue(null);
      mockGetMinQuantityValue.mockReturnValue(5);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter a quantity greater than or equal to 5.');
      expect(mockGetMinQuantityValue).toHaveBeenCalledWith(qItem);
    });

    it('should return generic minQuantityValue message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'quantity'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'minQuantityValue' }]
              }
            }
          ]
        }
      };

      mockGetMinQuantityValueFeedback.mockReturnValue(null);
      mockGetMinQuantityValue.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is less than the minimum quantity allowed.');
    });
  });

  describe('maxQuantityValue validation', () => {
    it('should return custom maxQuantityValue feedback when available', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'quantity'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxQuantityValue' }]
              }
            }
          ]
        }
      };

      mockGetMaxQuantityValueFeedback.mockReturnValue('Custom maximum quantity message');

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Custom maximum quantity message');
      expect(mockGetMaxQuantityValueFeedback).toHaveBeenCalledWith(qItem);
    });

    it('should return default maxQuantityValue feedback with specific value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'quantity'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxQuantityValue' }]
              }
            }
          ]
        }
      };

      mockGetMaxQuantityValueFeedback.mockReturnValue(null);
      mockGetMaxQuantityValue.mockReturnValue(20);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Enter a quantity less than or equal to 20.');
      expect(mockGetMaxQuantityValue).toHaveBeenCalledWith(qItem);
    });

    it('should return generic maxQuantityValue message when no value found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'quantity'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'maxQuantityValue' }]
              }
            }
          ]
        }
      };

      mockGetMaxQuantityValueFeedback.mockReturnValue(null);
      mockGetMaxQuantityValue.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input exceeds the maximum quantity allowed.');
    });
  });

  describe('edge cases and error handling', () => {
    it('should return error message when no validation code is provided', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{}]
              }
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.');
    });

    it('should return error message when issue has no details', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid'
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.');
    });

    it('should return error message when issue has no coding', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {}
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.');
    });

    it('should return empty string when unknown validation code is encountered', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'unknownValidationCode' }]
              }
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('');
    });

    it('should process multiple issues and return first recognized validation', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      mockInvalidItems = {
        'test-item': {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'unknownCode' }]
              }
            },
            {
              severity: 'error',
              code: 'invalid',
              details: {
                coding: [{ code: 'regex' }]
              }
            }
          ]
        }
      };

      mockGetRegexValidation.mockReturnValue({
        expression: /^test$/,
        feedback: null
      });

      const { result } = renderHook(() => useValidationFeedback(qItem, undefined));

      expect(result.current).toBe('Input should match the specified regex: /^test$/');
    });
  });
});
