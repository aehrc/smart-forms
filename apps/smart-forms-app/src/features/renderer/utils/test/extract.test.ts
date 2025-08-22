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
import { getExtractMechanism, type ExtractMechanism } from '../extract';

// Mock the external dependencies
jest.mock('@aehrc/sdc-template-extract', () => ({
  canBeTemplateExtracted: jest.fn()
}));

jest.mock('@aehrc/smart-forms-renderer', () => ({
  canBeObservationExtracted: jest.fn()
}));

import { canBeTemplateExtracted } from '@aehrc/sdc-template-extract';
import { canBeObservationExtracted } from '@aehrc/smart-forms-renderer';

const mockCanBeTemplateExtracted = canBeTemplateExtracted as jest.MockedFunction<
  typeof canBeTemplateExtracted
>;
const mockCanBeObservationExtracted = canBeObservationExtracted as jest.MockedFunction<
  typeof canBeObservationExtracted
>;

describe('extract utilities', () => {
  beforeEach(() => {
    mockCanBeTemplateExtracted.mockClear();
    mockCanBeObservationExtracted.mockClear();
  });

  describe('getExtractMechanism', () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      id: 'test-questionnaire'
    };

    it('should return "template-based" when questionnaire can be template extracted', () => {
      mockCanBeTemplateExtracted.mockReturnValue(true);
      mockCanBeObservationExtracted.mockReturnValue(false);

      const result = getExtractMechanism(mockQuestionnaire);

      expect(result).toBe('template-based');
      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(mockQuestionnaire);
      expect(mockCanBeObservationExtracted).not.toHaveBeenCalled(); // Should short-circuit
    });

    it('should return "observation-based" when questionnaire can be observation extracted but not template extracted', () => {
      mockCanBeTemplateExtracted.mockReturnValue(false);
      mockCanBeObservationExtracted.mockReturnValue(true);

      const result = getExtractMechanism(mockQuestionnaire);

      expect(result).toBe('observation-based');
      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(mockQuestionnaire);
      expect(mockCanBeObservationExtracted).toHaveBeenCalledWith(mockQuestionnaire);
    });

    it('should return null when questionnaire cannot be extracted by either method', () => {
      mockCanBeTemplateExtracted.mockReturnValue(false);
      mockCanBeObservationExtracted.mockReturnValue(false);

      const result = getExtractMechanism(mockQuestionnaire);

      expect(result).toBeNull();
      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(mockQuestionnaire);
      expect(mockCanBeObservationExtracted).toHaveBeenCalledWith(mockQuestionnaire);
    });

    it('should prioritize template-based over observation-based when both are possible', () => {
      mockCanBeTemplateExtracted.mockReturnValue(true);
      mockCanBeObservationExtracted.mockReturnValue(true);

      const result = getExtractMechanism(mockQuestionnaire);

      expect(result).toBe('template-based');
      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(mockQuestionnaire);
      expect(mockCanBeObservationExtracted).not.toHaveBeenCalled(); // Should short-circuit
    });

    it('should handle questionnaire with minimal properties', () => {
      const minimalQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      mockCanBeTemplateExtracted.mockReturnValue(false);
      mockCanBeObservationExtracted.mockReturnValue(false);

      const result = getExtractMechanism(minimalQuestionnaire);

      expect(result).toBeNull();
      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(minimalQuestionnaire);
      expect(mockCanBeObservationExtracted).toHaveBeenCalledWith(minimalQuestionnaire);
    });

    it('should handle questionnaire with complex properties', () => {
      const complexQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'complex-questionnaire',
        status: 'active',
        title: 'Complex Test Questionnaire',
        date: '2024-01-01',
        publisher: 'Test Publisher',
        item: [
          {
            linkId: '1',
            text: 'Test question',
            type: 'string'
          }
        ]
      };

      mockCanBeTemplateExtracted.mockReturnValue(true);
      mockCanBeObservationExtracted.mockReturnValue(false);

      const result = getExtractMechanism(complexQuestionnaire);

      expect(result).toBe('template-based');
      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(complexQuestionnaire);
    });

    it('should call functions with exact questionnaire object', () => {
      const specificQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        id: 'specific-test'
      };

      mockCanBeTemplateExtracted.mockReturnValue(false);
      mockCanBeObservationExtracted.mockReturnValue(true);

      getExtractMechanism(specificQuestionnaire);

      expect(mockCanBeTemplateExtracted).toHaveBeenCalledWith(specificQuestionnaire);
      expect(mockCanBeObservationExtracted).toHaveBeenCalledWith(specificQuestionnaire);
    });

    it('should handle multiple calls with different questionnaires', () => {
      const questionnaire1: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        id: 'q1'
      };

      const questionnaire2: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        id: 'q2'
      };

      // First call - template extraction
      mockCanBeTemplateExtracted.mockReturnValueOnce(true);
      const result1 = getExtractMechanism(questionnaire1);
      expect(result1).toBe('template-based');

      // Second call - observation extraction
      mockCanBeTemplateExtracted.mockReturnValueOnce(false);
      mockCanBeObservationExtracted.mockReturnValueOnce(true);
      const result2 = getExtractMechanism(questionnaire2);
      expect(result2).toBe('observation-based');

      expect(mockCanBeTemplateExtracted).toHaveBeenCalledTimes(2);
      expect(mockCanBeObservationExtracted).toHaveBeenCalledTimes(1);
    });

    it('should return correct TypeScript types', () => {
      mockCanBeTemplateExtracted.mockReturnValue(true);

      const result: ExtractMechanism = getExtractMechanism(mockQuestionnaire);

      // TypeScript should accept all valid ExtractMechanism values
      const validValues: ExtractMechanism[] = ['template-based', 'observation-based', null];
      expect(validValues).toContain(result);
    });
  });
});
