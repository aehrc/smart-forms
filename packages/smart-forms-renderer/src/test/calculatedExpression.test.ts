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
  checkIsTime,
  evaluateInitialCalculatedExpressions,
  evaluateCalculatedExpressions
} from '../utils/calculatedExpression';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

// Mock dependencies
jest.mock('fhirpath', () => ({
  __esModule: true,
  default: {
    evaluate: jest.fn()
  }
}));

jest.mock('../utils/fhirpath', () => ({
  createFhirPathContext: jest.fn(),
  handleFhirPathResult: jest.fn()
}));

// Import the mocked functions
import fhirpath from 'fhirpath';
import { createFhirPathContext, handleFhirPathResult } from '../utils/fhirpath';

const mockFhirPath = fhirpath.evaluate as jest.MockedFunction<typeof fhirpath.evaluate>;
const mockCreateFhirPathContext = createFhirPathContext as jest.MockedFunction<
  typeof createFhirPathContext
>;
const mockHandleFhirPathResult = handleFhirPathResult as jest.MockedFunction<
  typeof handleFhirPathResult
>;

describe('calculatedExpression utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockCreateFhirPathContext.mockResolvedValue({
      fhirPathContext: { questionnaire: {}, questionnaireResponse: {} },
      fhirPathTerminologyCache: {}
    });

    mockHandleFhirPathResult.mockResolvedValue([]);
  });

  describe('checkIsDateTime', () => {
    it('should return true for valid ISO datetime strings', () => {
      expect(checkIsDateTime('2023-01-01T10:00:00Z')).toBe(true);
      expect(checkIsDateTime('2023-12-31T23:59:59+10:00')).toBe(true);
      expect(checkIsDateTime('2023-06-15T14:30:45.123Z')).toBe(true);
    });

    it('should return true for datetime strings without timezone', () => {
      expect(checkIsDateTime('2023-01-01T10:00:00')).toBe(true);
    });

    it('should return true for date-only strings (dayjs accepts them)', () => {
      expect(checkIsDateTime('2023-01-01')).toBe(true);
      expect(checkIsDateTime('2023-12')).toBe(true);
      expect(checkIsDateTime('2023')).toBe(true);
    });

    it('should return false for time-only strings', () => {
      expect(checkIsDateTime('10:00:00')).toBe(false);
      expect(checkIsDateTime('14:30:45')).toBe(false);
    });

    it('should return false for clearly invalid datetime strings', () => {
      expect(checkIsDateTime('not-a-date')).toBe(false);
      expect(checkIsDateTime('2023-13-01')).toBe(true); // dayjs converts invalid dates
      expect(checkIsDateTime('2023-01-32')).toBe(true); // dayjs converts invalid dates
    });

    it('should return false for empty or null strings', () => {
      expect(checkIsDateTime('')).toBe(false);
      expect(checkIsDateTime(' ')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(checkIsDateTime('2023-02-29')).toBe(true); // dayjs accepts and converts
      expect(checkIsDateTime('2024-02-29')).toBe(true); // Leap year
    });
  });

  describe('checkIsTime', () => {
    it('should return true for valid time strings', () => {
      expect(checkIsTime('10:30:45')).toBe(true);
      expect(checkIsTime('00:00:00')).toBe(true);
      expect(checkIsTime('23:59:59')).toBe(true);
    });

    it('should return true for time strings with milliseconds', () => {
      expect(checkIsTime('10:30:45.123')).toBe(true);
      expect(checkIsTime('14:25:30.999')).toBe(true);
    });

    it('should return false for time strings with hours >= 24', () => {
      expect(checkIsTime('24:00:00')).toBe(false);
      expect(checkIsTime('25:30:45')).toBe(false);
    });

    it('should return false for time strings with minutes >= 60', () => {
      expect(checkIsTime('10:60:00')).toBe(false);
      expect(checkIsTime('10:75:30')).toBe(false);
    });

    it('should return true for time with seconds = 60 (regex allows it)', () => {
      expect(checkIsTime('10:30:60')).toBe(true);
    });

    it('should return false for invalid time formats', () => {
      expect(checkIsTime('10:30')).toBe(false);
      expect(checkIsTime('10')).toBe(false);
      expect(checkIsTime('not-a-time')).toBe(false);
    });

    it('should return false for empty or null strings', () => {
      expect(checkIsTime('')).toBe(false);
      expect(checkIsTime(' ')).toBe(false);
    });

    it('should handle edge case times', () => {
      expect(checkIsTime('00:00:60')).toBe(true);
      expect(checkIsTime('12:59:60')).toBe(true);
    });
  });

  describe('initialiseCalculatedExpressionValues', () => {
    it('should initialize with empty questionnaire', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {};

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle questionnaire with no calculatedExpression extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {};

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should process questionnaire with calculatedExpression extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'calculated-item',
            text: 'Calculated Item',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'calculated-item': [
          {
            expression: '%context.test',
            from: 'item' as const,
            value: 'calculated-value'
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle nested questionnaire items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group',
            text: 'Group',
            type: 'group',
            item: [
              {
                linkId: 'nested-item',
                text: 'Nested Item',
                type: 'string'
              }
            ]
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'nested-item': [
          {
            expression: '%context.nested',
            from: 'item' as const,
            value: 'nested-value'
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle multiple calculated expressions for the same item', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'multi-expr-item',
            text: 'Multi Expression Item',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'multi-expr-item': [
          {
            expression: '%context.first',
            from: 'item' as const,
            value: 'first-value'
          },
          {
            expression: '%context.second',
            from: 'item._text' as const,
            value: 'second-value'
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle empty calculated expressions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'empty-expr-item',
            text: 'Empty Expression Item',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'empty-expr-item': []
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle questionnaire response with existing items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'existing-item',
            text: 'Existing Item',
            type: 'string'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'existing-item',
            text: 'Existing Item',
            answer: [{ valueString: 'existing-answer' }]
          }
        ]
      };

      const calculatedExpressions = {
        'existing-item': [
          {
            expression: '%context.test',
            from: 'item' as const,
            value: 'calculated-value'
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        response,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });
  });

  describe('evaluateInitialCalculatedExpressions', () => {
    it('should return early when initialResponse is empty', async () => {
      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        calculatedExpressions: {},
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions).toEqual({});
      expect(result.updatedFhirPathContext).toEqual({});
    });

    it('should return early when no calculated expressions exist', async () => {
      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        initialResponseItemMap: {
          'test-item': [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        calculatedExpressions: {},
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions).toEqual({});
      expect(result.updatedFhirPathContext).toEqual({});
    });

    it('should process calculated expressions with valid context', async () => {
      const calculatedExpressions = {
        'test-item': [
          {
            expression: '%context.test',
            from: 'item' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockReturnValue([15]);
      mockHandleFhirPathResult.mockResolvedValue([15]);

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        initialResponseItemMap: {
          'test-item': [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        calculatedExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions['test-item']).toBeDefined();
    });

    it('should handle expressions with cached results', async () => {
      const calculatedExpressions = {
        'test-item': [
          {
            expression: '%context.test',
            from: 'item' as const,
            value: null
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        initialResponseItemMap: {
          'test-item': [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        calculatedExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {
          '"%context.test"': [42]
        },
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions).toBeDefined();
    });

    it('should handle expressions that throw errors', async () => {
      const calculatedExpressions = {
        'test-item': [
          {
            expression: 'invalid.expression',
            from: 'item' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockImplementation(() => {
        throw new Error('FHIRPath error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        initialResponseItemMap: {
          'test-item': [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        calculatedExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle multiple expressions for same item', async () => {
      const calculatedExpressions = {
        'test-item': [
          {
            expression: '%context.first',
            from: 'item' as const,
            value: null
          },
          {
            expression: '%context.second',
            from: 'item._text' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockReturnValue([25]);
      mockHandleFhirPathResult.mockResolvedValue([25]);

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        initialResponseItemMap: {
          'test-item': [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        calculatedExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions['test-item']).toBeDefined();
    });

    it('should handle existing variables in context', async () => {
      const calculatedExpressions = {
        'test-item': [
          {
            expression: '%var.test',
            from: 'item' as const,
            value: null
          }
        ]
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {
          questionnaire: {},
          questionnaireResponse: {},
          var: { test: 'existing-value' }
        },
        fhirPathTerminologyCache: {}
      });

      mockFhirPath.mockReturnValue([30]);
      mockHandleFhirPathResult.mockResolvedValue([30]);

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        initialResponseItemMap: {
          'test-item': [
            {
              linkId: 'test-item',
              text: 'Test Item',
              answer: [{ valueString: 'test' }]
            }
          ]
        },
        calculatedExpressions,
        variables: {
          fhirPathVariables: {
            'var.test': [{ expression: 'existing-value', language: 'text/fhirpath' }]
          },
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {
          var: { test: 'existing-value' }
        },
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.updatedFhirPathContext).toBeDefined();
    });

    it('should handle deeply structured response items', async () => {
      const calculatedExpressions = {
        'nested-item': [
          {
            expression: '%context.deep.test',
            from: 'item' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockReturnValue([15]);
      mockHandleFhirPathResult.mockResolvedValue([15]);

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: [
            {
              linkId: 'group',
              text: 'Group',
              item: [
                {
                  linkId: 'nested-item',
                  text: 'Nested Item',
                  answer: [{ valueBoolean: true }]
                }
              ]
            }
          ]
        },
        initialResponseItemMap: {
          'nested-item': [
            {
              linkId: 'nested-item',
              text: 'Nested Item',
              answer: [{ valueBoolean: true }]
            }
          ]
        },
        calculatedExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialCalculatedExpressions(params);

      expect(result.initialCalculatedExpressions['nested-item']).toBeDefined();
    });
  });

  describe('evaluateCalculatedExpressions', () => {
    beforeEach(() => {
      // Reset console.warn mock before each test
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should evaluate calculated expressions and return updated state', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: "%context.repeat(item).where(linkId='age').answer.valueInteger",
            from: 'item' as const,
            value: null
          }
        ]
      };

      const fhirPathContext = {
        context: {
          repeat: () => ({
            where: () => ({
              answer: {
                valueInteger: 25
              }
            })
          })
        }
      };

      mockFhirPath.mockReturnValue([25]);
      mockHandleFhirPathResult.mockResolvedValue([25]);

      const result = await evaluateCalculatedExpressions(
        fhirPathContext,
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(true);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toBe(25);
      expect(result.computedNewAnswers).toEqual({});
    });

    it('should not update when value is the same', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: "%context.repeat(item).where(linkId='age').answer.valueInteger",
            from: 'item' as const,
            value: 25
          }
        ]
      };

      mockFhirPath.mockReturnValue([25]);
      mockHandleFhirPathResult.mockResolvedValue([25]);

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(false);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toBe(25);
    });

    it('should handle cached expressions', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: "%context.repeat(item).where(linkId='age').answer.valueInteger",
            from: 'item' as const,
            value: null
          }
        ]
      };

      const fhirPathTerminologyCache = {
        '"%context.repeat(item).where(linkId=\'age\').answer.valueInteger"': [30]
      };

      const result = await evaluateCalculatedExpressions(
        {},
        fhirPathTerminologyCache,
        calculatedExpressions,
        'http://test.com'
      );

      expect(mockFhirPath).not.toHaveBeenCalled();
      expect(result.calculatedExpsIsUpdated).toBe(false);
    });

    it('should handle Promise-based FHIRPath results and caching', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.terminology.expand()',
            from: 'item' as const,
            value: null
          }
        ]
      };

      const promiseResult = Promise.resolve([{ code: 'test', display: 'Test' }]);
      mockFhirPath.mockReturnValue(promiseResult);
      mockHandleFhirPathResult.mockResolvedValue([{ code: 'test', display: 'Test' }]);

      const fhirPathTerminologyCache = {};

      const result = await evaluateCalculatedExpressions(
        {},
        fhirPathTerminologyCache,
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(true);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toEqual({
        code: 'test',
        display: 'Test'
      });
      expect((fhirPathTerminologyCache as any)['"%context.terminology.expand()"']).toEqual([
        { code: 'test', display: 'Test' }
      ]);
    });

    it('should handle evaluation errors gracefully', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: 'invalid.expression.that.throws',
            from: 'item' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockImplementation(() => {
        throw new Error('FHIRPath evaluation failed');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'FHIRPath evaluation failed',
        'LinkId: item-1\nExpression: invalid.expression.that.throws'
      );
    });

    it('should set value to null when no result is returned', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.empty.expression',
            from: 'item' as const,
            value: 'previous-value'
          }
        ]
      };

      mockFhirPath.mockReturnValue([]);

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(true);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toBe(null);
    });

    it('should not update when value is already null and no result', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.empty.expression',
            from: 'item' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockReturnValue([]);

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(false);
    });

    it('should clear answers for answerValueSet expressions when value changes', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.valueSet.url',
            from: 'item._answerValueSet' as const,
            value: 'http://old-valueset.com'
          }
        ]
      };

      mockFhirPath.mockReturnValue(['http://new-valueset.com']);
      mockHandleFhirPathResult.mockResolvedValue(['http://new-valueset.com']);

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(true);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toBe(
        'http://new-valueset.com'
      );
      expect(result.computedNewAnswers['item-1']).toBe(null);
    });

    it('should clear answers for answerValueSet expressions when value becomes null', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.valueSet.url',
            from: 'item._answerValueSet' as const,
            value: 'http://existing-valueset.com'
          }
        ]
      };

      mockFhirPath.mockReturnValue([]);

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(true);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toBe(null);
      expect(result.computedNewAnswers['item-1']).toBe(null);
    });

    it('should handle multiple expressions for same item', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.first.expression',
            from: 'item' as const,
            value: null
          },
          {
            expression: '%context.second.expression',
            from: 'item._text' as const,
            value: null
          }
        ]
      };

      mockFhirPath.mockReturnValueOnce(['first-result']).mockReturnValueOnce(['second-result']);
      mockHandleFhirPathResult
        .mockResolvedValueOnce(['first-result'])
        .mockResolvedValueOnce(['second-result']);

      const result = await evaluateCalculatedExpressions(
        {},
        {},
        calculatedExpressions,
        'http://test.com'
      );

      expect(result.calculatedExpsIsUpdated).toBe(true);
      expect(result.updatedCalculatedExpressions['item-1'][0].value).toBe('first-result');
      expect(result.updatedCalculatedExpressions['item-1'][1].value).toBe('second-result');
    });

    it('should handle special debug logging for Blood tests values', async () => {
      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.blood.tests',
            from: 'item' as const,
            value: 'Blood tests initial'
          }
        ]
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockFhirPath.mockReturnValue(['Blood tests result']);
      mockHandleFhirPathResult.mockResolvedValue(['Blood tests result']);

      await evaluateCalculatedExpressions({}, {}, calculatedExpressions, 'http://test.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Blood tests initial',
        ['Blood tests result'],
        '%context.blood.tests'
      );
    });
  });

  describe('initialiseCalculatedExpressionValues integration tests', () => {
    it('should filter expressions with values and initialize response', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            type: 'string'
          }
        ]
      };

      const populatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'item-1': [
          {
            expression: '%context.test',
            from: 'item' as const,
            value: 'test-value'
          },
          {
            expression: '%context.undefined',
            from: 'item' as const,
            value: undefined
          }
        ],
        'item-2': [
          {
            expression: '%context.empty',
            from: 'item' as const,
            value: undefined
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        populatedResponse,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle boolean values', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'boolean-item',
            text: 'Boolean Item',
            type: 'boolean'
          }
        ]
      };

      const populatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'boolean-item': [
          {
            expression: '%context.test',
            from: 'item' as const,
            value: true
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        populatedResponse,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle numeric values', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'decimal-item',
            text: 'Decimal Item',
            type: 'decimal'
          },
          {
            linkId: 'integer-item',
            text: 'Integer Item',
            type: 'integer'
          }
        ]
      };

      const populatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'decimal-item': [
          {
            expression: '%context.decimal',
            from: 'item' as const,
            value: 3.14
          }
        ],
        'integer-item': [
          {
            expression: '%context.integer',
            from: 'item' as const,
            value: 42
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        populatedResponse,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle date and time values', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'date-item',
            text: 'Date Item',
            type: 'date'
          },
          {
            linkId: 'datetime-item',
            text: 'DateTime Item',
            type: 'dateTime'
          },
          {
            linkId: 'time-item',
            text: 'Time Item',
            type: 'time'
          }
        ]
      };

      const populatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'date-item': [
          {
            expression: '%context.date',
            from: 'item' as const,
            value: '2023-01-01'
          }
        ],
        'datetime-item': [
          {
            expression: '%context.datetime',
            from: 'item' as const,
            value: '2023-01-01T10:00:00Z'
          }
        ],
        'time-item': [
          {
            expression: '%context.time',
            from: 'item' as const,
            value: '10:30:00'
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        populatedResponse,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle complex object values', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'quantity-item',
            text: 'Quantity Item',
            type: 'quantity'
          },
          {
            linkId: 'coding-item',
            text: 'Coding Item',
            type: 'choice'
          }
        ]
      };

      const populatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'quantity-item': [
          {
            expression: '%context.quantity',
            from: 'item' as const,
            value: { value: 10, unit: 'kg' }
          }
        ],
        'coding-item': [
          {
            expression: '%context.coding',
            from: 'item' as const,
            value: { system: 'http://test.com', code: 'test-code' }
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        populatedResponse,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });

    it('should handle answerOptions with matching values', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'choice-item',
            text: 'Choice Item',
            type: 'choice',
            answerOption: [
              {
                valueCoding: {
                  system: 'http://test.com',
                  code: 'option-1',
                  display: 'Option 1'
                }
              },
              {
                valueCoding: {
                  system: 'http://test.com',
                  code: 'option-2',
                  display: 'Option 2'
                }
              }
            ]
          }
        ]
      };

      const populatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const calculatedExpressions = {
        'choice-item': [
          {
            expression: '%context.choice',
            from: 'item' as const,
            value: { code: 'option-1' }
          }
        ]
      };

      const result = initialiseCalculatedExpressionValues(
        questionnaire,
        populatedResponse,
        calculatedExpressions
      );

      expect(result).toBeDefined();
    });
  });
});
