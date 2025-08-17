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

import type { Extension } from 'fhir/r4';
import type { Variables } from '../interfaces/variables.interface';
import { addAdditionalVariables } from '../utils/questionnaireStoreUtils/addAdditionalVariables';

describe('addAdditionalVariables - Phase 5', () => {
  describe('addAdditionalVariables', () => {
    it('should return unchanged variables when no additional variables provided', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': [
            {
              name: 'existing',
              language: 'text/fhirpath',
              expression: 'existing expression'
            }
          ]
        },
        xFhirQueryVariables: {}
      };

      const result = addAdditionalVariables(existingVariables, {});

      expect(result).toBe(existingVariables); // same reference
      expect(result).toEqual({
        fhirPathVariables: {
          'QuestionnaireLevel': [
            {
              name: 'existing',
              language: 'text/fhirpath',
              expression: 'existing expression'
            }
          ]
        },
        xFhirQueryVariables: {}
      });
    });

    it('should add FHIRPath variables to existing variables', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': [
            {
              name: 'existing',
              language: 'text/fhirpath',
              expression: 'existing expression'
            }
          ]
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'var1': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        } as Extension,
        'var2': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'age',
            language: 'text/fhirpath',
            expression: 'today() - %patient.birthDate'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result).toBe(existingVariables);
      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(3);
      expect(result.fhirPathVariables['QuestionnaireLevel']).toEqual([
        {
          name: 'existing',
          language: 'text/fhirpath',
          expression: 'existing expression'
        },
        {
          name: 'patient',
          language: 'text/fhirpath',
          expression: '%context.select(Patient)'
        },
        {
          name: 'age',
          language: 'text/fhirpath',
          expression: 'today() - %patient.birthDate'
        }
      ]);
    });

    it('should add x-fhir-query variables to existing variables', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {
          'existing': {
            valueExpression: {
              name: 'existing',
              language: 'application/x-fhir-query',
              expression: 'existing query'
            }
          }
        }
      };

      const additionalVariables: Record<string, object> = {
        'query1': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}&category=vital-signs'
          }
        } as Extension,
        'query2': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'medications',
            language: 'application/x-fhir-query',
            expression: 'MedicationRequest?patient={{%patient.id}}&status=active'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result).toBe(existingVariables);
      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(3);
      expect(result.xFhirQueryVariables).toEqual({
        'existing': {
          valueExpression: {
            name: 'existing',
            language: 'application/x-fhir-query',
            expression: 'existing query'
          }
        },
        'observations': {
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}&category=vital-signs'
          }
        },
        'medications': {
          valueExpression: {
            name: 'medications',
            language: 'application/x-fhir-query',
            expression: 'MedicationRequest?patient={{%patient.id}}&status=active'
          }
        }
      });
    });

    it('should add both FHIRPath and x-fhir-query variables', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'fhirpath1': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        } as Extension,
        'query1': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('patient');
      expect(result.xFhirQueryVariables['observations']).toBeDefined();
    });

    it('should skip variables that are not Extension objects with correct URL', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'invalid1': {
          url: 'http://example.com/other-extension',
          valueExpression: {
            name: 'invalid',
            language: 'text/fhirpath',
            expression: 'invalid expression'
          }
        } as Extension,
        'invalid2': {
          valueExpression: {
            name: 'no-url',
            language: 'text/fhirpath',
            expression: 'no url expression'
          }
        } as Extension,
        'valid': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'valid',
            language: 'text/fhirpath',
            expression: 'valid expression'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('valid');
    });

    it('should skip variables with missing valueExpression', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'no-expression': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable'
          // no valueExpression
        } as Extension,
        'valid': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'valid',
            language: 'text/fhirpath',
            expression: 'valid expression'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('valid');
    });

    it('should skip variables with missing name in valueExpression', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'no-name': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'expression without name'
          }
        } as Extension,
        'valid': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'valid',
            language: 'text/fhirpath',
            expression: 'valid expression'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('valid');
    });

    it('should skip variables with missing language in valueExpression', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'no-language': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'no-language',
            expression: 'expression without language'
          }
        } as Extension,
        'valid': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'valid',
            language: 'text/fhirpath',
            expression: 'valid expression'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('valid');
    });

    it('should skip variables with unsupported language', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'unsupported': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'unsupported',
            language: 'text/cql',
            expression: 'CQL expression'
          }
        } as Extension,
        'valid': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'valid',
            language: 'text/fhirpath',
            expression: 'valid expression'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('valid');
    });

    it('should handle null and undefined variables', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'null-var': null as any,
        'undefined-var': undefined as any,
        'valid': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'valid',
            language: 'text/fhirpath',
            expression: 'valid expression'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(result.fhirPathVariables['QuestionnaireLevel'][0].name).toBe('valid');
    });

    it('should handle special case where x-fhir-query language is valid without correct URL', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      };

      const additionalVariables: Record<string, object> = {
        'special-case': {
          url: 'http://example.com/other-url',
          valueExpression: {
            name: 'special',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient=123'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
      expect(result.xFhirQueryVariables['special']).toBeDefined();
    });

    it('should overwrite x-fhir-query variables with same name', () => {
      const existingVariables: Variables = {
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {
          'observations': {
            valueExpression: {
              name: 'observations',
              language: 'application/x-fhir-query',
              expression: 'original query'
            }
          }
        }
      };

      const additionalVariables: Record<string, object> = {
        'new-var': {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'new query'
          }
        } as Extension
      };

      const result = addAdditionalVariables(existingVariables, additionalVariables);

      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
      expect(result.xFhirQueryVariables['observations'].valueExpression.expression).toBe('new query');
    });
  });
});
