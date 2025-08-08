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

import { describe, expect, test, jest } from '@jest/globals';
import {
  updateOpenLabelAnswer,
  getOldOpenLabelAnswer,
  getOpenChoiceControlType,
  getAnswerOptionLabel
} from '../utils/openChoice';
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { OpenChoiceItemControl } from '../interfaces/choice.enum';

// Mock dependencies
jest.mock('../utils/extensions', () => ({
  isSpecificItemControl: jest.fn((qItem: any, control: string) => {
    // Mock implementation based on test scenarios
    if (qItem.extension) {
      return qItem.extension.some((ext: any) => 
        ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
        ext.valueCoding?.code === control
      );
    }
    return false;
  })
}));

describe('openChoice utils', () => {
  describe('updateOpenLabelAnswer', () => {
    const mockOldQrItem: QuestionnaireResponseItem = {
      linkId: 'test-item',
      text: 'Test Item',
      answer: [
        { valueString: 'existing answer' }
      ]
    };

    const mockOptions: QuestionnaireItemAnswerOption[] = [
      { valueString: 'option1' },
      { valueString: 'option2' },
      { valueCoding: { code: 'code1', display: 'Code 1' } }
    ];

    describe('single selection mode', () => {
      test('should return empty answer when open label is unchecked', () => {
        const result = updateOpenLabelAnswer(
          false, // openLabelChecked
          'test value',
          [{ valueString: 'test value' }],
          mockOptions,
          mockOldQrItem,
          false, // isMultiSelection
          undefined
        );

        expect(result.answer).toEqual([]);
      });

      test('should return new open label answer when checked', () => {
        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'new open value',
          [],
          mockOptions,
          mockOldQrItem,
          false, // isMultiSelection
          'answer-key-1'
        );

        expect(result.answer).toHaveLength(1);
        expect(result.answer?.[0].valueString).toBe('new open value');
        expect(result.answer?.[0].id).toBe('answer-key-1');
      });

      test('should replace existing answer in single selection', () => {
        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'replacement value',
          [{ valueString: 'old value' }],
          mockOptions,
          mockOldQrItem,
          false, // isMultiSelection
          undefined
        );

        expect(result.answer).toHaveLength(1);
        expect(result.answer?.[0].valueString).toBe('replacement value');
      });
    });

    describe('multi selection mode', () => {
      test('should remove matching open label answer when unchecked', () => {
        const answers = [
          { valueString: 'option1' },
          { valueString: 'open value' },
          { valueString: 'option2' }
        ];

        const result = updateOpenLabelAnswer(
          false, // openLabelChecked
          'open value',
          answers,
          mockOptions,
          mockOldQrItem,
          true, // isMultiSelection
          'answer-key'
        );

        expect(result.answer).toHaveLength(2);
        expect(result.answer?.find(a => a.valueString === 'open value')).toBeUndefined();
        expect(result.answer?.every(a => a.id === 'answer-key')).toBe(true);
      });

      test('should remove last matching answer when multiple matches exist', () => {
        const answers = [
          { valueString: 'duplicate' },
          { valueString: 'other' },
          { valueString: 'duplicate' }
        ];

        const result = updateOpenLabelAnswer(
          false, // openLabelChecked
          'duplicate',
          answers,
          mockOptions,
          mockOldQrItem,
          true, // isMultiSelection
          undefined
        );

        expect(result.answer).toHaveLength(2);
        expect(result.answer?.[0].valueString).toBe('duplicate');
        expect(result.answer?.[1].valueString).toBe('other');
      });

      test('should return unchanged item when no matches found for removal', () => {
        const answers = [{ valueString: 'existing' }];

        const result = updateOpenLabelAnswer(
          false, // openLabelChecked
          'non-existent',
          answers,
          mockOptions,
          mockOldQrItem,
          true, // isMultiSelection
          undefined
        );

        expect(result).toBe(mockOldQrItem);
      });

      test('should add new open label answer when no existing open answer', () => {
        const answers = [{ valueString: 'option1' }];

        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'new open value',
          answers,
          mockOptions,
          mockOldQrItem,
          true, // isMultiSelection
          'answer-key'
        );

        expect(result.answer).toHaveLength(2);
        expect(result.answer?.[0].valueString).toBe('option1');
        expect(result.answer?.[1].valueString).toBe('new open value');
        expect(result.answer?.every(a => a.id === 'answer-key')).toBe(true);
      });

      test('should return unchanged when old and new open answers are equal', () => {
        // Mock getOldOpenLabelAnswer to return existing open answer
        const answers = [
          { valueString: 'option1' },
          { valueString: 'existing open' } // This will be found as open answer
        ];

        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'existing open', // Same value
          answers,
          mockOptions,
          mockOldQrItem,
          true, // isMultiSelection
          undefined
        );

        expect(result).toBe(mockOldQrItem);
      });

      test('should update existing open answer when different from new', () => {
        // Create answers with an open label answer (not in options)
        const answers = [
          { valueString: 'option1' },
          { valueString: 'old open value' } // This should be the open answer
        ];

        const qrItemWithAnswers = {
          ...mockOldQrItem,
          answer: answers
        };

        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'new open value',
          answers,
          mockOptions,
          qrItemWithAnswers,
          true, // isMultiSelection
          undefined
        );

        expect(result.answer).toBeDefined();
        expect(result).not.toBe(mockOldQrItem);
      });

      test('should handle empty answers array', () => {
        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'new value',
          [],
          mockOptions,
          mockOldQrItem,
          true, // isMultiSelection
          'key'
        );

        expect(result.answer).toHaveLength(1);
        expect(result.answer?.[0].valueString).toBe('new value');
        expect(result.answer?.[0].id).toBe('key');
      });

      test('should handle empty options array', () => {
        const answers = [{ valueString: 'some value' }];

        const result = updateOpenLabelAnswer(
          true, // openLabelChecked
          'new open',
          answers,
          [],
          mockOldQrItem,
          true, // isMultiSelection
          undefined
        );

        // When options array is empty, existing answer is treated as open label
        // and gets updated rather than adding a new one
        expect(result.answer).toBeDefined();
        expect(result).not.toBe(mockOldQrItem);
      });
    });
  });

  describe('getOldOpenLabelAnswer', () => {
    test('should return answer that is not in options (outlier)', () => {
      const answers = [
        { valueString: 'option1' },
        { valueString: 'open answer' },
        { valueString: 'option2' }
      ];

      const options = [
        { valueString: 'option1' },
        { valueString: 'option2' }
      ];

      const result = getOldOpenLabelAnswer(answers, options);

      expect(result).toEqual({ valueString: 'open answer' });
    });

    test('should return null when all answers are in options', () => {
      const answers = [
        { valueString: 'option1' },
        { valueString: 'option2' }
      ];

      const options = [
        { valueString: 'option1' },
        { valueString: 'option2' }
      ];

      const result = getOldOpenLabelAnswer(answers, options);

      expect(result).toBeNull();
    });

    test('should return first outlier when multiple exist', () => {
      const answers = [
        { valueString: 'option1' },
        { valueString: 'open1' },
        { valueString: 'open2' }
      ];

      const options = [
        { valueString: 'option1' }
      ];

      const result = getOldOpenLabelAnswer(answers, options);

      expect(result).toEqual({ valueString: 'open1' });
    });

    test('should handle answers with id property', () => {
      const answers = [
        { valueString: 'option1', id: 'id1' },
        { valueString: 'open answer', id: 'id2' }
      ];

      const options = [
        { valueString: 'option1' }
      ];

      const result = getOldOpenLabelAnswer(answers, options);

      expect(result).toEqual({ valueString: 'open answer' });
      expect(result).not.toHaveProperty('id');
    });

    test('should handle empty answers array', () => {
      const result = getOldOpenLabelAnswer([], [{ valueString: 'option1' }]);

      expect(result).toBeNull();
    });

    test('should handle empty options array', () => {
      const answers = [{ valueString: 'some value' }];
      const result = getOldOpenLabelAnswer(answers, []);

      expect(result).toEqual({ valueString: 'some value' });
    });

    test('should handle complex answer and option types', () => {
      const answers = [
        { valueCoding: { code: 'code1', display: 'Display 1' } },
        { valueString: 'open text' },
        { valueInteger: 42 }
      ];

      const options = [
        { valueCoding: { code: 'code1', display: 'Display 1' } },
        { valueInteger: 42 }
      ];

      const result = getOldOpenLabelAnswer(answers, options);

      expect(result).toEqual({ valueString: 'open text' });
    });
  });

  describe('getOpenChoiceControlType', () => {
    test('should return Autocomplete when itemControl is autocomplete', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'open-choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCoding: { code: 'autocomplete' }
          }
        ]
      };

      const result = getOpenChoiceControlType(qItem);

      expect(result).toBe(OpenChoiceItemControl.Autocomplete);
    });

    test('should return Checkbox when itemControl is check-box', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'open-choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCoding: { code: 'check-box' }
          }
        ]
      };

      const result = getOpenChoiceControlType(qItem);

      expect(result).toBe(OpenChoiceItemControl.Checkbox);
    });

    test('should return Radio when itemControl is radio-button', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'open-choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCoding: { code: 'radio-button' }
          }
        ]
      };

      const result = getOpenChoiceControlType(qItem);

      expect(result).toBe(OpenChoiceItemControl.Radio);
    });

    test('should return Select as default when no specific control', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'open-choice'
      };

      const result = getOpenChoiceControlType(qItem);

      expect(result).toBe(OpenChoiceItemControl.Select);
    });

    test('should return Select when itemControl is unrecognized', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'open-choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCoding: { code: 'unknown-control' }
          }
        ]
      };

      const result = getOpenChoiceControlType(qItem);

      expect(result).toBe(OpenChoiceItemControl.Select);
    });

    test('should handle item with other extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test',
        type: 'open-choice',
        extension: [
          {
            url: 'http://example.com/other-extension',
            valueString: 'other value'
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCoding: { code: 'autocomplete' }
          }
        ]
      };

      const result = getOpenChoiceControlType(qItem);

      expect(result).toBe(OpenChoiceItemControl.Autocomplete);
    });
  });

  describe('getAnswerOptionLabel', () => {
    test('should return string option as-is', () => {
      const result = getAnswerOptionLabel('simple string');

      expect(result).toBe('simple string');
    });

    test('should return valueCoding display when available', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueCoding: {
          code: 'test-code',
          display: 'Test Display'
        }
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('Test Display');
    });

    test('should return valueCoding code when display is missing', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueCoding: {
          code: 'test-code'
        }
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('test-code');
    });

    test('should return valueString when present', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueString: 'string value'
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('string value');
    });

    test('should return valueInteger as string when present', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueInteger: 42
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('42');
    });

    test('should return empty string for unrecognized option type', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueBoolean: true
      } as any;

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('');
    });

    test('should prioritize valueCoding over other properties', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueCoding: {
          code: 'code',
          display: 'Display'
        },
        valueString: 'string value',
        valueInteger: 123
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('Display');
    });

    test('should use valueString when valueCoding is absent', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueString: 'string value',
        valueInteger: 123
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('string value');
    });

    test('should handle empty or undefined option properties', () => {
      const option: QuestionnaireItemAnswerOption = {};

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('');
    });

    test('should handle valueCoding with empty code and display', () => {
      const option: QuestionnaireItemAnswerOption = {
        valueCoding: {}
      };

      const result = getAnswerOptionLabel(option);

      expect(result).toBe('undefined');
    });
  });
});
