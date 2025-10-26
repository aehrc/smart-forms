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

import { describe, expect } from '@jest/globals';
import {
  evaluateEnableWhenExpressions,
  evaluateEnableWhenRepeatExpressionInstance,
  evaluateInitialEnableWhenExpressions
} from '../utils/enableWhenExpression';
// import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  EnableWhenExpressions,
  EnableWhenRepeatExpression
} from '../interfaces/enableWhen.interface';
// import type { Variables } from '../interfaces';

// Mock dependencies
jest.mock('../utils/fhirpath', () => ({
  ...jest.requireActual('../utils/fhirpath'),
  createFhirPathContext: jest.fn(() =>
    Promise.resolve({
      fhirPathContext: { mockContext: true },
      fhirPathTerminologyCache: {}
    })
  ),
  handleFhirPathResult: jest.fn((result: any) => Promise.resolve(result))
}));

jest.mock('fhirpath', () => ({
  evaluate: jest.fn(() => [true])
}));

describe('enableWhenExpression utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.warn mock before each test
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('evaluateInitialEnableWhenExpressions', () => {
    const createMockParams = (overrides = {}) => ({
      initialResponse: {
        resourceType: 'QuestionnaireResponse' as const,
        status: 'in-progress' as const
      },
      initialResponseItemMap: {},
      enableWhenExpressions: {
        singleExpressions: {},
        repeatExpressions: {}
      },
      variables: {
        fhirPathVariables: {},
        xFhirQueryVariables: {}
      },
      existingFhirPathContext: {},
      fhirPathTerminologyCache: {},
      terminologyServerUrl: 'http://terminology.example.com',
      ...overrides
    });

    it('should evaluate initial enableWhen expressions with empty expressions', async () => {
      const params = createMockParams();

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(result.initialEnableWhenExpressions).toEqual({
        singleExpressions: {},
        repeatExpressions: {}
      });
      expect(result.updatedFhirPathContext).toEqual({ mockContext: true });
      expect(result.fhirPathTerminologyCache).toEqual({});
    });

    it('should evaluate single enableWhen expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([true]);

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'item-1': {
              expression: '%resource.item.where(linkId="condition").answer.value',
              isEnabled: false
            }
          },
          repeatExpressions: {}
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(result.initialEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(true);
    });

    it('should handle single expression evaluation with no result', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([]);

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'item-1': {
              expression: '%resource.item.where(linkId="missing").answer.value',
              isEnabled: true
            }
          },
          repeatExpressions: {}
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(result.initialEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(false);
    });

    it('should handle intersect edge case for single expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([]);

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'item-1': {
              expression: '%resource.item.answer.value intersect ("yes")',
              isEnabled: true
            }
          },
          repeatExpressions: {}
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(result.initialEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(false);
    });

    it('should handle Promise-based FHIRPath results and caching', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue(Promise.resolve([true]));

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'item-1': {
              expression: 'terminology-based-expression',
              isEnabled: false
            }
          },
          repeatExpressions: {}
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(result.initialEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(true);
      expect(result.fhirPathTerminologyCache['terminology-based-expression']).toEqual([true]);
    });

    it('should handle cached expressions properly', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([false]);

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'item-1': {
              expression: 'cached-expression',
              isEnabled: true
            }
          },
          repeatExpressions: {}
        },
        fhirPathTerminologyCache: {
          'cached-expression': [true]
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      // Should process the expression and update the result
      expect(result.initialEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(false);
    });

    it('should handle FHIRPath evaluation errors', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockImplementation(() => {
        throw new Error('FHIRPath syntax error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'item-1': {
              expression: 'invalid.fhirpath.expression',
              isEnabled: false
            }
          },
          repeatExpressions: {}
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(consoleSpy).toHaveBeenCalledWith(
        'FHIRPath syntax error',
        expect.stringContaining('invalid.fhirpath.expression')
      );
      expect(result.initialEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should evaluate repeat enableWhen expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate
        .mockReturnValueOnce([2]) // For getNumOfEnableWhenExpressionItemInstances
        .mockReturnValueOnce([true]) // For first instance
        .mockReturnValueOnce([false]); // For second instance

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {
            'repeat-item': {
              expression:
                '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
              parentLinkId: 'repeat-group',
              enabledIndexes: [false, false]
            }
          }
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(
        result.initialEnableWhenExpressions.repeatExpressions['repeat-item'].enabledIndexes
      ).toEqual([true, false]);
    });

    it('should handle repeat expressions with no instances', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([0]);

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {
            'repeat-item': {
              expression:
                '%resource.item.where(linkId="missing-group").item.where(linkId="condition").answer.value = "yes"',
              parentLinkId: 'missing-group',
              enabledIndexes: []
            }
          }
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(
        result.initialEnableWhenExpressions.repeatExpressions['repeat-item'].enabledIndexes
      ).toEqual([]);
    });

    it('should handle repeat expressions with invalid expression structure', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([2]);

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {},
          repeatExpressions: {
            'repeat-item': {
              expression: 'invalid-expression-without-where-linkId',
              parentLinkId: 'repeat-group',
              enabledIndexes: [false, false]
            }
          }
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      // Should not modify enabledIndexes when expression structure is invalid
      expect(
        result.initialEnableWhenExpressions.repeatExpressions['repeat-item'].enabledIndexes
      ).toEqual([false, false]);
    });

    it('should handle mixed single and repeat expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate
        .mockReturnValueOnce([false]) // Single expression
        .mockReturnValueOnce([1]) // Repeat expression count
        .mockReturnValueOnce([true]); // Repeat expression evaluation

      const params = createMockParams({
        enableWhenExpressions: {
          singleExpressions: {
            'single-item': {
              expression: '%resource.item.where(linkId="trigger").answer.value = "no"',
              isEnabled: true
            }
          },
          repeatExpressions: {
            'repeat-item': {
              expression:
                '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
              parentLinkId: 'repeat-group',
              enabledIndexes: [false]
            }
          }
        }
      });

      const result = await evaluateInitialEnableWhenExpressions(params);

      expect(result.initialEnableWhenExpressions.singleExpressions['single-item'].isEnabled).toBe(
        false
      );
      expect(
        result.initialEnableWhenExpressions.repeatExpressions['repeat-item'].enabledIndexes
      ).toEqual([true]);
    });
  });

  describe('evaluateEnableWhenRepeatExpressionInstance', () => {
    it('should evaluate repeat expression instance successfully', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([true]);

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression:
          '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
        parentLinkId: 'repeat-group',
        enabledIndexes: [false]
      };

      const result = await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0,
        'http://terminology.example.com'
      );

      expect(result.isEnabled).toBe(true);
      expect(result.isUpdated).toBe(true);
    });

    it('should handle expression with no result', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([]);

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression:
          '%resource.item.where(linkId="repeat-group").item.where(linkId="missing").answer.value = "yes"',
        parentLinkId: 'repeat-group',
        enabledIndexes: [true]
      };

      const result = await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0,
        'http://terminology.example.com'
      );

      expect(result.isEnabled).toBe(false);
      expect(result.isUpdated).toBe(true);
    });

    it('should handle intersect edge case', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([]);

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression:
          '%resource.item.where(linkId="repeat-group").item.answer.value intersect ("yes")',
        parentLinkId: 'repeat-group',
        enabledIndexes: [true]
      };

      const result = await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0,
        'http://terminology.example.com'
      );

      expect(result.isEnabled).toBe(false);
      expect(result.isUpdated).toBe(true);
    });

    it('should not update when result matches initial value', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([true]);

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression:
          '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
        parentLinkId: 'repeat-group',
        enabledIndexes: [true] // Same as result
      };

      const result = await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0,
        'http://terminology.example.com'
      );

      expect(result.isEnabled).toBeNull();
      expect(result.isUpdated).toBe(false);
    });

    it('should handle FHIRPath evaluation errors', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockImplementation(() => {
        throw new Error('Invalid FHIRPath expression');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression: 'invalid.fhirpath.expression',
        parentLinkId: 'repeat-group',
        enabledIndexes: [false]
      };

      const result = await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        -1,
        0,
        'http://terminology.example.com'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid FHIRPath expression',
        expect.stringContaining('invalid.fhirpath.expression')
      );
      expect(result.isEnabled).toBeNull();
      expect(result.isUpdated).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle non-boolean FHIRPath results', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue(['string-result']);

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression:
          '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value',
        parentLinkId: 'repeat-group',
        enabledIndexes: [false]
      };

      const result = await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0,
        'http://terminology.example.com'
      );

      expect(result.isEnabled).toBeNull();
      expect(result.isUpdated).toBe(false);
    });

    it('should correctly modify expression for specific instance index', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      const evaluateSpy = jest.spyOn(mockFhirpath, 'evaluate').mockReturnValue([true]);

      const enableWhenRepeatExpression: EnableWhenRepeatExpression = {
        expression:
          '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
        parentLinkId: 'repeat-group',
        enabledIndexes: [false, false, false]
      };

      await evaluateEnableWhenRepeatExpressionInstance(
        'repeat-item',
        { mockContext: true },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        2, // Third instance
        'http://terminology.example.com'
      );

      // Verify the expression was modified to target the correct instance
      expect(evaluateSpy).toHaveBeenCalledWith(
        {},
        expect.stringContaining('item[2]'),
        { mockContext: true },
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('evaluateEnableWhenExpressions', () => {
    it('should evaluate enableWhen expressions during runtime', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate
        .mockReturnValueOnce([false]) // Single expression
        .mockReturnValueOnce([1]) // Repeat expression count
        .mockReturnValueOnce([true]); // Repeat expression evaluation

      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {
          'single-item': {
            expression: '%resource.item.where(linkId="trigger").answer.value = "yes"',
            isEnabled: true
          }
        },
        repeatExpressions: {
          'repeat-item': {
            expression:
              '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
            parentLinkId: 'repeat-group',
            enabledIndexes: [false]
          }
        }
      };

      const result = await evaluateEnableWhenExpressions(
        { mockContext: true },
        {},
        enableWhenExpressions,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedEnableWhenExpressions.singleExpressions['single-item'].isEnabled).toBe(
        false
      );
      expect(
        result.updatedEnableWhenExpressions.repeatExpressions['repeat-item'].enabledIndexes
      ).toEqual([true]);
    });

    it('should return not updated when no changes occur', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate
        .mockReturnValueOnce([true]) // Single expression - same as initial
        .mockReturnValueOnce([1]) // Repeat expression count
        .mockReturnValueOnce([false]); // Repeat expression evaluation - same as initial

      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {
          'single-item': {
            expression: '%resource.item.where(linkId="trigger").answer.value = "yes"',
            isEnabled: true
          }
        },
        repeatExpressions: {
          'repeat-item': {
            expression:
              '%resource.item.where(linkId="repeat-group").item.where(linkId="condition").answer.value = "yes"',
            parentLinkId: 'repeat-group',
            enabledIndexes: [false]
          }
        }
      };

      const result = await evaluateEnableWhenExpressions(
        { mockContext: true },
        {},
        enableWhenExpressions,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(false);
    });

    it('should handle empty enableWhen expressions', async () => {
      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {},
        repeatExpressions: {}
      };

      const result = await evaluateEnableWhenExpressions(
        { mockContext: true },
        {},
        enableWhenExpressions,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(false);
      expect(result.updatedEnableWhenExpressions).toEqual(enableWhenExpressions);
    });

    it('should use cached results for single expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      const evaluateSpy = jest.spyOn(mockFhirpath, 'evaluate');

      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {
          'single-item': {
            expression: 'cached-expression',
            isEnabled: false
          }
        },
        repeatExpressions: {}
      };

      const fhirPathTerminologyCache = {
        'cached-expression': [true]
      };

      const result = await evaluateEnableWhenExpressions(
        { mockContext: true },
        fhirPathTerminologyCache,
        enableWhenExpressions,
        'http://terminology.example.com'
      );

      expect(evaluateSpy).not.toHaveBeenCalled();
      expect(result.isUpdated).toBe(false);
    });

    it('should handle multiple single expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate
        .mockReturnValueOnce([false]) // First expression
        .mockReturnValueOnce([true]) // Second expression
        .mockReturnValueOnce([false]); // Third expression - no change

      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {
          'item-1': {
            expression: 'expression-1',
            isEnabled: true
          },
          'item-2': {
            expression: 'expression-2',
            isEnabled: false
          },
          'item-3': {
            expression: 'expression-3',
            isEnabled: false
          }
        },
        repeatExpressions: {}
      };

      const result = await evaluateEnableWhenExpressions(
        { mockContext: true },
        {},
        enableWhenExpressions,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedEnableWhenExpressions.singleExpressions['item-1'].isEnabled).toBe(false);
      expect(result.updatedEnableWhenExpressions.singleExpressions['item-2'].isEnabled).toBe(true);
      expect(result.updatedEnableWhenExpressions.singleExpressions['item-3'].isEnabled).toBe(false);
    });

    it('should handle multiple repeat expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate
        .mockReturnValueOnce([2]) // First repeat count
        .mockReturnValueOnce([true]) // First repeat instance 0
        .mockReturnValueOnce([false]) // First repeat instance 1
        .mockReturnValueOnce([1]) // Second repeat count
        .mockReturnValueOnce([true]); // Second repeat instance 0

      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {},
        repeatExpressions: {
          'repeat-item-1': {
            expression:
              '%resource.item.where(linkId="group-1").item.where(linkId="condition").answer.value = "yes"',
            parentLinkId: 'group-1',
            enabledIndexes: [false, true]
          },
          'repeat-item-2': {
            expression:
              '%resource.item.where(linkId="group-2").item.where(linkId="condition").answer.value = "yes"',
            parentLinkId: 'group-2',
            enabledIndexes: [false]
          }
        }
      };

      const result = await evaluateEnableWhenExpressions(
        { mockContext: true },
        {},
        enableWhenExpressions,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(true);
      expect(
        result.updatedEnableWhenExpressions.repeatExpressions['repeat-item-1'].enabledIndexes
      ).toEqual([true, false]);
      expect(
        result.updatedEnableWhenExpressions.repeatExpressions['repeat-item-2'].enabledIndexes
      ).toEqual([true]);
    });
  });
});
