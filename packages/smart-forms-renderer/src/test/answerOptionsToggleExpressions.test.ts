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
  evaluateAnswerOptionsToggleExpressions,
  evaluateInitialAnswerOptionsToggleExpressions
} from '../utils/answerOptionsToggleExpressions';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';

// Mock dependencies
jest.mock('../utils/fhirpath', () => ({
  ...jest.requireActual('../utils/fhirpath'),
  createFhirPathContext: jest.fn(() =>
    Promise.resolve({
      fhirPathContext: { mockContext: true },
      fhirPathTerminologyCache: {}
    })
  ),
  handleFhirPathResult: jest.fn((result) => Promise.resolve(result))
}));

jest.mock('fhirpath', () => ({
  evaluate: jest.fn(() => [true]) // Default mock result
}));

describe('answerOptionsToggleExpressions utils', () => {
  describe('evaluateInitialAnswerOptionsToggleExpressions', () => {
    it('should process answerOptionsToggleExpressions successfully', async () => {
      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.active'
            },
            isEnabled: false
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: []
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: mockAnswerOptionsToggleExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(result.initialAnswerOptionsToggleExpressions).toBeDefined();
      expect(result.updatedFhirPathContext).toBeDefined();
      expect(result.fhirPathTerminologyCache).toBeDefined();
    });

    it('should handle empty answerOptionsToggleExpressions', async () => {
      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: {},
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(result.initialAnswerOptionsToggleExpressions).toEqual({});
    });

    it('should update isEnabled when result differs from initial value', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      fhirpath.evaluate.mockReturnValue([true]);

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.active'
            },
            isEnabled: false // Different from result
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: mockAnswerOptionsToggleExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(result.initialAnswerOptionsToggleExpressions['test-item'][0].isEnabled).toBe(true);
    });

    it('should set isEnabled to false when no result is returned', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      fhirpath.evaluate.mockReturnValue([]);

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.doesNotExist'
            },
            isEnabled: true
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: mockAnswerOptionsToggleExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(result.initialAnswerOptionsToggleExpressions['test-item'][0].isEnabled).toBe(false);
    });

    it('should handle intersect edge case', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      fhirpath.evaluate.mockReturnValue([]);

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'something intersect somethingElse'
            },
            isEnabled: true
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: mockAnswerOptionsToggleExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(result.initialAnswerOptionsToggleExpressions['test-item'][0].isEnabled).toBe(false);
    });

    it('should cache Promise-based fhirPathResult', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      const mockPromise = Promise.resolve([true]);
      fhirpath.evaluate.mockReturnValue(mockPromise);

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'async expression'
            },
            isEnabled: false
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: mockAnswerOptionsToggleExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(result.fhirPathTerminologyCache['async expression']).toEqual([true]);
    });

    it('should handle evaluation errors gracefully', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      fhirpath.evaluate.mockImplementation(() => {
        throw new Error('FHIRPath evaluation error');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'invalid expression'
            },
            isEnabled: false
          }
        ]
      };

      const params = {
        initialResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
        },
        initialResponseItemMap: {},
        answerOptionsToggleExpressions: mockAnswerOptionsToggleExpressions,
        variables: {
          fhirPathVariables: {},
          xFhirQueryVariables: {}
        },
        existingFhirPathContext: {},
        fhirPathTerminologyCache: {},
        terminologyServerUrl: 'http://test.com'
      };

      const result = await evaluateInitialAnswerOptionsToggleExpressions(params);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toBeDefined();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('evaluateAnswerOptionsToggleExpressions', () => {
    it('should evaluate expressions and return updated state', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      fhirpath.evaluate.mockReturnValue([true]);

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.active'
            },
            isEnabled: false
          }
        ]
      };

      const result = await evaluateAnswerOptionsToggleExpressions(
        { mockContext: true },
        {},
        mockAnswerOptionsToggleExpressions,
        'http://test.com'
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedAnswerOptionsToggleExpressions).toBeDefined();
      expect(result.computedNewAnswers).toBeDefined();
    });

    it('should handle cached expressions', async () => {
      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'cached expression'
            },
            isEnabled: false
          }
        ]
      };

      const result = await evaluateAnswerOptionsToggleExpressions(
        { mockContext: true },
        { 'cached expression': [true] },
        mockAnswerOptionsToggleExpressions,
        'http://test.com'
      );

      expect(result.isUpdated).toBe(false);
    });

    it('should handle evaluation errors gracefully', async () => {
      const fhirpath = jest.requireMock('fhirpath') as any;
      fhirpath.evaluate.mockImplementation(() => {
        throw new Error('FHIRPath evaluation error');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {
        'test-item': [
          {
            linkId: 'test-item',
            options: [{ valueString: 'option1' }],
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'invalid expression'
            },
            isEnabled: false
          }
        ]
      };

      const result = await evaluateAnswerOptionsToggleExpressions(
        { mockContext: true },
        {},
        mockAnswerOptionsToggleExpressions,
        'http://test.com'
      );

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toBeDefined();

      consoleWarnSpy.mockRestore();
    });
  });
});
