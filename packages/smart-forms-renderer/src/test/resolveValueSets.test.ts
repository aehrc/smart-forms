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

import type { Coding, ValueSet } from 'fhir/r4';
import type { Variables } from '../interfaces/variables.interface';
import type { ValueSetPromise } from '../interfaces/valueSet.interface';
import { resolveValueSets } from '../utils/questionnaireStoreUtils/resolveValueSets';

// Mock the valueSet utility functions
jest.mock('../utils/valueSet', () => ({
  createValueSetToXFhirQueryVariableNameMap: jest.fn(),
  getValueSetCodings: jest.fn(),
  getValueSetPromise: jest.fn(),
  resolveValueSetPromises: jest.fn()
}));

import {
  createValueSetToXFhirQueryVariableNameMap,
  getValueSetCodings,
  getValueSetPromise,
  resolveValueSetPromises
} from '../utils/valueSet';

const mockCreateValueSetToXFhirQueryVariableNameMap =
  createValueSetToXFhirQueryVariableNameMap as jest.MockedFunction<
    typeof createValueSetToXFhirQueryVariableNameMap
  >;
const mockGetValueSetCodings = getValueSetCodings as jest.MockedFunction<typeof getValueSetCodings>;
const mockGetValueSetPromise = getValueSetPromise as jest.MockedFunction<typeof getValueSetPromise>;
const mockResolveValueSetPromises = resolveValueSetPromises as jest.MockedFunction<
  typeof resolveValueSetPromises
>;

describe('resolveValueSets - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveValueSets', () => {
    it('should return unchanged variables when no value set mapping exists', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: [
            {
              name: 'patient',
              language: 'text/fhirpath',
              expression: '%context.select(Patient)'
            }
          ]
        },
        xFhirQueryVariables: {}
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue({});
      mockResolveValueSetPromises.mockResolvedValue({});

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.variables).toBe(variables);
      expect(result.cachedValueSetCodings).toBe(cachedValueSetCodings);
      expect(mockCreateValueSetToXFhirQueryVariableNameMap).toHaveBeenCalledWith({});
    });

    it('should create value set promises for mapped variables', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {
          allergies: {
            valueExpression: {
              name: 'allergies',
              language: 'application/x-fhir-query',
              expression: 'AllergyIntolerance?patient={{%patient.id}}'
            }
          }
        }
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': 'allergies'
      };
      const mockPromise = Promise.resolve({
        resourceType: 'ValueSet',
        status: 'active',
        url: 'http://hl7.org/fhir/ValueSet/allergyintolerance-code'
      } as ValueSet);

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(mockPromise);
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: mockPromise,
          valueSet: {
            resourceType: 'ValueSet',
            status: 'active',
            url: 'http://hl7.org/fhir/ValueSet/allergyintolerance-code'
          } as ValueSet
        }
      });
      mockGetValueSetCodings.mockReturnValue([
        { system: 'http://snomed.info/sct', code: '123456', display: 'Test Allergy' }
      ]);

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(valueSetPromises).toEqual({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: mockPromise
        }
      });
      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code',
        'http://terminology.hl7.org/fhir'
      );
    });

    it('should update variables with resolved value sets', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {
          allergies: {
            valueExpression: {
              name: 'allergies',
              language: 'application/x-fhir-query',
              expression: 'AllergyIntolerance?patient={{%patient.id}}'
            }
          }
        }
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': 'allergies'
      };
      const resolvedValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'http://hl7.org/fhir/ValueSet/allergyintolerance-code'
      };
      const mockCodings = [
        { system: 'http://snomed.info/sct', code: '123456', display: 'Test Allergy' }
      ];
      const mockPromise = Promise.resolve(resolvedValueSet);

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(Promise.resolve(resolvedValueSet));
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: mockPromise,
          valueSet: resolvedValueSet
        }
      });
      mockGetValueSetCodings.mockReturnValue(mockCodings);

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.variables.xFhirQueryVariables['allergies']).toEqual({
        valueExpression: {
          name: 'allergies',
          language: 'application/x-fhir-query',
          expression: 'AllergyIntolerance?patient={{%patient.id}}'
        },
        result: resolvedValueSet
      });
      expect(result.cachedValueSetCodings).toEqual({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': mockCodings
      });
    });

    it('should handle multiple value sets', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {
          allergies: {
            valueExpression: {
              name: 'allergies',
              language: 'application/x-fhir-query',
              expression: 'AllergyIntolerance?patient={{%patient.id}}'
            }
          },
          medications: {
            valueExpression: {
              name: 'medications',
              language: 'application/x-fhir-query',
              expression: 'MedicationRequest?patient={{%patient.id}}'
            }
          }
        }
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': 'allergies',
        'http://hl7.org/fhir/ValueSet/medication-codes': 'medications'
      };
      const allergyValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'http://hl7.org/fhir/ValueSet/allergyintolerance-code'
      };
      const medicationValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'http://hl7.org/fhir/ValueSet/medication-codes'
      };

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(
        Promise.resolve({ resourceType: 'ValueSet', status: 'active' } as ValueSet)
      );
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: Promise.resolve(allergyValueSet),
          valueSet: allergyValueSet
        },
        'http://hl7.org/fhir/ValueSet/medication-codes': {
          promise: Promise.resolve(medicationValueSet),
          valueSet: medicationValueSet
        }
      });
      mockGetValueSetCodings
        .mockReturnValueOnce([
          { system: 'http://snomed.info/sct', code: '123456', display: 'Test Allergy' }
        ])
        .mockReturnValueOnce([
          { system: 'http://snomed.info/sct', code: '789012', display: 'Test Medication' }
        ]);

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.variables.xFhirQueryVariables['allergies'].result).toEqual(allergyValueSet);
      expect(result.variables.xFhirQueryVariables['medications'].result).toEqual(
        medicationValueSet
      );
      expect(Object.keys(result.cachedValueSetCodings)).toHaveLength(2);
    });

    it('should skip value sets that failed to resolve', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {
          allergies: {
            valueExpression: {
              name: 'allergies',
              language: 'application/x-fhir-query',
              expression: 'AllergyIntolerance?patient={{%patient.id}}'
            }
          }
        }
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': 'allergies'
      };

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(Promise.resolve(null as any));
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: Promise.resolve(null as any),
          valueSet: undefined
        }
      });

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.variables.xFhirQueryVariables['allergies']).toEqual({
        valueExpression: {
          name: 'allergies',
          language: 'application/x-fhir-query',
          expression: 'AllergyIntolerance?patient={{%patient.id}}'
        }
      });
      expect(result.cachedValueSetCodings).toEqual({});
    });

    it('should handle missing variable name in mapping', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {
          allergies: {
            valueExpression: {
              name: 'allergies',
              language: 'application/x-fhir-query',
              expression: 'AllergyIntolerance?patient={{%patient.id}}'
            }
          }
        }
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': null as any
      };
      const resolvedValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'http://hl7.org/fhir/ValueSet/allergyintolerance-code'
      };
      const mockPromise = Promise.resolve(resolvedValueSet);

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(Promise.resolve(resolvedValueSet));
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: mockPromise,
          valueSet: resolvedValueSet
        }
      });
      mockGetValueSetCodings.mockReturnValue([]);

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      // Variable should not be updated because variableName is null
      expect(result.variables.xFhirQueryVariables['allergies']).toEqual({
        valueExpression: {
          name: 'allergies',
          language: 'application/x-fhir-query',
          expression: 'AllergyIntolerance?patient={{%patient.id}}'
        }
      });
      // But codings should still be cached
      expect(result.cachedValueSetCodings).toEqual({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': []
      });
    });

    it('should handle missing variable in xFhirQueryVariables', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {}
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': 'nonexistent'
      };
      const resolvedValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        url: 'http://hl7.org/fhir/ValueSet/allergyintolerance-code'
      };
      const mockPromise = Promise.resolve(resolvedValueSet);

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(Promise.resolve(resolvedValueSet));
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: mockPromise,
          valueSet: resolvedValueSet
        }
      });
      mockGetValueSetCodings.mockReturnValue([]);

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.variables.xFhirQueryVariables).toEqual({});
      expect(result.cachedValueSetCodings).toEqual({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': []
      });
    });

    it('should preserve existing cached codings', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {}
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {
        'existing-vs': [{ system: 'http://example.com', code: 'existing', display: 'Existing' }]
      };

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue({});
      mockResolveValueSetPromises.mockResolvedValue({});

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.cachedValueSetCodings).toEqual({
        'existing-vs': [{ system: 'http://example.com', code: 'existing', display: 'Existing' }]
      });
    });

    it('should handle resolved promises with undefined valueSet', async () => {
      const variables: Variables = {
        fhirPathVariables: {
          QuestionnaireLevel: []
        },
        xFhirQueryVariables: {
          allergies: {
            valueExpression: {
              name: 'allergies',
              language: 'application/x-fhir-query',
              expression: 'AllergyIntolerance?patient={{%patient.id}}'
            }
          }
        }
      };
      const valueSetPromises: Record<string, ValueSetPromise> = {};
      const cachedValueSetCodings: Record<string, Coding[]> = {};

      const valueSetMapping = {
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': 'allergies'
      };

      mockCreateValueSetToXFhirQueryVariableNameMap.mockReturnValue(valueSetMapping);
      mockGetValueSetPromise.mockReturnValue(Promise.resolve(undefined as any));
      mockResolveValueSetPromises.mockResolvedValue({
        'http://hl7.org/fhir/ValueSet/allergyintolerance-code': {
          promise: Promise.resolve(undefined as any),
          valueSet: undefined
        }
      });

      const result = await resolveValueSets(
        variables,
        valueSetPromises,
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.variables.xFhirQueryVariables['allergies']).toEqual({
        valueExpression: {
          name: 'allergies',
          language: 'application/x-fhir-query',
          expression: 'AllergyIntolerance?patient={{%patient.id}}'
        }
      });
      expect(result.cachedValueSetCodings).toEqual({});
    });
  });
});
