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

import type { Questionnaire } from 'fhir/r4';
import { extractLaunchContexts } from '../utils/questionnaireStoreUtils/extractLaunchContext';

describe('extractLaunchContext - Phase 5', () => {
  describe('extractLaunchContexts', () => {
    it('should return empty object when questionnaire has no extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({});
    });

    it('should return empty object when questionnaire has empty extensions array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: []
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({});
    });

    it('should extract launch context with valueId name', () => {
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
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({
        patient: {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
          extension: [
            {
              url: 'name',
              valueId: 'patient'
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        }
      });
    });

    it('should extract launch context with valueCoding name', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: {
                  system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
                  code: 'encounter'
                }
              },
              {
                url: 'type',
                valueCode: 'Encounter'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({
        encounter: {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
          extension: [
            {
              url: 'name',
              valueCoding: {
                system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
                code: 'encounter'
              }
            },
            {
              url: 'type',
              valueCode: 'Encounter'
            }
          ]
        }
      });
    });

    it('should extract multiple launch contexts', () => {
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
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: {
                  code: 'user'
                }
              },
              {
                url: 'type',
                valueCode: 'Practitioner'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toHaveProperty('patient');
      expect(result).toHaveProperty('user');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should skip non-launch-context extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/variable',
            valueExpression: {
              language: 'text/fhirpath',
              expression: '%patient'
            }
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueId: 'patient'
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({
        patient: expect.objectContaining({
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
        })
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should skip launch contexts without valid names', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name'
                // no valueId or valueCoding
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: {
                  // no code property
                }
              },
              {
                url: 'type',
                valueCode: 'Practitioner'
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueId: 'valid-patient'
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({
        'valid-patient': expect.objectContaining({
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
        })
      });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should handle launch context with valueCoding that has no code', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: {
                  system: 'http://example.com',
                  display: 'Patient Context'
                  // no code
                }
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toEqual({});
    });

    it('should prefer valueId over valueCoding when both exist', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueId: 'patient-id',
                valueCoding: {
                  code: 'patient-coding'
                }
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toHaveProperty('patient-id');
      expect(result).not.toHaveProperty('patient-coding');
    });

    it('should handle various launch context types', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: { code: 'patient' }
              },
              {
                url: 'type',
                valueCode: 'Patient'
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: { code: 'encounter' }
              },
              {
                url: 'type',
                valueCode: 'Encounter'
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              {
                url: 'name',
                valueCoding: { code: 'user' }
              },
              {
                url: 'type',
                valueCode: 'Practitioner'
              }
            ]
          }
        ]
      };

      const result = extractLaunchContexts(questionnaire);

      expect(result).toHaveProperty('patient');
      expect(result).toHaveProperty('encounter');
      expect(result).toHaveProperty('user');
      expect(Object.keys(result)).toHaveLength(3);
    });
  });
});
