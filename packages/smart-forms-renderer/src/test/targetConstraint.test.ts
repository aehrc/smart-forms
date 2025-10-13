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

import { beforeEach, describe, expect, jest } from '@jest/globals';
import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import {
  evaluateInitialTargetConstraints,
  evaluateTargetConstraints,
  readTargetConstraintLocationLinkIds
} from '../utils/targetConstraint';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import type { Variables } from '../interfaces';
import { createFhirPathContext, handleFhirPathResult } from '../utils/fhirpath';
import fhirpath from 'fhirpath';

// Mock the fhirpath dependencies
jest.mock('../utils/fhirpath', () => ({
  createFhirPathContext: jest.fn(),
  handleFhirPathResult: jest.fn()
}));

jest.mock('fhirpath', () => ({
  evaluate: jest.fn()
}));

jest.mock('fhirpath/fhir-context/r4', () => ({}));

const mockCreateFhirPathContext = createFhirPathContext as jest.MockedFunction<
  typeof createFhirPathContext
>;
const mockHandleFhirPathResult = handleFhirPathResult as jest.MockedFunction<
  typeof handleFhirPathResult
>;
const mockFhirpathEvaluate = fhirpath.evaluate as jest.MockedFunction<typeof fhirpath.evaluate>;

// Helper function to create valid TargetConstraint objects
function createMockTargetConstraint(
  key: string,
  expression: string,
  isInvalid?: boolean,
  location?: string
): TargetConstraint {
  return {
    key,
    severityCode: 'error',
    valueExpression: {
      expression,
      language: 'text/fhirpath'
    },
    human: `${key} constraint message`,
    isInvalid,
    ...(location && { location })
  };
}

describe('targetConstraint', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset console.warn mock
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('evaluateInitialTargetConstraints', () => {
    it('should evaluate initial target constraints with valid expressions', async () => {
      const mockInitialResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const mockInitialResponseItemMap: Record<string, QuestionnaireResponseItem[]> = {};

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'true', false),
        'constraint-2': createMockTargetConstraint(
          'constraint-2',
          '%context.item.where(linkId="test").answer.value',
          true
        )
      };

      const mockVariables: Variables = {
        fhirPathVariables: {},
        xFhirQueryVariables: {}
      };

      const existingFhirPathContext = {};
      const fhirPathTerminologyCache = {};
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      const params = {
        initialResponse: mockInitialResponse,
        initialResponseItemMap: mockInitialResponseItemMap,
        targetConstraints: mockTargetConstraints,
        variables: mockVariables,
        existingFhirPathContext,
        fhirPathTerminologyCache,
        terminologyServerUrl
      };

      // Mock createFhirPathContext
      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: { updated: 'context' },
        fhirPathTerminologyCache: {}
      });

      // Mock fhirpath evaluate calls
      mockFhirpathEvaluate
        .mockReturnValueOnce(Promise.resolve([true])) // First constraint returns true
        .mockReturnValueOnce([false]); // Second constraint returns false (sync)

      // Mock handleFhirPathResult
      mockHandleFhirPathResult.mockResolvedValueOnce([true]).mockResolvedValueOnce([false]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(mockCreateFhirPathContext).toHaveBeenCalledWith(
        mockInitialResponse,
        mockInitialResponseItemMap,
        mockVariables,
        existingFhirPathContext,
        fhirPathTerminologyCache,
        terminologyServerUrl
      );

      expect(mockFhirpathEvaluate).toHaveBeenCalledTimes(2);
      expect(mockHandleFhirPathResult).toHaveBeenCalledTimes(2);

      expect(result.initialTargetConstraints['constraint-1'].isInvalid).toBe(true);
      expect(result.initialTargetConstraints['constraint-2'].isInvalid).toBe(false);
      expect(result.updatedFhirPathContext).toEqual({ updated: 'context' });
    });

    it('should skip constraints without expressions', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-no-expression': {
          key: 'constraint-no-expression',
          severityCode: 'error',
          human: 'No expression constraint',
          isInvalid: false
          // No valueExpression
        } as TargetConstraint,
        'constraint-empty-expression': {
          key: 'constraint-empty-expression',
          severityCode: 'error',
          valueExpression: {
            language: 'text/fhirpath'
            // No expression property
          },
          human: 'Empty expression constraint',
          isInvalid: false
        } as TargetConstraint
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      const result = await evaluateInitialTargetConstraints(params);

      expect(mockFhirpathEvaluate).not.toHaveBeenCalled();
      expect(result.initialTargetConstraints).toEqual(mockTargetConstraints);
    });

    it('should use cached results for repeated expressions', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'true', false)
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: { '"true"': [true] }, // Pre-cached result
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: { '"true"': [true] }
      });

      const result = await evaluateInitialTargetConstraints(params);

      expect(mockFhirpathEvaluate).not.toHaveBeenCalled();
      expect(result.initialTargetConstraints).toEqual(mockTargetConstraints);
    });

    it('should handle empty results by setting isInvalid to false', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-empty': createMockTargetConstraint('constraint-empty', 'empty.result', true)
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      mockFhirpathEvaluate.mockReturnValue([]);
      mockHandleFhirPathResult.mockResolvedValue([]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(result.initialTargetConstraints['constraint-empty'].isInvalid).toBe(false);
    });

    it('should handle intersect expressions with empty results', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-intersect': createMockTargetConstraint(
          'constraint-intersect',
          'item.intersect(empty)',
          true
        )
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      mockFhirpathEvaluate.mockReturnValue([]);
      mockHandleFhirPathResult.mockResolvedValue([]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(result.initialTargetConstraints['constraint-intersect'].isInvalid).toBe(false);
    });

    it('should cache async terminology results', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-async': createMockTargetConstraint(
          'constraint-async',
          'terminology.lookup()',
          false
        )
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      const asyncPromise = Promise.resolve([true]);
      mockFhirpathEvaluate.mockReturnValue(asyncPromise);
      mockHandleFhirPathResult.mockResolvedValue([true]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(result.fhirPathTerminologyCache['"terminology.lookup()"']).toEqual([true]);
    });

    it('should handle fhirpath evaluation errors gracefully', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-error': createMockTargetConstraint(
          'constraint-error',
          'invalid.expression.syntax',
          false
        )
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      const error = new Error('FHIRPath evaluation error');
      mockFhirpathEvaluate.mockImplementation(() => {
        throw error;
      });

      const result = await evaluateInitialTargetConstraints(params);

      expect(console.warn).toHaveBeenCalledWith(
        error.message,
        'Target Constraint Key: constraint-error\nExpression: invalid.expression.syntax'
      );
      expect(result.initialTargetConstraints['constraint-error'].isInvalid).toBe(false); // Should remain unchanged
    });

    it('should not update isInvalid when value is the same to prevent infinite loops', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-same': createMockTargetConstraint('constraint-same', 'true', true)
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      mockFhirpathEvaluate.mockReturnValue([true]);
      mockHandleFhirPathResult.mockResolvedValue([true]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(result.initialTargetConstraints['constraint-same'].isInvalid).toBe(true); // Unchanged
    });

    it('should handle non-boolean results', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-non-boolean': createMockTargetConstraint(
          'constraint-non-boolean',
          'item.count()',
          false
        )
      };

      const params = {
        initialResponse: {} as QuestionnaireResponse,
        initialResponseItemMap: {},
        targetConstraints: mockTargetConstraints,
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      mockFhirpathEvaluate.mockReturnValue([5]); // Non-boolean result
      mockHandleFhirPathResult.mockResolvedValue([5]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(result.initialTargetConstraints['constraint-non-boolean'].isInvalid).toBe(false); // Should remain unchanged
    });
  });

  describe('evaluateTargetConstraints', () => {
    it('should evaluate target constraints and return update status', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'true', false)
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = {};
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      mockFhirpathEvaluate.mockReturnValue([true]);
      mockHandleFhirPathResult.mockResolvedValue([true]);

      const result = await evaluateTargetConstraints(
        fhirPathContext,
        fhirPathTerminologyCache,
        mockTargetConstraints,
        terminologyServerUrl
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedTargetConstraints['constraint-1'].isInvalid).toBe(true);
    });

    it('should return false for isUpdated when no constraints change', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'true', true)
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = {};
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      mockFhirpathEvaluate.mockReturnValue([true]);
      mockHandleFhirPathResult.mockResolvedValue([true]);

      const result = await evaluateTargetConstraints(
        fhirPathContext,
        fhirPathTerminologyCache,
        mockTargetConstraints,
        terminologyServerUrl
      );

      expect(result.isUpdated).toBe(false);
      expect(result.updatedTargetConstraints['constraint-1'].isInvalid).toBe(true);
    });

    it('should use cached results for repeated expressions', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'true', false)
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = { '"true"': [true] }; // Pre-cached
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      const result = await evaluateTargetConstraints(
        fhirPathContext,
        fhirPathTerminologyCache,
        mockTargetConstraints,
        terminologyServerUrl
      );

      expect(mockFhirpathEvaluate).not.toHaveBeenCalled();
      expect(result.isUpdated).toBe(false);
    });

    it('should handle evaluation errors gracefully', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-error': createMockTargetConstraint('constraint-error', 'invalid.syntax', false)
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = {};
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      const error = new Error('Evaluation failed');
      mockFhirpathEvaluate.mockImplementation(() => {
        throw error;
      });

      const result = await evaluateTargetConstraints(
        fhirPathContext,
        fhirPathTerminologyCache,
        mockTargetConstraints,
        terminologyServerUrl
      );

      expect(console.warn).toHaveBeenCalledWith(
        error.message,
        'Target Constraint Key: constraint-error\nExpression: invalid.syntax'
      );
      expect(result.isUpdated).toBe(false);
    });

    it('should handle empty results and intersect edge cases', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-empty': createMockTargetConstraint('constraint-empty', 'empty.result', true),
        'constraint-intersect': createMockTargetConstraint(
          'constraint-intersect',
          'item.intersect(empty)',
          true
        )
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = {};
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      mockFhirpathEvaluate.mockReturnValue([]);
      mockHandleFhirPathResult.mockResolvedValue([]);

      const result = await evaluateTargetConstraints(
        fhirPathContext,
        fhirPathTerminologyCache,
        mockTargetConstraints,
        terminologyServerUrl
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedTargetConstraints['constraint-empty'].isInvalid).toBe(false);
      expect(result.updatedTargetConstraints['constraint-intersect'].isInvalid).toBe(false);
    });
  });

  describe('readTargetConstraintLocationLinkIds', () => {
    it('should extract linkIds from target constraint locations', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          },
          {
            linkId: 'item-2',
            type: 'string',
            text: 'Item 2'
          }
        ]
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint(
          'constraint-1',
          'true',
          undefined,
          'item.where(linkId="item-1")'
        ),
        'constraint-2': createMockTargetConstraint(
          'constraint-2',
          'false',
          undefined,
          'item.where(linkId="item-2")'
        ),
        'constraint-no-location': createMockTargetConstraint('constraint-no-location', 'true')
      };

      // Mock fhirpath.evaluate for location evaluation
      mockFhirpathEvaluate
        .mockReturnValueOnce([{ linkId: 'item-1' }]) // First location returns item-1
        .mockReturnValueOnce([{ linkId: 'item-2' }]); // Second location returns item-2

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result).toEqual({
        'item-1': ['constraint-1'],
        'item-2': ['constraint-2']
      });

      // Check that linkIds were added to the constraints
      expect(mockTargetConstraints['constraint-1'].linkId).toBe('item-1');
      expect(mockTargetConstraints['constraint-2'].linkId).toBe('item-2');
      expect(mockTargetConstraints['constraint-no-location'].linkId).toBeUndefined();
    });

    it('should handle multiple constraints pointing to the same linkId', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'shared-item',
            type: 'string',
            text: 'Shared Item'
          }
        ]
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint(
          'constraint-1',
          'constraint1',
          undefined,
          'item.where(linkId="shared-item")'
        ),
        'constraint-2': createMockTargetConstraint(
          'constraint-2',
          'constraint2',
          undefined,
          'item.where(linkId="shared-item")'
        )
      };

      mockFhirpathEvaluate
        .mockReturnValueOnce([{ linkId: 'shared-item' }])
        .mockReturnValueOnce([{ linkId: 'shared-item' }]);

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result).toEqual({
        'shared-item': ['constraint-1', 'constraint-2']
      });
    });

    it('should handle empty fhirpath results', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-empty': createMockTargetConstraint(
          'constraint-empty',
          'true',
          undefined,
          'item.where(linkId="non-existent")'
        )
      };

      mockFhirpathEvaluate.mockReturnValue([]); // Empty result

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result).toEqual({});
      expect(mockTargetConstraints['constraint-empty'].linkId).toBeUndefined();
    });

    it('should handle invalid fhirpath results (no linkId)', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-invalid': createMockTargetConstraint(
          'constraint-invalid',
          'true',
          undefined,
          'invalid.path'
        )
      };

      mockFhirpathEvaluate.mockReturnValue([{ text: 'No linkId property' }]);

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result).toEqual({});
      expect(mockTargetConstraints['constraint-invalid'].linkId).toBeUndefined();
    });

    it('should handle fhirpath evaluation errors', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-error': createMockTargetConstraint(
          'constraint-error',
          'true',
          undefined,
          'invalid.syntax.error'
        )
      };

      const error = new Error('FHIRPath syntax error');
      mockFhirpathEvaluate.mockImplementation(() => {
        throw error;
      });

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(console.warn).toHaveBeenCalledWith(
        error.message,
        'Target Constraint Location: invalid.syntax.error}'
      );
      expect(result).toEqual({});
    });

    it('should handle non-object fhirpath results', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-primitive': createMockTargetConstraint(
          'constraint-primitive',
          'true',
          undefined,
          'item.count()'
        )
      };

      mockFhirpathEvaluate.mockReturnValue([5]); // Primitive result

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result).toEqual({});
      expect(mockTargetConstraints['constraint-primitive'].linkId).toBeUndefined();
    });

    it('should handle non-string linkId values', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-non-string': createMockTargetConstraint(
          'constraint-non-string',
          'true',
          undefined,
          'item.first()'
        )
      };

      mockFhirpathEvaluate.mockReturnValue([{ linkId: 123 }]); // Non-string linkId

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result).toEqual({});
      expect(mockTargetConstraints['constraint-non-string'].linkId).toBeUndefined();
    });
  });
});
