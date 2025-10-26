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
  addBindingParametersToValueSetUrl,
  evaluateDynamicValueSets,
  evaluateInitialDynamicValueSets,
  getBindingParameter,
  getBindingParameters
} from '../utils/parameterisedValueSets';
import type { Extension, QuestionnaireItem } from 'fhir/r4';
import type { BindingParameter } from '../interfaces/valueSet.interface';

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
  evaluate: jest.fn(() => ['test-result'])
}));

describe('parameterisedValueSets utils', () => {
  describe('getBindingParameter', () => {
    it('should extract binding parameter with valueExpression', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'name',
            valueString: 'patient-id'
          },
          {
            url: 'expression',
            valueExpression: {
              expression: '%patient.id',
              language: 'text/fhirpath'
            }
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toEqual({
        name: 'patient-id',
        value: '',
        fhirPathExpression: '%patient.id'
      });
    });

    it('should extract binding parameter with valueString', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'name',
            valueString: 'static-param'
          },
          {
            url: 'expression',
            valueString: 'fixed-value'
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toEqual({
        name: 'static-param',
        value: 'fixed-value'
      });
    });

    it('should return null when paramName is missing', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'expression',
            valueString: 'some-value'
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });

    it('should return null when paramExpression is missing', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'name',
            valueString: 'param-name'
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });

    it('should return null when valueExpression has wrong language', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'name',
            valueString: 'param-name'
          },
          {
            url: 'expression',
            valueExpression: {
              expression: 'some-expression',
              language: 'text/cql'
            }
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });

    it('should return null when valueExpression is missing expression', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'name',
            valueString: 'param-name'
          },
          {
            url: 'expression',
            valueExpression: {
              language: 'text/fhirpath'
            }
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });

    it('should return null when expression extension has no value', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: [
          {
            url: 'name',
            valueString: 'param-name'
          },
          {
            url: 'expression'
          }
        ]
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });

    it('should handle extension with no sub-extensions', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter'
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });

    it('should handle empty extension array', () => {
      const extension: Extension = {
        url: 'http://test.com/binding-parameter',
        extension: []
      };

      const result = getBindingParameter(extension);

      expect(result).toBeNull();
    });
  });

  describe('getBindingParameters', () => {
    it('should return empty array when qItem has no _answerValueSet', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice'
      };

      const result = getBindingParameters(qItem, 'http://example.com/valueset');

      expect(result).toEqual([]);
    });

    it('should return empty array for contained value sets', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice',
        _answerValueSet: {
          extension: [
            {
              url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
              extension: [
                {
                  url: 'name',
                  valueString: 'patient-id'
                }
              ]
            }
          ]
        }
      };

      const result = getBindingParameters(qItem, '#contained-valueset');

      expect(result).toEqual([]);
    });

    it('should extract binding parameters from extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice',
        _answerValueSet: {
          extension: [
            {
              url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
              extension: [
                {
                  url: 'name',
                  valueString: 'patient-id'
                },
                {
                  url: 'expression',
                  valueExpression: {
                    expression: '%patient.id',
                    language: 'text/fhirpath'
                  }
                }
              ]
            },
            {
              url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
              extension: [
                {
                  url: 'name',
                  valueString: 'context'
                },
                {
                  url: 'expression',
                  valueString: 'static-value'
                }
              ]
            }
          ]
        }
      };

      const result = getBindingParameters(qItem, 'http://example.com/valueset');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'patient-id',
        value: '',
        fhirPathExpression: '%patient.id'
      });
      expect(result[1]).toEqual({
        name: 'context',
        value: 'static-value'
      });
    });

    it('should filter out invalid binding parameters', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice',
        _answerValueSet: {
          extension: [
            {
              url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
              extension: [
                {
                  url: 'name',
                  valueString: 'valid-param'
                },
                {
                  url: 'expression',
                  valueString: 'valid-value'
                }
              ]
            },
            {
              url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
              extension: [
                {
                  url: 'name',
                  valueString: 'incomplete-param'
                }
                // Missing expression
              ]
            },
            {
              url: 'http://other.url',
              extension: [
                {
                  url: 'name',
                  valueString: 'wrong-url-param'
                }
              ]
            }
          ]
        }
      };

      const result = getBindingParameters(qItem, 'http://example.com/valueset');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'valid-param',
        value: 'valid-value'
      });
    });

    it('should handle _answerValueSet without extension', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice',
        _answerValueSet: {}
      };

      const result = getBindingParameters(qItem, 'http://example.com/valueset');

      expect(result).toEqual([]);
    });

    it('should handle binding parameter extension without sub-extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice',
        _answerValueSet: {
          extension: [
            {
              url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter'
              // No extension property
            }
          ]
        }
      };

      const result = getBindingParameters(qItem, 'http://example.com/valueset');

      expect(result).toEqual([]);
    });

    it('should handle empty extension array', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'choice',
        _answerValueSet: {
          extension: []
        }
      };

      const result = getBindingParameters(qItem, 'http://example.com/valueset');

      expect(result).toEqual([]);
    });
  });

  describe('addBindingParametersToValueSetUrl', () => {
    it('should add parameters with values to URL', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const bindingParameters: BindingParameter[] = [
        { name: 'patient-id', value: '123' },
        { name: 'context', value: 'active' }
      ];

      const result = addBindingParametersToValueSetUrl(valueSetUrl, bindingParameters);

      expect(result).toBe('http://example.com/valueset&patient-id=123&context=active');
    });

    it('should skip parameters with empty values', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const bindingParameters: BindingParameter[] = [
        { name: 'patient-id', value: '123' },
        { name: 'empty-param', value: '' },
        { name: 'context', value: 'active' }
      ];

      const result = addBindingParametersToValueSetUrl(valueSetUrl, bindingParameters);

      expect(result).toBe('http://example.com/valueset&patient-id=123&context=active');
    });

    it('should handle empty parameters array', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const bindingParameters: BindingParameter[] = [];

      const result = addBindingParametersToValueSetUrl(valueSetUrl, bindingParameters);

      expect(result).toBe('http://example.com/valueset');
    });

    it('should handle all parameters with empty values', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const bindingParameters: BindingParameter[] = [
        { name: 'param1', value: '' },
        { name: 'param2', value: '' }
      ];

      const result = addBindingParametersToValueSetUrl(valueSetUrl, bindingParameters);

      expect(result).toBe('http://example.com/valueset');
    });

    it('should handle URL that already has query parameters', () => {
      const valueSetUrl = 'http://example.com/valueset?existing=param';
      const bindingParameters: BindingParameter[] = [{ name: 'new-param', value: 'value' }];

      const result = addBindingParametersToValueSetUrl(valueSetUrl, bindingParameters);

      expect(result).toBe('http://example.com/valueset?existing=param&new-param=value');
    });

    it('should handle special characters in parameter values', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const bindingParameters: BindingParameter[] = [
        { name: 'special', value: 'value with spaces & symbols' }
      ];

      const result = addBindingParametersToValueSetUrl(valueSetUrl, bindingParameters);

      expect(result).toBe('http://example.com/valueset&special=value with spaces & symbols');
    });
  });

  describe('evaluateInitialDynamicValueSets', () => {
    const createMockParams = (overrides = {}) => ({
      initialResponse: {
        resourceType: 'QuestionnaireResponse' as const,
        status: 'in-progress' as const
      },
      initialResponseItemMap: {},
      processedValueSets: {},
      variables: {
        fhirPathVariables: {},
        xFhirQueryVariables: {}
      },
      existingFhirPathContext: {},
      fhirPathTerminologyCache: {},
      terminologyServerUrl: 'http://terminology.example.com',
      ...overrides
    });

    it('should return early when no dynamic value sets exist', async () => {
      const params = createMockParams({
        processedValueSets: {
          'static-vs': {
            initialValueSetUrl: 'http://example.com/static',
            updatableValueSetUrl: 'http://example.com/static',
            isDynamic: false,
            bindingParameters: [],
            linkIds: []
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      expect(result.initialProcessedValueSets).toBe(params.processedValueSets);
      expect(result.updatedFhirPathContext).toBe(params.existingFhirPathContext);
      expect(result.fhirPathTerminologyCache).toBe(params.fhirPathTerminologyCache);
    });

    it('should process dynamic value sets with FHIRPath expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue(['patient-123']);

      const processedValueSets = {
        'dynamic-vs': {
          isDynamic: true,
          initialValueSetUrl: 'http://example.com/valueset',
          updatableValueSetUrl: 'http://example.com/valueset',
          bindingParameters: [
            {
              name: 'patient-id',
              value: '',
              fhirPathExpression: '%patient.id'
            }
          ]
        }
      };

      const params = createMockParams({ processedValueSets });

      const result = await evaluateInitialDynamicValueSets(params);

      expect(result.initialProcessedValueSets['dynamic-vs'].bindingParameters[0].value).toBe(
        'patient-123'
      );
      expect(result.initialProcessedValueSets['dynamic-vs'].updatableValueSetUrl).toBe(
        'http://example.com/valueset&patient-id=patient-123'
      );
    });

    it('should handle pre-existing cache', async () => {
      const params = createMockParams({
        processedValueSets: {
          'dynamic-vs': {
            initialValueSetUrl: 'http://example.com/dynamic',
            updatableValueSetUrl: 'http://example.com/dynamic',
            isDynamic: true,
            bindingParameters: [
              {
                name: 'patient-id',
                value: 'old-value',
                fhirPathExpression: '%patient.id'
              }
            ],
            linkIds: []
          }
        },
        fhirPathTerminologyCache: {
          'existing-key': ['existing-result']
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      // Function should complete successfully with pre-existing cache
      expect(result).toBeDefined();
      expect(result.initialProcessedValueSets['dynamic-vs'].bindingParameters[0].value).toBe(
        'patient-123'
      );
    });

    it('should handle FHIRPath evaluation errors', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockImplementation(() => {
        throw new Error('FHIRPath evaluation failed');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const params = createMockParams({
        processedValueSets: {
          'dynamic-vs': {
            initialValueSetUrl: 'http://example.com/dynamic',
            updatableValueSetUrl: 'http://example.com/dynamic',
            isDynamic: true,
            bindingParameters: [
              {
                name: 'patient-id',
                value: '',
                fhirPathExpression: 'invalid.expression'
              }
            ],
            linkIds: []
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      expect(consoleSpy).toHaveBeenCalledWith(
        'FHIRPath evaluation failed',
        expect.stringContaining('invalid.expression')
      );
      expect(result.initialProcessedValueSets['dynamic-vs'].bindingParameters[0].value).toBe('');

      consoleSpy.mockRestore();
    });

    it('should evaluate Promise-based FHIRPath results but skip caching for %-expressions', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue(Promise.resolve(['async-result']));

      const params = createMockParams({
        processedValueSets: {
          'dynamic-vs': {
            isDynamic: true,
            initialValueSetUrl: 'http://example.com/valueset',
            updatableValueSetUrl: 'http://example.com/valueset',
            bindingParameters: [
              {
                name: 'patient-id',
                value: '',
                fhirPathExpression: '%patient.id'
              }
            ]
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      // Cache should not store %-expressions
      expect(result.fhirPathTerminologyCache).toEqual({});
    });

    it('should handle empty FHIRPath results (remove parameter)', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue([]);

      const params = createMockParams({
        processedValueSets: {
          'dynamic-vs': {
            isDynamic: true,
            initialValueSetUrl: 'http://example.com/valueset',
            updatableValueSetUrl: 'http://example.com/valueset&patient-id=old-value',
            bindingParameters: [
              {
                name: 'patient-id',
                value: 'old-value',
                fhirPathExpression: '%patient.id'
              }
            ]
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      expect(result.initialProcessedValueSets['dynamic-vs'].bindingParameters[0].value).toBe('');
      expect(result.initialProcessedValueSets['dynamic-vs'].updatableValueSetUrl).toBe(
        'http://example.com/valueset'
      );
    });

    it('should handle multiple dynamic value sets', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValueOnce(['result-1']).mockReturnValueOnce(['result-2']);

      const params = createMockParams({
        processedValueSets: {
          'dynamic-vs-1': {
            isDynamic: true,
            initialValueSetUrl: 'http://example.com/vs1',
            updatableValueSetUrl: 'http://example.com/vs1',
            bindingParameters: [
              {
                name: 'param1',
                value: '',
                fhirPathExpression: 'expression1'
              }
            ]
          },
          'dynamic-vs-2': {
            isDynamic: true,
            initialValueSetUrl: 'http://example.com/vs2',
            updatableValueSetUrl: 'http://example.com/vs2',
            bindingParameters: [
              {
                name: 'param2',
                value: '',
                fhirPathExpression: 'expression2'
              }
            ]
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      expect(result.initialProcessedValueSets['dynamic-vs-1'].bindingParameters[0].value).toBe(
        'result-1'
      );
      expect(result.initialProcessedValueSets['dynamic-vs-2'].bindingParameters[0].value).toBe(
        'result-2'
      );
    });

    it('should skip non-dynamic value sets', async () => {
      const params = createMockParams({
        processedValueSets: {
          'static-vs': {
            isDynamic: false,
            bindingParameters: []
          },
          'dynamic-vs': {
            isDynamic: true,
            bindingParameters: []
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      // Should process dynamic-vs but skip static-vs
      expect(result.initialProcessedValueSets).toBeDefined();
    });

    it('should handle binding parameters without FHIRPath expressions', async () => {
      const params = createMockParams({
        processedValueSets: {
          'dynamic-vs': {
            isDynamic: true,
            bindingParameters: [
              {
                name: 'static-param',
                value: 'static-value'
                // No fhirPathExpression
              }
            ]
          }
        }
      });

      const result = await evaluateInitialDynamicValueSets(params);

      // Should not modify static parameters
      expect(result.initialProcessedValueSets['dynamic-vs'].bindingParameters[0].value).toBe(
        'static-value'
      );
    });
  });

  describe('evaluateDynamicValueSets', () => {
    it('should return not updated when no dynamic value sets exist', async () => {
      const processedValueSets = {
        'static-vs': {
          initialValueSetUrl: 'http://example.com/static',
          updatableValueSetUrl: 'http://example.com/static',
          isDynamic: false,
          bindingParameters: [],
          linkIds: []
        }
      };

      const result = await evaluateDynamicValueSets(
        {},
        {},
        processedValueSets,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(false);
      expect(result.computedNewAnswers).toEqual({});
    });

    it('should evaluate dynamic value sets and detect updates', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue(['new-value']);

      const processedValueSets = {
        'dynamic-vs': {
          isDynamic: true,
          initialValueSetUrl: 'http://example.com/valueset',
          updatableValueSetUrl: 'http://example.com/valueset',
          bindingParameters: [
            {
              name: 'patient-id',
              value: 'old-value',
              fhirPathExpression: '%patient.id'
            }
          ],
          linkIds: ['item-1', 'item-2']
        }
      };

      const result = await evaluateDynamicValueSets(
        { mockContext: true },
        {},
        processedValueSets,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(true);
      expect(result.updatedProcessedValueSets['dynamic-vs'].bindingParameters[0].value).toBe(
        'new-value'
      );
      expect(result.computedNewAnswers).toEqual({
        'item-1': null,
        'item-2': null
      });
    });

    it('should not update when parameter value is the same', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockReturnValue(['same-value']);

      const processedValueSets = {
        'dynamic-vs': {
          initialValueSetUrl: 'http://example.com/dynamic',
          updatableValueSetUrl: 'http://example.com/dynamic',
          isDynamic: true,
          bindingParameters: [
            {
              name: 'patient-id',
              value: 'same-value',
              fhirPathExpression: '%patient.id'
            }
          ],
          linkIds: []
        }
      };

      const result = await evaluateDynamicValueSets(
        {},
        {},
        processedValueSets,
        'http://terminology.example.com'
      );

      expect(result.isUpdated).toBe(false);
    });

    it('should always evaluate variable-based expressions (%-expressions) instead of using cache', async () => {
      const processedValueSets = {
        'dynamic-vs': {
          initialValueSetUrl: 'http://example.com/dynamic',
          updatableValueSetUrl: 'http://example.com/dynamic',
          isDynamic: true,
          bindingParameters: [
            {
              name: 'patient-id',
              value: 'old-value',
              fhirPathExpression: '%patient.id'
            }
          ],
          linkIds: []
        }
      };

      const fhirPathTerminologyCache = {
        '%patient.id': ['cached-result']
      };

      const result = await evaluateDynamicValueSets(
        {},
        fhirPathTerminologyCache,
        processedValueSets,
        'http://terminology.example.com'
      );

      // Should always evaluate, because expressions with variables (%) cannot be cached
      expect(result.isUpdated).toBe(true);
    });

    it('should handle FHIRPath evaluation errors', async () => {
      const mockFhirpath = jest.requireMock('fhirpath') as any;
      mockFhirpath.evaluate.mockImplementation(() => {
        throw new Error('FHIRPath evaluation failed');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const processedValueSets = {
        'dynamic-vs': {
          initialValueSetUrl: 'http://example.com/dynamic',
          updatableValueSetUrl: 'http://example.com/dynamic',
          isDynamic: true,
          bindingParameters: [
            {
              name: 'patient-id',
              value: '',
              fhirPathExpression: 'invalid.expression'
            }
          ],
          linkIds: []
        }
      };

      const result = await evaluateDynamicValueSets(
        {},
        {},
        processedValueSets,
        'http://terminology.example.com'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'FHIRPath evaluation failed',
        expect.stringContaining('invalid.expression')
      );
      expect(result.isUpdated).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});
