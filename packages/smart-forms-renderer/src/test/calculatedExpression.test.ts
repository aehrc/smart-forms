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

import { describe, expect, test, jest } from '@jest/globals';
import { 
  initialiseCalculatedExpressionValues,
  checkIsDateTime, 
  checkIsTime 
} from '../utils/calculatedExpression';
import type { 
  Questionnaire, 
  QuestionnaireItem, 
  QuestionnaireResponse, 
  QuestionnaireResponseItem 
} from 'fhir/r4';

// Mock the dependencies
jest.mock('../utils/emptyResource', () => ({
  emptyResponse: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  }
}));

jest.mock('../utils/fhirpath', () => ({
  createFhirPathContext: jest.fn(() => ({})),
  handleFhirPathResult: jest.fn((result) => Promise.resolve(result))
}));

jest.mock('../utils/mapItem', () => ({
  getQrItemsIndex: jest.fn(() => []),
  mapQItemsIndex: jest.fn(() => ({}))
}));

jest.mock('../utils/qrItem', () => ({
  createEmptyQrGroup: jest.fn(),
  updateQrItemsInGroup: jest.fn()
}));

jest.mock('../utils/genericRecursive', () => ({
  updateQuestionnaireResponse: jest.fn((q, qr) => qr)
}));

describe('calculatedExpression utils', () => {
  describe('checkIsDateTime', () => {
    test('should return true for valid ISO datetime strings', () => {
      expect(checkIsDateTime('2025-01-15T10:30:00Z')).toBe(true);
      expect(checkIsDateTime('2025-01-15T10:30:00.000Z')).toBe(true);
      expect(checkIsDateTime('2025-01-15T10:30:00+05:00')).toBe(true);
      expect(checkIsDateTime('2025-01-15T10:30:00.123+05:00')).toBe(true);
    });

    test('should return true for datetime strings without timezone', () => {
      expect(checkIsDateTime('2025-01-15T10:30:00')).toBe(true);
      expect(checkIsDateTime('2025-01-15T10:30:00.123')).toBe(true);
    });

    test('should return true for date-only strings (dayjs accepts them)', () => {
      expect(checkIsDateTime('2025-01-15')).toBe(true);
    });

    test('should return false for time-only strings', () => {
      expect(checkIsDateTime('10:30:00')).toBe(false);
      expect(checkIsDateTime('10:30:00.123')).toBe(false);
    });

    test('should return false for clearly invalid datetime strings', () => {
      expect(checkIsDateTime('invalid-date')).toBe(false);
      // Note: dayjs is lenient with some invalid dates, so we test clearly invalid cases
      expect(checkIsDateTime('not-a-date-at-all')).toBe(false);
      expect(checkIsDateTime('abc-def-ghi')).toBe(false);
    });

    test('should return false for empty or null strings', () => {
      expect(checkIsDateTime('')).toBe(false);
      expect(checkIsDateTime(' ')).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(checkIsDateTime('2025-01-15T00:00:00')).toBe(true); // Midnight
      expect(checkIsDateTime('2025-01-15T23:59:59')).toBe(true); // End of day
      expect(checkIsDateTime('2000-02-29T12:00:00')).toBe(true); // Leap year
    });
  });

  describe('checkIsTime', () => {
    test('should return true for valid time strings', () => {
      expect(checkIsTime('10:30:00')).toBe(true);
      expect(checkIsTime('00:00:00')).toBe(true);
      expect(checkIsTime('23:59:59')).toBe(true);
      expect(checkIsTime('12:30:45')).toBe(true);
    });

    test('should return true for time strings with milliseconds', () => {
      expect(checkIsTime('10:30:00.123')).toBe(true);
      expect(checkIsTime('10:30:00.000')).toBe(true);
      expect(checkIsTime('23:59:59.999')).toBe(true);
    });

    test('should return false for time strings with hours >= 24', () => {
      expect(checkIsTime('24:00:00')).toBe(false);
      expect(checkIsTime('25:30:00')).toBe(false);
    });

    test('should return false for time strings with minutes >= 60', () => {
      expect(checkIsTime('10:60:00')).toBe(false);
      expect(checkIsTime('10:65:00')).toBe(false);
    });

    test('should return true for time with seconds = 60 (regex allows it)', () => {
      expect(checkIsTime('10:30:60')).toBe(true); // Regex allows 60 seconds
      expect(checkIsTime('10:30:65')).toBe(false); // But not > 60
    });

    test('should return false for invalid time formats', () => {
      expect(checkIsTime('10:30')).toBe(false); // Missing seconds
      expect(checkIsTime('10')).toBe(false); // Only hours
      expect(checkIsTime('invalid-time')).toBe(false);
      expect(checkIsTime('2025-01-15T10:30:00')).toBe(false); // Full datetime
      expect(checkIsTime('2025-01-15')).toBe(false); // Date only
    });

    test('should return false for empty or null strings', () => {
      expect(checkIsTime('')).toBe(false);
      expect(checkIsTime(' ')).toBe(false);
    });

    test('should handle edge case times', () => {
      expect(checkIsTime('00:00:00')).toBe(true); // Midnight
      expect(checkIsTime('12:00:00')).toBe(true); // Noon
      expect(checkIsTime('23:59:59')).toBe(true); // End of day
    });
  });

  describe('initialiseCalculatedExpressionValues', () => {
    test('should initialize with empty questionnaire', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        {}
      );

      expect(result).toEqual(questionnaireResponse);
    });

    test('should handle questionnaire with no calculatedExpression extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Regular Item'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        {}
      );

      expect(result).toEqual(questionnaireResponse);
    });

    test('should process questionnaire with calculatedExpression extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'calculated-item',
            type: 'decimal',
            text: 'Calculated Item',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: '10 + 5'
                }
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const calculatedExpressions = {
        'calculated-item': [
          {
            linkId: 'calculated-item',
            expression: '10 + 5',
            from: 'item' as const
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        calculatedExpressions
      );

      // Should return the input response (as it's processed by mocked dependencies)
      expect(result).toEqual(questionnaireResponse);
    });

    test('should handle nested questionnaire items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group-1',
            type: 'group',
            text: 'Group',
            item: [
              {
                linkId: 'nested-calculated',
                type: 'integer',
                text: 'Nested Calculated Item',
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                    valueExpression: {
                      language: 'text/fhirpath',
                      expression: '20 * 2'
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'group-1',
            text: 'Group',
            item: []
          }
        ]
      };

      const calculatedExpressions = {
        'nested-calculated': [
          {
            linkId: 'nested-calculated',
            expression: '20 * 2',
            from: 'item' as const
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        calculatedExpressions
      );

      expect(result).toEqual(questionnaireResponse);
    });

    test('should handle multiple calculated expressions for the same item', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'multi-calc',
            type: 'string',
            text: 'Multi Calculated Item'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const calculatedExpressions = {
        'multi-calc': [
          {
            linkId: 'multi-calc',
            expression: 'expression1',
            from: 'item' as const
          },
          {
            linkId: 'multi-calc',
            expression: 'expression2',
            from: 'item._text' as const
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        calculatedExpressions
      );

      expect(result).toEqual(questionnaireResponse);
    });

    test('should handle empty calculated expressions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        {} // Empty calculated expressions
      );

      expect(result).toEqual(questionnaireResponse);
    });

    test('should handle questionnaire response with existing items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'existing-item',
            type: 'string',
            text: 'Existing Item'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'existing-item',
            text: 'Existing Item',
            answer: [{ valueString: 'pre-existing value' }]
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        questionnaireResponse,
        {}
      );

      expect(result).toEqual(questionnaireResponse);
    });
  });
});
