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

import { beforeEach, describe, expect } from '@jest/globals';
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
  ...jest.requireActual('../utils/fhirpath'),
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
    it('should set isInvalid=false when expression returns true (constraint met)', async () => {
      // Per FHIR spec, expressions return true when the constraint is MET (valid).
      // constraint-1: expression returns [true] → constraint met → isInvalid should be false
      // constraint-2: expression returns [false] → constraint violated → isInvalid should be true
      const mockInitialResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const mockInitialResponseItemMap: Record<string, QuestionnaireResponseItem[]> = {};

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'age >= 0', false),
        'constraint-2': createMockTargetConstraint(
          'constraint-2',
          '%context.item.where(linkId="test").answer.value',
          false
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

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: { updated: 'context' },
        fhirPathTerminologyCache: {}
      });

      // constraint-1: expression returns true → constraint MET → isInvalid = false (no change from initial)
      // constraint-2: expression returns false → constraint VIOLATED → isInvalid = true
      mockFhirpathEvaluate
        .mockReturnValueOnce(Promise.resolve([true]))
        .mockReturnValueOnce([false]);

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

      expect(result.initialTargetConstraints['constraint-1'].isInvalid).toBe(false);
      expect(result.initialTargetConstraints['constraint-2'].isInvalid).toBe(true);
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
        fhirPathTerminologyCache: { true: [true] }, // Pre-cached result
        terminologyServerUrl: 'https://tx.fhir.org/r4'
      };

      mockCreateFhirPathContext.mockResolvedValue({
        fhirPathContext: {},
        fhirPathTerminologyCache: { true: [true] }
      });

      const result = await evaluateInitialTargetConstraints(params);

      expect(mockFhirpathEvaluate).not.toHaveBeenCalled();
      expect(result.initialTargetConstraints).toEqual(mockTargetConstraints);
    });

    it('should set isInvalid=false when expression returns empty (safe default)', async () => {
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

    it('should set isInvalid=true when intersect expression returns empty (constraint violated)', async () => {
      // fhirpath.js returns [] when an intersect() expression evaluates to false.
      // This means the constraint IS violated, so isInvalid should be true.
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-intersect': createMockTargetConstraint(
          'constraint-intersect',
          'item.intersect(empty)',
          false // starts valid
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

      expect(result.initialTargetConstraints['constraint-intersect'].isInvalid).toBe(true);
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

      expect(result.fhirPathTerminologyCache['terminology.lookup()']).toEqual([true]);
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

    it('should not update isInvalid when expression returns correct spec-compliant value (prevents infinite loops)', async () => {
      // constraint already correctly marked as valid (isInvalid=false), and expression returns true
      // (constraint met) → !true = false → same as existing → no update
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-already-valid': createMockTargetConstraint(
          'constraint-already-valid',
          'age >= 0',
          false // already correct
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

      mockFhirpathEvaluate.mockReturnValue([true]);
      mockHandleFhirPathResult.mockResolvedValue([true]);

      const result = await evaluateInitialTargetConstraints(params);

      expect(result.initialTargetConstraints['constraint-already-valid'].isInvalid).toBe(false);
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
    it('should set isInvalid=true and isUpdated=true when expression returns false (constraint violated)', async () => {
      // constraint starts valid (isInvalid=false), expression returns false → violated → update to true
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'age >= 0', false)
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = {};
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      mockFhirpathEvaluate.mockReturnValue([false]);
      mockHandleFhirPathResult.mockResolvedValue([false]);

      const result = await evaluateTargetConstraints(
        fhirPathContext,
        fhirPathTerminologyCache,
        mockTargetConstraints,
        terminologyServerUrl
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedTargetConstraints['constraint-1'].isInvalid).toBe(true);
    });

    it('should set isInvalid=false and isUpdated=true when expression returns true (constraint met)', async () => {
      // constraint starts violated (isInvalid=true), expression returns true → met → update to false
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'age >= 0', true)
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
      expect(result.updatedTargetConstraints['constraint-1'].isInvalid).toBe(false);
    });

    it('should return isUpdated=false when constraint value does not change', async () => {
      // constraint already correctly valid (isInvalid=false), expression returns true → no change
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'age >= 0', false)
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
      expect(result.updatedTargetConstraints['constraint-1'].isInvalid).toBe(false);
    });

    it('should use cached results for repeated expressions', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-1': createMockTargetConstraint('constraint-1', 'true', false)
      };

      const fhirPathContext = { test: 'context' };
      const fhirPathTerminologyCache = { true: [true] }; // Pre-cached
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

    it('should keep isInvalid=true when intersect still returns empty after a form edit (constraint remains violated)', async () => {
      // After any form edit, all constraints are re-evaluated. If an intersect constraint was
      // already violated (isInvalid=true) and the expression still returns [], isInvalid must
      // stay true — without the fix, the generic empty case would reset it to false.
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-intersect': createMockTargetConstraint(
          'constraint-intersect',
          'item.intersect(empty)',
          true // violated from previous evaluation
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

      expect(result.isUpdated).toBe(false);
      expect(result.updatedTargetConstraints['constraint-intersect'].isInvalid).toBe(true);
    });

    it('should set isInvalid=false for empty result (safe default) and isInvalid=true for intersect empty result (constraint violated)', async () => {
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-empty': createMockTargetConstraint('constraint-empty', 'empty.result', true),
        'constraint-intersect': createMockTargetConstraint(
          'constraint-intersect',
          'item.intersect(empty)',
          false // starts valid
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
      // Generic empty → safe default: not invalid
      expect(result.updatedTargetConstraints['constraint-empty'].isInvalid).toBe(false);
      // Intersect empty → constraint violated: invalid
      expect(result.updatedTargetConstraints['constraint-intersect'].isInvalid).toBe(true);
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
      // constraint with no location and no pre-set linkId is not mapped
      expect(mockTargetConstraints['constraint-no-location'].linkId).toBeUndefined();
    });

    it('should map item-level constraints by their pre-set linkId (no location)', () => {
      // Constraints extracted from item extensions have linkId set during extraction
      // (no location extension). readTargetConstraintLocationLinkIds should include these
      // in the returned map.
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'field-a', type: 'string', text: 'Field A' },
          { linkId: 'field-b', type: 'string', text: 'Field B' }
        ]
      };

      // No location: these take the else-if(linkId) branch, not the location branch.
      // If location were set, it would override linkId via FHIRPath resolution instead.
      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'item-level-1': {
          ...createMockTargetConstraint('item-level-1', 'field.exists()'),
          linkId: 'field-a', // set during extraction
          location: undefined
        },
        'item-level-2': {
          ...createMockTargetConstraint('item-level-2', 'other.exists()'),
          linkId: 'field-b', // set during extraction
          location: undefined
        }
      };

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      // No fhirpath evaluation needed — linkId already known from extraction
      expect(mockFhirpathEvaluate).not.toHaveBeenCalled();

      expect(result).toEqual({
        'field-a': ['item-level-1'],
        'field-b': ['item-level-2']
      });
    });

    it('should accumulate multiple item-level constraints on the same linkId', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [{ linkId: 'shared-field', type: 'string', text: 'Shared' }]
      };

      const mockTargetConstraints: Record<string, TargetConstraint> = {
        'constraint-a': {
          ...createMockTargetConstraint('constraint-a', 'expr-a'),
          linkId: 'shared-field',
          location: undefined
        },
        'constraint-b': {
          ...createMockTargetConstraint('constraint-b', 'expr-b'),
          linkId: 'shared-field',
          location: undefined
        }
      };

      const result = readTargetConstraintLocationLinkIds(mockQuestionnaire, mockTargetConstraints);

      expect(result['shared-field']).toHaveLength(2);
      expect(result['shared-field']).toContain('constraint-a');
      expect(result['shared-field']).toContain('constraint-b');
    });

    it('should handle multiple constraints pointing to the same linkId via location', () => {
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
