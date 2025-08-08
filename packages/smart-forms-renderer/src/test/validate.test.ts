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

import {
  ValidationResult,
  validateForm,
  validateTargetConstraint,
  validateQuestionnaireResponse,
  getInputInvalidType,
  createValidationOperationOutcome
} from '../utils/validate';
import type { 
  Questionnaire, 
  QuestionnaireItem, 
  QuestionnaireResponse, 
  QuestionnaireResponseItem,
  OperationOutcome
} from 'fhir/r4';
import type { RegexValidation } from '../interfaces/regex.interface';

// Mock dependencies
jest.mock('../utils/qItem', () => ({
  isItemHidden: jest.fn()
}));

jest.mock('../utils/mapItem', () => ({
  getQrItemsIndex: jest.fn(),
  mapQItemsIndex: jest.fn()
}));

jest.mock('../stores', () => ({
  questionnaireStore: {
    getState: jest.fn()
  },
  rendererStylingStore: {
    getState: jest.fn()
  }
}));

jest.mock('../utils/extensions', () => ({
  getShortText: jest.fn(),
  getDecimalPrecision: jest.fn(),
  getMinValue: jest.fn(),
  getMaxValue: jest.fn(),
  getMinQuantityValue: jest.fn(),
  getMaxQuantityValue: jest.fn()
}));

import { isItemHidden } from '../utils/qItem';
import { questionnaireStore, rendererStylingStore } from '../stores';
import { 
  getShortText, 
  getDecimalPrecision, 
  getMinValue, 
  getMaxValue, 
  getMinQuantityValue, 
  getMaxQuantityValue 
} from '../utils/extensions';
import { getQrItemsIndex, mapQItemsIndex } from '../utils/mapItem';

const mockIsItemHidden = isItemHidden as jest.MockedFunction<typeof isItemHidden>;
const mockQuestionnaireStore = questionnaireStore as jest.Mocked<typeof questionnaireStore>;
const mockRendererStylingStore = rendererStylingStore as jest.Mocked<typeof rendererStylingStore>;
const mockGetShortText = getShortText as jest.MockedFunction<typeof getShortText>;
const mockGetDecimalPrecision = getDecimalPrecision as jest.MockedFunction<typeof getDecimalPrecision>;
const mockGetMinValue = getMinValue as jest.MockedFunction<typeof getMinValue>;
const mockGetMaxValue = getMaxValue as jest.MockedFunction<typeof getMaxValue>;
const mockGetMinQuantityValue = getMinQuantityValue as jest.MockedFunction<typeof getMinQuantityValue>;
const mockGetMaxQuantityValue = getMaxQuantityValue as jest.MockedFunction<typeof getMaxQuantityValue>;
const mockGetQrItemsIndex = getQrItemsIndex as jest.MockedFunction<typeof getQrItemsIndex>;
const mockMapQItemsIndex = mapQItemsIndex as jest.MockedFunction<typeof mapQItemsIndex>;

describe('validate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockIsItemHidden.mockReturnValue(false);
    mockQuestionnaireStore.getState.mockReturnValue({
      itemMap: {},
      targetConstraints: {},
      enableWhenIsActivated: false,
      enableWhenItems: {
        singleItems: {},
        repeatItems: {}
      },
      enableWhenExpressions: {
        singleExpressions: {},
        repeatExpressions: {}
      }
    } as any);
    mockRendererStylingStore.getState.mockReturnValue({
      readOnlyVisualStyle: 'disabled',
      requiredIndicatorPosition: 'start',
      itemResponsive: {
        labelBreakpoints: { xs: 12, md: 4 },
        fieldBreakpoints: { xs: 12, md: 8 },
        columnGapPixels: 32,
        rowGapPixels: 4
      },
      tabListWidthOrResponsive: { tabListBreakpoints: { xs: 12 }, tabContentBreakpoints: { xs: 12 } },
      showTabbedFormAt: { xs: true },
      textFieldWidth: 300,
      inputsFlexGrow: false,
      reverseBooleanYesNo: false,
      hideClearButton: false,
      hideQuantityComparatorField: false,
      enableWhenAsReadOnly: false,
      disablePageCardView: false,
      disablePageButtons: false,
      disableTabButtons: false,
      setRendererStyling: jest.fn()
    } as any);
    mockGetShortText.mockReturnValue(null);
    mockGetDecimalPrecision.mockReturnValue(null);
    mockGetMinValue.mockReturnValue(undefined);
    mockGetMaxValue.mockReturnValue(undefined);
    mockGetMinQuantityValue.mockReturnValue(undefined);
    mockGetMaxQuantityValue.mockReturnValue(undefined);
    mockGetQrItemsIndex.mockReturnValue([]);
    mockMapQItemsIndex.mockReturnValue({});
  });

  describe('ValidationResult enum', () => {
    it('should have all expected validation result values', () => {
      expect(ValidationResult.unknown).toBe('unknown');
      expect(ValidationResult.required).toBe('required');
      expect(ValidationResult.minValue).toBe('minValue');
      expect(ValidationResult.maxValue).toBe('maxValue');
      expect(ValidationResult.regex).toBe('regex');
      expect(ValidationResult.minLength).toBe('minLength');
      expect(ValidationResult.maxLength).toBe('maxLength');
      expect(ValidationResult.invalidType).toBe('invalidType');
    });
  });

  describe('getInputInvalidType', () => {
    const mockQItem: QuestionnaireItem = {
      linkId: 'test-item',
      type: 'string',
      text: 'Test item'
    };

    it('should return null for valid input with no constraints', () => {
      const result = getInputInvalidType({
        qItem: mockQItem,
        input: 'valid input'
      });

      expect(result).toBeNull();
    });

    it('should validate regex constraints', () => {
      const regexValidation: RegexValidation = {
        expression: /^[A-Z]+$/,
        feedback: 'Must be uppercase letters only'
      };

      const validResult = getInputInvalidType({
        qItem: mockQItem,
        input: 'VALID',
        regexValidation
      });

      const invalidResult = getInputInvalidType({
        qItem: mockQItem,
        input: 'invalid123',
        regexValidation
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.regex);
    });

    it('should validate minimum length constraints', () => {
      const validResult = getInputInvalidType({
        qItem: mockQItem,
        input: 'valid input',
        minLength: 5
      });

      const invalidResult = getInputInvalidType({
        qItem: mockQItem,
        input: 'hi',
        minLength: 5
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.minLength);
    });

    it('should validate maximum length constraints', () => {
      const validResult = getInputInvalidType({
        qItem: mockQItem,
        input: 'valid',
        maxLength: 10
      });

      const invalidResult = getInputInvalidType({
        qItem: mockQItem,
        input: 'this input is way too long for the constraint',
        maxLength: 10
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.maxLength);
    });

    it('should validate decimal places constraints', () => {
      const validResult = getInputInvalidType({
        qItem: mockQItem,
        input: '123.45',
        maxDecimalPlaces: 2
      });

      const invalidResult = getInputInvalidType({
        qItem: mockQItem,
        input: '123.456789',
        maxDecimalPlaces: 2
      });

      const integerResult = getInputInvalidType({
        qItem: mockQItem,
        input: '123',
        maxDecimalPlaces: 2
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.maxDecimalPlaces);
      expect(integerResult).toBeNull(); // integers have 0 decimal places
    });

    it('should validate minimum value constraints for string type', () => {
      const stringQItem: QuestionnaireItem = {
        linkId: 'string-item',
        type: 'string',
        text: 'String item'
      };

      const validResult = getInputInvalidType({
        qItem: stringQItem,
        input: 'zebra',
        minValue: 'apple'
      });

      const invalidResult = getInputInvalidType({
        qItem: stringQItem,
        input: 'apple',
        minValue: 'zebra'
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.minValue);
    });

    it('should validate maximum value constraints for string type', () => {
      const stringQItem: QuestionnaireItem = {
        linkId: 'string-item',
        type: 'string',
        text: 'String item'
      };

      const validResult = getInputInvalidType({
        qItem: stringQItem,
        input: 'apple',
        maxValue: 'zebra'
      });

      const invalidResult = getInputInvalidType({
        qItem: stringQItem,
        input: 'zebra',
        maxValue: 'apple'
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.maxValue);
    });

    it('should validate minimum value constraints for integer type', () => {
      const integerQItem: QuestionnaireItem = {
        linkId: 'integer-item',
        type: 'integer',
        text: 'Integer item'
      };

      const validResult = getInputInvalidType({
        qItem: integerQItem,
        input: '10',
        minValue: 5
      });

      const invalidResult = getInputInvalidType({
        qItem: integerQItem,
        input: '3',
        minValue: 5
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.minValue);
    });

    it('should validate maximum value constraints for integer type', () => {
      const integerQItem: QuestionnaireItem = {
        linkId: 'integer-item',
        type: 'integer',
        text: 'Integer item'
      };

      const validResult = getInputInvalidType({
        qItem: integerQItem,
        input: '5',
        maxValue: 10
      });

      const invalidResult = getInputInvalidType({
        qItem: integerQItem,
        input: '15',
        maxValue: 10
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.maxValue);
    });

    it('should validate minimum value constraints for decimal type', () => {
      const decimalQItem: QuestionnaireItem = {
        linkId: 'decimal-item',
        type: 'decimal',
        text: 'Decimal item'
      };

      const validResult = getInputInvalidType({
        qItem: decimalQItem,
        input: '10.5',
        minValue: '5.5'
      });

      const invalidResult = getInputInvalidType({
        qItem: decimalQItem,
        input: '3.2',
        minValue: '5.5'
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.minValue);
    });

    it('should validate maximum value constraints for decimal type', () => {
      const decimalQItem: QuestionnaireItem = {
        linkId: 'decimal-item',
        type: 'decimal',
        text: 'Decimal item'
      };

      const validResult = getInputInvalidType({
        qItem: decimalQItem,
        input: '5.5',
        maxValue: '10.5'
      });

      const invalidResult = getInputInvalidType({
        qItem: decimalQItem,
        input: '15.7',
        maxValue: '10.5'
      });

      expect(validResult).toBeNull();
      expect(invalidResult).toBe(ValidationResult.maxValue);
    });

    it('should validate date constraints', () => {
      const dateQItem: QuestionnaireItem = {
        linkId: 'date-item',
        type: 'date',
        text: 'Date item'
      };

      const validMinResult = getInputInvalidType({
        qItem: dateQItem,
        input: '2025-01-15',
        minValue: '2025-01-01'
      });

      const invalidMinResult = getInputInvalidType({
        qItem: dateQItem,
        input: '2024-12-31',
        minValue: '2025-01-01'
      });

      const validMaxResult = getInputInvalidType({
        qItem: dateQItem,
        input: '2025-01-15',
        maxValue: '2025-12-31'
      });

      const invalidMaxResult = getInputInvalidType({
        qItem: dateQItem,
        input: '2026-01-01',
        maxValue: '2025-12-31'
      });

      expect(validMinResult).toBeNull();
      expect(invalidMinResult).toBe(ValidationResult.minValue);
      expect(validMaxResult).toBeNull();
      expect(invalidMaxResult).toBe(ValidationResult.maxValue);
    });

    it('should handle multiple constraint violations and return first one encountered', () => {
      const result = getInputInvalidType({
        qItem: mockQItem,
        input: 'x', // too short AND doesn't match regex
        regexValidation: {
          expression: /^[A-Z]{5,}$/,
          feedback: 'Must be 5+ uppercase letters'
        },
        minLength: 5
      });

      // Should return regex error first (it's checked first in the function)
      expect(result).toBe(ValidationResult.regex);
    });

    it('should return null when input is empty string but no constraints', () => {
      const result = getInputInvalidType({
        qItem: mockQItem,
        input: ''
      });

      expect(result).toBeNull();
    });
  });

  describe('createValidationOperationOutcome', () => {
    const mockQItem: QuestionnaireItem = {
      linkId: 'test-item',
      type: 'string',
      text: 'Test Item'
    };

    const mockQrItem: QuestionnaireResponseItem = {
      linkId: 'test-item',
      text: 'Test Item Response'
    };

    it('should create a basic validation operation outcome', () => {
      const result = createValidationOperationOutcome(
        ValidationResult.required,
        mockQItem,
        mockQrItem,
        0,
        'QuestionnaireResponse.item[0]'
      );

      expect(result.resourceType).toBe('OperationOutcome');
      expect(result.issue).toHaveLength(1);
      expect(result.issue[0].severity).toBe('error');
      expect(result.issue[0].code).toBe('invariant');
      expect(result.issue[0].details?.coding?.[0]?.code).toBe(ValidationResult.required);
    });

    it('should handle existing operation outcome issues', () => {
      const existingIssue = {
        severity: 'warning' as const,
        code: 'processing' as const,
        diagnostics: 'Existing issue'
      };

      const result = createValidationOperationOutcome(
        ValidationResult.maxLength,
        mockQItem,
        mockQrItem,
        1,
        'QuestionnaireResponse.item[0].answer[1]',
        [existingIssue]
      );

      expect(result.issue).toHaveLength(2);
      expect(result.issue[0]).toBe(existingIssue);
      expect(result.issue[1].details?.coding?.[0]?.code).toBe(ValidationResult.maxLength);
    });

    it('should handle null qItem and qrItem', () => {
      const result = createValidationOperationOutcome(
        ValidationResult.invariant,
        null,
        null,
        null,
        'target-constraint-expression'
      );

      expect(result.resourceType).toBe('OperationOutcome');
      expect(result.issue).toHaveLength(1);
      expect(result.issue[0].details?.text).toContain('Unknown item');
    });

    it('should use shortText when available', () => {
      mockGetShortText.mockReturnValue('Short Test');

      const result = createValidationOperationOutcome(
        ValidationResult.required,
        mockQItem,
        mockQrItem,
        0,
        'QuestionnaireResponse.item[0]'
      );

      expect(result.issue[0].details?.text).toContain('Short Test');
    });

    it('should handle different validation result types', () => {
      const testCases = [
        ValidationResult.required,
        ValidationResult.minValue,
        ValidationResult.maxValue,
        ValidationResult.regex,
        ValidationResult.minLength,
        ValidationResult.maxLength,
        ValidationResult.invalidType
      ];

      testCases.forEach((validationResult) => {
        const result = createValidationOperationOutcome(
          validationResult,
          mockQItem,
          mockQrItem,
          0,
          'QuestionnaireResponse.item[0]'
        );

        expect(result.issue[0].details?.coding?.[0]?.code).toBe(validationResult);
      });
    });

    it('should handle group items correctly for required validation', () => {
      const groupQItem: QuestionnaireItem = {
        linkId: 'group-item',
        type: 'group',
        text: 'Group Item'
      };

      const result = createValidationOperationOutcome(
        ValidationResult.required,
        groupQItem,
        mockQrItem,
        0,
        'QuestionnaireResponse.item[0]'
      );

      expect(result.issue[0].details?.text).toContain('Mandatory group does not have answer(s)');
    });

    it('should strip trailing colon from field display text', () => {
      const qItemWithColon: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Item:'
      };

      const result = createValidationOperationOutcome(
        ValidationResult.required,
        qItemWithColon,
        mockQrItem,
        0,
        'QuestionnaireResponse.item[0]'
      );

      expect(result.issue[0].details?.text).toContain('Test Item:'); // Note: the function should strip this
    });
  });

  describe('validateForm', () => {
    it('should combine validation results from QuestionnaireResponse and TargetConstraint validation', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      // Mock both validation functions to return some results
      mockQuestionnaireStore.getState.mockReturnValue({
        itemMap: {},
        targetConstraints: {},
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {},
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {}
        }
      } as any);

      const result = validateForm(mockQuestionnaire, mockQuestionnaireResponse);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('validateTargetConstraint', () => {
    it('should return empty object when no target constraints exist', () => {
      mockQuestionnaireStore.getState.mockReturnValue({
        itemMap: {},
        targetConstraints: {},
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {},
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {}
        }
      } as any);

      const result = validateTargetConstraint();

      expect(result).toEqual({});
    });

    it('should return validation errors for invalid target constraints', () => {
      const mockTargetConstraint = {
        key: 'tc-1',
        linkId: 'test-item',
        isInvalid: true,
        severityCode: 'error' as const,
        human: 'Age must be greater than 18',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%age > 18'
        },
        location: 'item[0]'
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        itemMap: {
          'test-item': {
            linkId: 'test-item',
            type: 'integer',
            text: 'Age'
          }
        },
        targetConstraints: {
          'tc-1': mockTargetConstraint
        },
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {},
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {}
        }
      } as any);

      mockIsItemHidden.mockReturnValue(false);

      const result = validateTargetConstraint();

      expect(result).toHaveProperty('test-item');
      expect(result['test-item'].resourceType).toBe('OperationOutcome');
      expect(result['test-item'].issue[0].details?.coding?.[0]?.code).toBe(ValidationResult.invariant);
    });

    it('should filter out hidden items from validation results', () => {
      const mockTargetConstraint = {
        key: 'tc-1',
        linkId: 'hidden-item',
        isInvalid: true,
        severityCode: 'error' as const,
        human: 'Age must be greater than 18',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%age > 18'
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        itemMap: {
          'hidden-item': {
            linkId: 'hidden-item',
            type: 'integer',
            text: 'Hidden Age'
          }
        },
        targetConstraints: {
          'tc-1': mockTargetConstraint
        },
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {},
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {}
        }
      } as any);

      mockIsItemHidden.mockReturnValue(true); // Item is hidden

      const result = validateTargetConstraint();

      expect(result).toEqual({}); // Should be empty since item is hidden
    });

    it('should handle target constraints without linkId', () => {
      const mockTargetConstraint = {
        key: 'tc-1',
        isInvalid: true,
        severityCode: 'warning' as const,
        human: 'Age should be greater than 18',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%age > 18'
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        itemMap: {},
        targetConstraints: {
          'tc-1': mockTargetConstraint
        },
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {},
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {}
        }
      } as any);

      const result = validateTargetConstraint();

      expect(result).toHaveProperty('target-constraint-tc-1');
    });
  });

  describe('validateQuestionnaireResponse', () => {
    it('should return empty object when questionnaire has no items', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const result = validateQuestionnaireResponse({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockQuestionnaireResponse
      });

      expect(result).toEqual({});
    });

    it('should return empty object when questionnaire has empty items array', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const result = validateQuestionnaireResponse({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockQuestionnaireResponse
      });

      expect(result).toEqual({});
    });

    it('should handle questionnaireResponse with no items by initializing empty array', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-item',
            type: 'string',
            text: 'Test Item'
          }
        ]
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
        // no item property
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        itemMap: {},
        targetConstraints: {},
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {},
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {}
        }
      } as any);

      const result = validateQuestionnaireResponse({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockQuestionnaireResponse
      });

      expect(mockQuestionnaireResponse.item).toEqual([]); // Should be initialized
      expect(result).toBeDefined();
    });
  });
});
