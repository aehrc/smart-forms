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

import type { Extension, Questionnaire } from 'fhir/r4';
import { 
  extractQuestionnaireLevelVariables,
  getFhirPathVariables,
  getXFhirQueryVariables
} from '../utils/questionnaireStoreUtils/extractVariables';

describe('extractVariables - Phase 5', () => {
  describe('extractQuestionnaireLevelVariables', () => {
    it('should return default variables structure when questionnaire has no extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(result).toEqual({
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      });
    });

    it('should return default variables structure when questionnaire has empty extensions array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: []
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(result).toEqual({
        fhirPathVariables: {
          'QuestionnaireLevel': []
        },
        xFhirQueryVariables: {}
      });
    });

    it('should extract FHIRPath variables from questionnaire extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'patient',
              language: 'text/fhirpath',
              expression: '%context.select(Patient)'
            }
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'age',
              language: 'text/fhirpath',
              expression: 'today() - %patient.birthDate'
            }
          }
        ]
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(2);
      expect(result.fhirPathVariables['QuestionnaireLevel']).toEqual([
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

    it('should extract x-fhir-query variables from questionnaire extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'observations',
              language: 'application/x-fhir-query',
              expression: 'Observation?patient={{%patient.id}}&category=vital-signs'
            }
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'medications',
              language: 'application/x-fhir-query',
              expression: 'MedicationRequest?patient={{%patient.id}}&status=active'
            }
          }
        ]
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(result.xFhirQueryVariables).toEqual({
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

    it('should extract both FHIRPath and x-fhir-query variables', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'patient',
              language: 'text/fhirpath',
              expression: '%context.select(Patient)'
            }
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'observations',
              language: 'application/x-fhir-query',
              expression: 'Observation?patient={{%patient.id}}'
            }
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'age',
              language: 'text/fhirpath',
              expression: 'today() - %patient.birthDate'
            }
          }
        ]
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(2);
      expect(result.xFhirQueryVariables).toHaveProperty('observations');
    });

    it('should skip non-variable extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueId: 'patient'
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'patient',
              language: 'text/fhirpath',
              expression: '%context.select(Patient)'
            }
          }
        ]
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(result.fhirPathVariables['QuestionnaireLevel']).toHaveLength(1);
      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(0);
    });

    it('should skip x-fhir-query variables without names', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              // no name property
              language: 'application/x-fhir-query',
              expression: 'Observation?patient={{%patient.id}}'
            }
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              name: 'valid-query',
              language: 'application/x-fhir-query',
              expression: 'MedicationRequest?patient={{%patient.id}}'
            }
          }
        ]
      };

      const result = extractQuestionnaireLevelVariables(questionnaire);

      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
      expect(result.xFhirQueryVariables).toHaveProperty('valid-query');
    });
  });

  describe('getFhirPathVariables', () => {
    it('should return empty array for empty extensions', () => {
      const extensions: Extension[] = [];

      const result = getFhirPathVariables(extensions);

      expect(result).toEqual([]);
    });

    it('should filter and extract FHIRPath variable expressions', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'age',
            language: 'text/fhirpath',
            expression: 'today() - %patient.birthDate'
          }
        }
      ];

      const result = getFhirPathVariables(extensions);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
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

    it('should exclude extensions with wrong URL', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        },
        {
          url: 'http://example.com/other-extension',
          valueExpression: {
            name: 'other',
            language: 'text/fhirpath',
            expression: 'some expression'
          }
        }
      ];

      const result = getFhirPathVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('patient');
    });

    it('should exclude extensions with wrong language', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'query',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient=123'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cql',
            language: 'text/cql',
            expression: 'some cql expression'
          }
        }
      ];

      const result = getFhirPathVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('patient');
    });

    it('should exclude extensions without valueExpression', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueString: 'some string value'
        }
      ];

      const result = getFhirPathVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('patient');
    });
  });

  describe('getXFhirQueryVariables', () => {
    it('should return empty array for empty extensions', () => {
      const extensions: Extension[] = [];

      const result = getXFhirQueryVariables(extensions);

      expect(result).toEqual([]);
    });

    it('should filter and extract x-fhir-query variable expressions', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}&category=vital-signs'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'medications',
            language: 'application/x-fhir-query',
            expression: 'MedicationRequest?patient={{%patient.id}}&status=active'
          }
        }
      ];

      const result = getXFhirQueryVariables(extensions);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          name: 'observations',
          language: 'application/x-fhir-query',
          expression: 'Observation?patient={{%patient.id}}&category=vital-signs'
        },
        {
          name: 'medications',
          language: 'application/x-fhir-query',
          expression: 'MedicationRequest?patient={{%patient.id}}&status=active'
        }
      ]);
    });

    it('should exclude extensions with wrong URL', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}'
          }
        },
        {
          url: 'http://example.com/other-extension',
          valueExpression: {
            name: 'other',
            language: 'application/x-fhir-query',
            expression: 'SomeResource?param=value'
          }
        }
      ];

      const result = getXFhirQueryVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('observations');
    });

    it('should exclude extensions with wrong language', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'patient',
            language: 'text/fhirpath',
            expression: '%context.select(Patient)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cql',
            language: 'text/cql',
            expression: 'some cql expression'
          }
        }
      ];

      const result = getXFhirQueryVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('observations');
    });

    it('should exclude extensions without valueExpression', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'observations',
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueString: 'some string value'
        }
      ];

      const result = getXFhirQueryVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('observations');
    });

    it('should handle expressions without names', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            language: 'application/x-fhir-query',
            expression: 'Observation?patient={{%patient.id}}'
            // no name property
          }
        }
      ];

      const result = getXFhirQueryVariables(extensions);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        language: 'application/x-fhir-query',
        expression: 'Observation?patient={{%patient.id}}'
      });
    });
  });
});
