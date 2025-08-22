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

import type { QuestionnaireResponse } from 'fhir/r4';
import { getQuestionnaireNameFromResponse } from '../questionnaireName';

describe('questionnaireName', () => {
  describe('getQuestionnaireNameFromResponse', () => {
    it('should return capitalized name from display extension', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/display',
              valueString: 'patient demographics questionnaire'
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('Patient demographics questionnaire');
    });

    it('should handle single character name in display extension', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/display',
              valueString: 'a'
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('A');
    });

    it('should return response ID when display extension is empty string', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-123',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/display',
              valueString: ''
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('response-123');
    });

    it('should return response ID when display extension valueString is undefined', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-456',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/display'
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('response-456');
    });

    it('should return response ID when no display extension found', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-789',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/other-extension',
              valueString: 'some value'
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('response-789');
    });

    it('should return response ID when no extensions array', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-no-extensions',
        status: 'completed',
        _questionnaire: {}
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('response-no-extensions');
    });

    it('should return response ID when _questionnaire is undefined', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-no-questionnaire',
        status: 'completed'
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('response-no-questionnaire');
    });

    it('should return "Unnamed Response" when no ID and no display extension', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed'
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('Unnamed Response');
    });

    it('should handle empty extensions array', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-empty-extensions',
        status: 'completed',
        _questionnaire: {
          extension: []
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('response-empty-extensions');
    });

    it('should handle multiple extensions, only display extension should be used', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-multiple-extensions',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/other',
              valueString: 'other value'
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/display',
              valueString: 'medical history form'
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/another',
              valueString: 'another value'
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('Medical history form');
    });

    it('should preserve existing capitalization of rest of string', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        _questionnaire: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/display',
              valueString: 'patient Demographics Questionnaire'
            }
          ]
        }
      };

      const result = getQuestionnaireNameFromResponse(response);
      expect(result).toBe('Patient Demographics Questionnaire');
    });
  });
});
