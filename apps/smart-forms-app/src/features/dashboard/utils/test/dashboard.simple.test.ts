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

import type { Bundle, Questionnaire, QuestionnaireResponse, FhirResource } from 'fhir/r4';
import {
  createQuestionnaireTitle,
  filterQuestionnaires,
  filterResponses,
  getResponsesFromBundle,
  getReferencedQuestionnaire,
  constructBundle,
  createResponseSearchOption
} from '../dashboard';

describe('Dashboard Utils', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-123',
    status: 'active',
    title: 'test questionnaire',
    publisher: 'test publisher',
    date: '2024-01-01T00:00:00Z'
  };

  const mockQuestionnaireWithAssembleExpectation: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-sub',
    status: 'active',
    title: 'Sub questionnaire',
    extension: [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
        valueCode: 'assemble-child'
      }
    ]
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'response-123',
    status: 'completed',
    questionnaire: 'Questionnaire/questionnaire-123',
    authored: '2024-01-01T12:00:00Z',
    author: {
      display: 'test author'
    }
  };

  const mockBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: [
      { resource: mockQuestionnaire },
      { resource: mockQuestionnaireWithAssembleExpectation },
      { resource: mockQuestionnaireResponse }
    ]
  };

  describe('createQuestionnaireTitle', () => {
    it('should capitalize first letter of title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'test title'
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('Test title');
    });

    it('should return "Untitled" for questionnaire without title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('Untitled');
    });

    it('should handle empty title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: ''
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('Untitled');
    });

    it('should handle single character title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'a'
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('A');
    });
  });

  describe('filterQuestionnaires', () => {
    it('should return empty array for undefined bundle', () => {
      const result = filterQuestionnaires(undefined, false);
      expect(result).toEqual([]);
    });

    it('should return empty array for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = filterQuestionnaires(bundle, false);
      expect(result).toEqual([]);
    });

    it('should filter out non-questionnaire resources', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          { resource: mockQuestionnaire },
          { resource: mockQuestionnaireResponse },
          { resource: { resourceType: 'Patient', id: 'patient-1' } as unknown as FhirResource }
        ]
      };

      const result = filterQuestionnaires(bundle, false);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaire);
    });

    it('should exclude subquestionnaires when includeSubquestionnaires is false', () => {
      const result = filterQuestionnaires(mockBundle, false);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaire);
    });

    it('should include subquestionnaires when includeSubquestionnaires is true', () => {
      const result = filterQuestionnaires(mockBundle, true);
      expect(result).toHaveLength(2);
      expect(result).toContain(mockQuestionnaire);
      expect(result).toContain(mockQuestionnaireWithAssembleExpectation);
    });

    it('should handle bundle with empty entry array', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      };
      const result = filterQuestionnaires(bundle, false);
      expect(result).toEqual([]);
    });
  });

  describe('filterResponses', () => {
    it('should return empty array for undefined bundle', () => {
      const result = filterResponses(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = filterResponses(bundle);
      expect(result).toEqual([]);
    });

    it('should filter questionnaire responses from bundle', () => {
      const result = filterResponses(mockBundle);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaireResponse);
    });

    it('should exclude non-questionnaire-response resources', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          { resource: mockQuestionnaire },
          { resource: mockQuestionnaireResponse },
          { resource: { resourceType: 'Patient', id: 'patient-1' } as unknown as FhirResource }
        ]
      };

      const result = filterResponses(bundle);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaireResponse);
    });
  });

  describe('getResponsesFromBundle', () => {
    it('should return empty array for undefined bundle', () => {
      const result = getResponsesFromBundle(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = getResponsesFromBundle(bundle);
      expect(result).toEqual([]);
    });

    it('should extract questionnaire responses from bundle', () => {
      const result = getResponsesFromBundle(mockBundle);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaireResponse);
    });
  });

  describe('getReferencedQuestionnaire', () => {
    it('should return null for undefined resource', () => {
      const result = getReferencedQuestionnaire(undefined);
      expect(result).toBeNull();
    });

    it('should return questionnaire directly if resource is questionnaire', () => {
      const result = getReferencedQuestionnaire(mockQuestionnaire);
      expect(result).toBe(mockQuestionnaire);
    });

    it('should extract first questionnaire from bundle', () => {
      const result = getReferencedQuestionnaire(mockBundle);
      expect(result).toBe(mockQuestionnaire);
    });

    it('should return null for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = getReferencedQuestionnaire(bundle);
      expect(result).toBeNull();
    });

    it('should return null for bundle with empty entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      };
      const result = getReferencedQuestionnaire(bundle);
      expect(result).toBeNull();
    });
  });

  describe('constructBundle', () => {
    it('should create bundle from array of resources', () => {
      const resources: FhirResource[] = [mockQuestionnaire, mockQuestionnaireResponse];

      const result = constructBundle(resources);

      expect(result).toEqual({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: mockQuestionnaire }, { resource: mockQuestionnaireResponse }]
      });
    });

    it('should handle empty resources array', () => {
      const result = constructBundle([]);

      expect(result).toEqual({
        resourceType: 'Bundle',
        type: 'collection',
        entry: []
      });
    });
  });

  describe('createResponseSearchOption', () => {
    it('should return questionnaire title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active',
        title: 'Test Questionnaire'
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Test Questionnaire');
    });

    it('should return "Untitled" with ID for questionnaire without title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id-123',
        status: 'active'
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Untitled (test-id-123)');
    });

    it('should handle questionnaire with empty title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'empty-title-id',
        status: 'active',
        title: ''
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Untitled (empty-title-id)');
    });

    it('should handle questionnaire without ID', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: ''
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Untitled (undefined)');
    });
  });
});
