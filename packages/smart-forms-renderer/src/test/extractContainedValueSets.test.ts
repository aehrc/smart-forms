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

import type { Questionnaire, ValueSet } from 'fhir/r4';
import { extractContainedValueSets, getValueSetUrlFromContained } from '../utils/questionnaireStoreUtils/extractContainedValueSets';

// Mock the valueSet utility functions
jest.mock('../utils/valueSet', () => ({
  getValueSetCodings: jest.fn(),
  getValueSetPromise: jest.fn()
}));

import { getValueSetCodings, getValueSetPromise } from '../utils/valueSet';

const mockGetValueSetCodings = getValueSetCodings as jest.MockedFunction<typeof getValueSetCodings>;
const mockGetValueSetPromise = getValueSetPromise as jest.MockedFunction<typeof getValueSetPromise>;

describe('extractContainedValueSets - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractContainedValueSets', () => {
    it('should return empty objects when questionnaire has no contained resources', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual({
        processedValueSets: {},
        valueSetPromises: {},
        cachedValueSetCodings: {}
      });
      expect(mockGetValueSetCodings).not.toHaveBeenCalled();
      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });

    it('should return empty objects when questionnaire has empty contained array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: []
      };

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual({
        processedValueSets: {},
        valueSetPromises: {},
        cachedValueSetCodings: {}
      });
    });

    it('should skip non-ValueSet contained resources', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'Patient',
            id: 'patient1'
          },
          {
            resourceType: 'Observation',
            id: 'obs1',
            status: 'final',
            code: { coding: [{ code: 'test' }] }
          }
        ]
      };

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual({
        processedValueSets: {},
        valueSetPromises: {},
        cachedValueSetCodings: {}
      });
    });

    it('should skip ValueSet resources without id', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            status: 'active'
            // no id
          } as ValueSet
        ]
      };

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual({
        processedValueSets: {},
        valueSetPromises: {},
        cachedValueSetCodings: {}
      });
    });

    it('should process expanded ValueSets with codings', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'vs1',
            url: 'http://example.com/ValueSet/colors',
            status: 'active',
            expansion: {
              contains: [
                {
                  system: 'http://example.com/colors',
                  code: 'red',
                  display: 'Red'
                },
                {
                  system: 'http://example.com/colors',
                  code: 'blue',
                  display: 'Blue'
                }
              ]
            }
          } as ValueSet
        ]
      };

      const mockCodings = [
        { system: 'http://example.com/colors', code: 'red', display: 'Red' },
        { system: 'http://example.com/colors', code: 'blue', display: 'Blue' }
      ];
      mockGetValueSetCodings.mockReturnValue(mockCodings);

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.processedValueSets).toEqual({
        'vs1': {
          initialValueSetUrl: 'http://example.com/ValueSet/colors',
          updatableValueSetUrl: 'http://example.com/ValueSet/colors',
          bindingParameters: [],
          isDynamic: false,
          linkIds: []
        }
      });
      expect(result.cachedValueSetCodings).toEqual({
        'vs1': mockCodings
      });
      expect(result.valueSetPromises).toEqual({});
      expect(mockGetValueSetCodings).toHaveBeenCalledWith(questionnaire.contained![0]);
    });

    it('should process expanded ValueSets without url', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'vs-no-url',
            status: 'active',
            expansion: {
              contains: [
                {
                  system: 'http://example.com/codes',
                  code: 'test',
                  display: 'Test'
                }
              ]
            }
          } as ValueSet
        ]
      };

      const mockCodings = [
        { system: 'http://example.com/codes', code: 'test', display: 'Test' }
      ];
      mockGetValueSetCodings.mockReturnValue(mockCodings);

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.processedValueSets).toEqual({
        'vs-no-url': {
          initialValueSetUrl: '',
          updatableValueSetUrl: '',
          bindingParameters: [],
          isDynamic: false,
          linkIds: []
        }
      });
      expect(result.cachedValueSetCodings).toEqual({
        'vs-no-url': mockCodings
      });
    });

    it('should create promises for unexpanded ValueSets with compose.include.valueSet', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'vs-unexpanded',
            url: 'http://example.com/ValueSet/unexpanded',
            status: 'active',
            compose: {
              include: [
                {
                  valueSet: ['http://terminology.hl7.org/ValueSet/v3-EntityNameUseR2']
                }
              ]
            }
          } as ValueSet
        ]
      };

      const mockPromise = Promise.resolve({
        resourceType: 'ValueSet',
        status: 'active'
      } as ValueSet);
      mockGetValueSetPromise.mockReturnValue(mockPromise);

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.valueSetPromises).toEqual({
        'vs-unexpanded': {
          promise: mockPromise
        }
      });
      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://terminology.hl7.org/ValueSet/v3-EntityNameUseR2',
        'http://terminology.hl7.org/fhir'
      );
      expect(result.processedValueSets).toEqual({});
      expect(result.cachedValueSetCodings).toEqual({});
    });

    it('should handle ValueSets with url but no expansion or compose', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'vs-simple',
            url: 'http://example.com/ValueSet/simple',
            status: 'active'
          } as ValueSet
        ]
      };

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.processedValueSets).toEqual({
        'vs-simple': {
          initialValueSetUrl: 'http://example.com/ValueSet/simple',
          updatableValueSetUrl: 'http://example.com/ValueSet/simple',
          bindingParameters: [],
          isDynamic: false,
          linkIds: []
        }
      });
      expect(result.valueSetPromises).toEqual({});
      expect(result.cachedValueSetCodings).toEqual({});
    });

    it('should handle multiple ValueSets of different types', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'vs-expanded',
            url: 'http://example.com/ValueSet/expanded',
            status: 'active',
            expansion: {
              contains: [
                { system: 'http://example.com', code: 'test1', display: 'Test 1' }
              ]
            }
          } as ValueSet,
          {
            resourceType: 'ValueSet',
            id: 'vs-unexpanded',
            url: 'http://example.com/ValueSet/unexpanded',
            status: 'active',
            compose: {
              include: [
                { valueSet: ['http://terminology.hl7.org/ValueSet/test'] }
              ]
            }
          } as ValueSet,
          {
            resourceType: 'ValueSet',
            id: 'vs-simple',
            url: 'http://example.com/ValueSet/simple',
            status: 'active'
          } as ValueSet
        ]
      };

      const mockCodings = [
        { system: 'http://example.com', code: 'test1', display: 'Test 1' }
      ];
      const mockPromise = Promise.resolve({
        resourceType: 'ValueSet',
        status: 'active'
      } as ValueSet);
      mockGetValueSetCodings.mockReturnValue(mockCodings);
      mockGetValueSetPromise.mockReturnValue(mockPromise);

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.processedValueSets).toEqual({
        'vs-expanded': {
          initialValueSetUrl: 'http://example.com/ValueSet/expanded',
          updatableValueSetUrl: 'http://example.com/ValueSet/expanded',
          bindingParameters: [],
          isDynamic: false,
          linkIds: []
        },
        'vs-simple': {
          initialValueSetUrl: 'http://example.com/ValueSet/simple',
          updatableValueSetUrl: 'http://example.com/ValueSet/simple',
          bindingParameters: [],
          isDynamic: false,
          linkIds: []
        }
      });
      expect(result.valueSetPromises).toEqual({
        'vs-unexpanded': {
          promise: mockPromise
        }
      });
      expect(result.cachedValueSetCodings).toEqual({
        'vs-expanded': mockCodings
      });
    });

    it('should handle ValueSets with complex compose structure', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'vs-complex',
            url: 'http://example.com/ValueSet/complex',
            status: 'active',
            compose: {
              include: [
                {
                  system: 'http://example.com/system1'
                },
                {
                  valueSet: ['http://terminology.hl7.org/ValueSet/test1', 'http://terminology.hl7.org/ValueSet/test2']
                }
              ]
            }
          } as ValueSet
        ]
      };

      const mockPromise = Promise.resolve({
        resourceType: 'ValueSet',
        status: 'active'
      } as ValueSet);
      mockGetValueSetPromise.mockReturnValue(mockPromise);

      const result = extractContainedValueSets(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.valueSetPromises).toEqual({
        'vs-complex': {
          promise: mockPromise
        }
      });
      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://terminology.hl7.org/ValueSet/test1',
        'http://terminology.hl7.org/fhir'
      );
    });
  });

  describe('getValueSetUrlFromContained', () => {
    it('should return first valueSet URL from compose.include', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: [
            {
              valueSet: ['http://terminology.hl7.org/ValueSet/first', 'http://terminology.hl7.org/ValueSet/second']
            }
          ]
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('http://terminology.hl7.org/ValueSet/first');
    });

    it('should return empty string when no compose', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active'
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });

    it('should return empty string when no include', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: []
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });

    it('should return empty string when include is empty array', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: []
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });

    it('should return empty string when include has no valueSet', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: [
            {
              system: 'http://example.com/system'
            }
          ]
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });

    it('should return empty string when valueSet array is empty', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: [
            {
              valueSet: []
            }
          ]
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });

    it('should return first non-empty valueSet URL', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: [
            {
              valueSet: ['', 'http://terminology.hl7.org/ValueSet/second']
            }
          ]
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });

    it('should handle multiple include entries', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: [
            {
              system: 'http://example.com/system1'
            },
            {
              valueSet: ['http://terminology.hl7.org/ValueSet/first']
            },
            {
              valueSet: ['http://terminology.hl7.org/ValueSet/second']
            }
          ]
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('http://terminology.hl7.org/ValueSet/first');
    });

    it('should handle undefined valueSet in include', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        compose: {
          include: [
            {
              system: 'http://example.com/system1'
            },
            {
              valueSet: undefined
            } as any
          ]
        }
      };

      const result = getValueSetUrlFromContained(valueSet);

      expect(result).toBe('');
    });
  });
});
