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

import type { QuestionnaireItem } from 'fhir/r4';
import { getItemTextToDisplay } from '../../utils/itemTextToDisplay';

// Mock the extensions module
jest.mock('../../utils/extensions', () => ({
  isItemTextHidden: jest.fn()
}));

// Get the mocked function after the module is mocked
const { isItemTextHidden: mockIsItemTextHidden } = jest.requireMock('../../utils/extensions');

describe('getItemTextToDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsItemTextHidden.mockReturnValue(false);
  });

  describe('basic functionality', () => {
    it('should return text when qItem has text and is not hidden', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'What is your name?'
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('What is your name?');
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });

    it('should return null when qItem has no text', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
        // No text property
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).not.toHaveBeenCalled();
    });

    it('should return null when qItem text is empty string', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: ''
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).not.toHaveBeenCalled();
    });

    it('should return null when qItem text is undefined', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: undefined
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).not.toHaveBeenCalled();
    });
  });

  describe('hidden text handling', () => {
    it('should return null when text exists but isItemTextHidden returns true', () => {
      mockIsItemTextHidden.mockReturnValue(true);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Hidden question text'
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });

    it('should call isItemTextHidden with the correct qItem', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'specific-item',
        type: 'choice',
        text: 'Visible question',
        extension: [
          {
            url: 'http://example.com/extension',
            valueString: 'test'
          }
        ]
      };

      getItemTextToDisplay(qItem);

      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
      expect(mockIsItemTextHidden).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only text', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: '   '
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('   ');
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: longText
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe(longText);
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });

    it('should handle text with special characters', () => {
      const specialText = 'Question with special chars: @#$%^&*()[]{}|;:,.<>?';
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: specialText
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe(specialText);
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });

    it('should handle text with newlines and tabs', () => {
      const multilineText = 'Line 1\nLine 2\tTabbed content';
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: multilineText
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe(multilineText);
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });
  });

  describe('different qItem types', () => {
    it('should work with choice type items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'choice-item',
        type: 'choice',
        text: 'Select an option',
        answerOption: [{ valueString: 'Option 1' }, { valueString: 'Option 2' }]
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('Select an option');
    });

    it('should work with group type items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'group-item',
        type: 'group',
        text: 'Patient Information',
        item: []
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('Patient Information');
    });

    it('should work with display type items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'display-item',
        type: 'display',
        text: 'This is informational text'
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('This is informational text');
    });
  });

  describe('complex scenarios', () => {
    it('should handle qItem with extensions but text not hidden', () => {
      mockIsItemTextHidden.mockReturnValue(false);

      const qItem: QuestionnaireItem = {
        linkId: 'extended-item',
        type: 'string',
        text: 'Question with extensions',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/questionnaire-item-control',
                  code: 'text-box'
                }
              ]
            }
          }
        ]
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('Question with extensions');
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });

    it('should handle qItem with multiple properties', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'complex-item',
        type: 'string',
        text: 'Complex question',
        required: true,
        repeats: false,
        readOnly: false,
        prefix: '1.',
        initial: [{ valueString: 'default' }]
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBe('Complex question');
      expect(mockIsItemTextHidden).toHaveBeenCalledWith(qItem);
    });
  });

  describe('falsy text values', () => {
    it('should return null for null text', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: null as any
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).not.toHaveBeenCalled();
    });

    it('should return null for zero as text', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 0 as any
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).not.toHaveBeenCalled();
    });

    it('should return null for false as text', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: false as any
      };

      const result = getItemTextToDisplay(qItem);

      expect(result).toBeNull();
      expect(mockIsItemTextHidden).not.toHaveBeenCalled();
    });
  });
});
