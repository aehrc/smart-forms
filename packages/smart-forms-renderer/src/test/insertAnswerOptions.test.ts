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

import type { Questionnaire, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { insertCompleteAnswerOptionsIntoQuestionnaire } from '../utils/questionnaireStoreUtils/insertAnswerOptions';

describe('insertAnswerOptions - Phase 5', () => {
  describe('insertCompleteAnswerOptionsIntoQuestionnaire', () => {
    it('should return questionnaire unchanged when it has no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };
      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item1': [
          { valueString: 'Option 1' },
          { valueString: 'Option 2' }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire); // same reference
      expect(result).toEqual({
        resourceType: 'Questionnaire',
        status: 'active'
      });
    });

    it('should return questionnaire unchanged when it has empty items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };
      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item1': [
          { valueString: 'Option 1' }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item).toEqual([]);
    });

    it('should insert answer options for top-level items with matching linkIds', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'choice',
            text: 'Question 1',
            answerOption: [
              { valueString: 'Original Option 1' }
            ]
          },
          {
            linkId: 'item2',
            type: 'choice',
            text: 'Question 2',
            answerOption: [
              { valueString: 'Original Option 2' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item1': [
          { valueString: 'New Option 1' },
          { valueString: 'New Option 2' }
        ],
        'item2': [
          { valueString: 'New Option A' },
          { valueString: 'New Option B' },
          { valueString: 'New Option C' }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].answerOption).toEqual([
        { valueString: 'New Option 1' },
        { valueString: 'New Option 2' }
      ]);
      expect(result.item![1].answerOption).toEqual([
        { valueString: 'New Option A' },
        { valueString: 'New Option B' },
        { valueString: 'New Option C' }
      ]);
    });

    it('should leave items unchanged when no matching complete answer options exist', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'choice',
            text: 'Question 1',
            answerOption: [
              { valueString: 'Original Option 1' }
            ]
          },
          {
            linkId: 'item2',
            type: 'choice',
            text: 'Question 2',
            answerOption: [
              { valueString: 'Original Option 2' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item3': [
          { valueString: 'New Option 1' }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].answerOption).toEqual([
        { valueString: 'Original Option 1' }
      ]);
      expect(result.item![1].answerOption).toEqual([
        { valueString: 'Original Option 2' }
      ]);
    });

    it('should skip items that do not have answerOption property', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1 (no answerOption)'
          },
          {
            linkId: 'item2',
            type: 'choice',
            text: 'Question 2',
            answerOption: [
              { valueString: 'Original Option 2' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item1': [
          { valueString: 'New Option 1' }
        ],
        'item2': [
          { valueString: 'New Option 2' }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0]).not.toHaveProperty('answerOption');
      expect(result.item![1].answerOption).toEqual([
        { valueString: 'New Option 2' }
      ]);
    });

    it('should handle nested items recursively', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Group 1',
            item: [
              {
                linkId: 'nested1',
                type: 'choice',
                text: 'Nested Question 1',
                answerOption: [
                  { valueString: 'Original Nested Option 1' }
                ]
              },
              {
                linkId: 'nested-group',
                type: 'group',
                text: 'Nested Group',
                item: [
                  {
                    linkId: 'deeply-nested',
                    type: 'choice',
                    text: 'Deeply Nested Question',
                    answerOption: [
                      { valueString: 'Original Deep Option' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            linkId: 'top-level',
            type: 'choice',
            text: 'Top Level Question',
            answerOption: [
              { valueString: 'Original Top Option' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'nested1': [
          { valueString: 'New Nested Option 1' },
          { valueString: 'New Nested Option 2' }
        ],
        'deeply-nested': [
          { valueString: 'New Deep Option A' },
          { valueString: 'New Deep Option B' }
        ],
        'top-level': [
          { valueString: 'New Top Option' }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].item![0].answerOption).toEqual([
        { valueString: 'New Nested Option 1' },
        { valueString: 'New Nested Option 2' }
      ]);
      expect(result.item![0].item![1].item![0].answerOption).toEqual([
        { valueString: 'New Deep Option A' },
        { valueString: 'New Deep Option B' }
      ]);
      expect(result.item![1].answerOption).toEqual([
        { valueString: 'New Top Option' }
      ]);
    });

    it('should handle items with complex answer options', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'complex-item',
            type: 'choice',
            text: 'Complex Question',
            answerOption: [
              {
                valueCoding: {
                  system: 'http://example.com/codes',
                  code: 'original-code',
                  display: 'Original Code'
                }
              }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'complex-item': [
          {
            valueCoding: {
              system: 'http://example.com/codes',
              code: 'new-code-1',
              display: 'New Code 1'
            }
          },
          {
            valueCoding: {
              system: 'http://example.com/codes',
              code: 'new-code-2',
              display: 'New Code 2'
            }
          },
          {
            valueString: 'Text Option'
          },
          {
            valueInteger: 42
          }
        ]
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].answerOption).toEqual([
        {
          valueCoding: {
            system: 'http://example.com/codes',
            code: 'new-code-1',
            display: 'New Code 1'
          }
        },
        {
          valueCoding: {
            system: 'http://example.com/codes',
            code: 'new-code-2',
            display: 'New Code 2'
          }
        },
        {
          valueString: 'Text Option'
        },
        {
          valueInteger: 42
        }
      ]);
    });

    it('should handle empty complete answer options', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'choice',
            text: 'Question 1',
            answerOption: [
              { valueString: 'Original Option' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {};

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].answerOption).toEqual([
        { valueString: 'Original Option' }
      ]);
    });

    it('should handle items where complete answer options exist but are empty arrays', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'choice',
            text: 'Question 1',
            answerOption: [
              { valueString: 'Original Option' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item1': []
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].answerOption).toEqual([]);
    });

    it('should handle mixed scenarios: some items updated, others left unchanged', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'choice',
            text: 'Question 1',
            answerOption: [
              { valueString: 'Original 1' }
            ]
          },
          {
            linkId: 'item2',
            type: 'string',
            text: 'Question 2 (no answerOption)'
          },
          {
            linkId: 'item3',
            type: 'choice',
            text: 'Question 3',
            answerOption: [
              { valueString: 'Original 3' }
            ]
          },
          {
            linkId: 'item4',
            type: 'choice',
            text: 'Question 4',
            answerOption: [
              { valueString: 'Original 4' }
            ]
          }
        ]
      };

      const completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {
        'item1': [
          { valueString: 'New Option 1' }
        ],
        'item2': [
          { valueString: 'Ignored Option' }
        ],
        'item4': [
          { valueString: 'New Option 4A' },
          { valueString: 'New Option 4B' }
        ]
        // item3 not included, should remain unchanged
      };

      const result = insertCompleteAnswerOptionsIntoQuestionnaire(questionnaire, completeAnswerOptions);

      expect(result).toBe(questionnaire);
      expect(result.item![0].answerOption).toEqual([
        { valueString: 'New Option 1' }
      ]);
      expect(result.item![1]).not.toHaveProperty('answerOption');
      expect(result.item![2].answerOption).toEqual([
        { valueString: 'Original 3' }
      ]);
      expect(result.item![3].answerOption).toEqual([
        { valueString: 'New Option 4A' },
        { valueString: 'New Option 4B' }
      ]);
    });
  });
});
