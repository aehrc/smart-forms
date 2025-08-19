/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import type {
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  // QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type {
  EnableWhenItems,
  EnableWhenSingleItemProperties,
  EnableWhenRepeatItemProperties
} from '../interfaces/enableWhen.interface';
import {
  createEnableWhenLinkedQuestions,
  isEnabledAnswerTypeSwitcher,
  mutateRepeatEnableWhenItemInstances,
  readInitialAnswers,
  setInitialAnswers,
  updateEnableWhenItemAnswer,
  checkItemIsEnabledSingle,
  checkItemIsEnabledRepeat,
  assignPopulatedAnswersToEnableWhen
} from '../utils/enableWhen';

describe('enableWhen utils - Phase 1', () => {
  describe('createEnableWhenLinkedQuestions', () => {
    test('should create empty map when no enableWhen items exist', () => {
      const enableWhenItems: EnableWhenItems = {
        singleItems: {},
        repeatItems: {}
      };

      const result = createEnableWhenLinkedQuestions(enableWhenItems);

      expect(result).toEqual({});
    });

    test('should map linked questions from single items', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'linked-question-1',
        operator: 'exists',
        answerBoolean: true
      };

      const enableWhenItems: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: true,
            linked: [
              {
                enableWhen: mockEnableWhen
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const result = createEnableWhenLinkedQuestions(enableWhenItems);

      expect(result).toEqual({
        'linked-question-1': ['item-1']
      });
    });

    test('should map linked questions from repeat items', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'repeat-linked-question',
        operator: '=',
        answerString: 'test'
      };

      const enableWhenItems: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            isEnabled: true,
            parentLinkId: 'parent-repeat',
            enabledIndexes: [true],
            linked: [
              {
                enableWhen: mockEnableWhen,
                parentLinkId: 'parent-repeat',
                answers: []
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const result = createEnableWhenLinkedQuestions(enableWhenItems);

      expect(result).toEqual({
        'repeat-linked-question': ['repeat-item']
      });
    });

    test('should handle multiple linked questions for same item', () => {
      const mockEnableWhen1: QuestionnaireItemEnableWhen = {
        question: 'question-1',
        operator: 'exists',
        answerBoolean: true
      };

      const mockEnableWhen2: QuestionnaireItemEnableWhen = {
        question: 'question-2',
        operator: '=',
        answerString: 'value'
      };

      const enableWhenItems: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: true,
            linked: [
              {
                enableWhen: mockEnableWhen1
              },
              {
                enableWhen: mockEnableWhen2
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const result = createEnableWhenLinkedQuestions(enableWhenItems);

      expect(result).toEqual({
        'question-1': ['item-1'],
        'question-2': ['item-1']
      });
    });

    test('should handle multiple items linked to same question', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'shared-question',
        operator: 'exists',
        answerBoolean: true
      };

      const enableWhenItems: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: true,
            linked: [
              {
                enableWhen: mockEnableWhen
              }
            ]
          } as EnableWhenSingleItemProperties,
          'item-2': {
            isEnabled: false,
            linked: [
              {
                enableWhen: mockEnableWhen
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const result = createEnableWhenLinkedQuestions(enableWhenItems);

      expect(result).toEqual({
        'shared-question': ['item-1', 'item-2']
      });
    });

    test('should not duplicate linkIds for same question', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'duplicate-question',
        operator: 'exists',
        answerBoolean: true
      };

      const enableWhenItems: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: true,
            linked: [
              {
                enableWhen: mockEnableWhen
              },
              {
                enableWhen: mockEnableWhen
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const result = createEnableWhenLinkedQuestions(enableWhenItems);

      expect(result).toEqual({
        'duplicate-question': ['item-1']
      });
    });
  });

  describe('isEnabledAnswerTypeSwitcher', () => {
    test('should return true for exists operator with boolean answer', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: 'exists',
        answerBoolean: true
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueBoolean: true
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should return false for exists operator with no answer', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: 'exists',
        answerBoolean: true
      };

      const answer: QuestionnaireResponseItemAnswer = {};

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(false);
    });

    test('should handle answerString type switcher', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerString: 'expected-value'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueString: 'expected-value'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should return false for non-matching answerString', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerString: 'expected-value'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueString: 'different-value'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(false);
    });

    test('should handle answerInteger type switcher', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerInteger: 42
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueInteger: 42
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle answerDecimal type switcher', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerDecimal: 3.14
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueDecimal: 3.14
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle answerCoding type switcher', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerCoding: {
          system: 'http://test.com',
          code: 'test-code'
        }
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueCoding: {
          system: 'http://test.com',
          code: 'test-code'
        }
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should return correct result for matching string values', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerString: 'value'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueString: 'value'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true); // Function correctly matches answerString with valueString
    });

    test('should handle boolean comparison with answerBoolean', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerBoolean: true
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueBoolean: true
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle date comparison with answerDate', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerDate: '2023-01-01'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueDate: '2023-01-01'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle dateTime comparison with answerDateTime', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerDateTime: '2023-01-01T10:00:00Z'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueDateTime: '2023-01-01T10:00:00Z'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle time comparison with answerTime', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerTime: '10:30:00'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueTime: '10:30:00'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle coding display comparison when code is not present', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerCoding: {
          system: 'http://test.com',
          display: 'Test Display'
        }
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueCoding: {
          system: 'http://test.com',
          display: 'Test Display'
        }
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle quantity comparison with answerQuantity', () => {
      const quantityObject = {
        value: 10,
        unit: 'kg'
      };

      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerQuantity: quantityObject
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueQuantity: quantityObject
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should return false for mismatched types', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '=',
        answerString: 'test'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueInteger: 42
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(false);
    });

    test('should handle numerical comparisons (greater than)', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '>',
        answerInteger: 5
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueInteger: 10
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle numerical comparisons (less than)', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '<',
        answerDecimal: 5.5
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueDecimal: 3.2
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle not equals comparison', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '!=',
        answerString: 'no'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueString: 'yes'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });
  });

  describe('mutateRepeatEnableWhenItemInstances', () => {
    test('should add new instance to repeat items', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'linked-question',
        operator: '=',
        answerString: 'test'
      };

      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'parent-group',
            enabledIndexes: [true, false],
            linked: [
              {
                enableWhen: mockEnableWhen,
                parentLinkId: 'parent-group',
                answers: [{ valueString: 'test' }, { valueString: 'other' }]
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const result = mutateRepeatEnableWhenItemInstances(items, 'parent-group', 1, 'add');

      expect(result.repeatItems['repeat-item'].enabledIndexes).toHaveLength(2);
      expect(result.repeatItems['repeat-item'].linked[0].answers).toHaveLength(2);
    });

    test('should remove instance from repeat items', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'linked-question',
        operator: '=',
        answerString: 'test'
      };

      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'parent-group',
            enabledIndexes: [true, false, true],
            linked: [
              {
                enableWhen: mockEnableWhen,
                parentLinkId: 'parent-group',
                answers: [
                  { valueString: 'test' },
                  { valueString: 'other' },
                  { valueString: 'test' }
                ]
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const result = mutateRepeatEnableWhenItemInstances(items, 'parent-group', 1, 'remove');

      expect(result.repeatItems['repeat-item'].enabledIndexes).toHaveLength(2);
      expect(result.repeatItems['repeat-item'].linked[0].answers).toHaveLength(2);
    });

    test('should skip items with different parent linkId', () => {
      const mockEnableWhen: QuestionnaireItemEnableWhen = {
        question: 'linked-question',
        operator: '=',
        answerString: 'test'
      };

      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'different-parent',
            enabledIndexes: [true],
            linked: [
              {
                enableWhen: mockEnableWhen,
                parentLinkId: 'different-parent',
                answers: [{ valueString: 'test' }]
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const originalLength = items.repeatItems['repeat-item'].enabledIndexes.length;

      const result = mutateRepeatEnableWhenItemInstances(items, 'target-parent', 0, 'add');

      expect(result.repeatItems['repeat-item'].enabledIndexes).toHaveLength(originalLength);
    });
  });

  describe('readInitialAnswers', () => {
    test('should return empty object when questionnaireResponse has no items', () => {
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const linkedQuestionsMap = {
        'question-1': ['item-1']
      };

      const result = readInitialAnswers(questionnaireResponse, linkedQuestionsMap);

      expect(result).toEqual({});
    });

    test('should extract initial answers from questionnaireResponse', () => {
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'question-1',
            answer: [{ valueString: 'initial-value' }]
          },
          {
            linkId: 'question-2',
            answer: [{ valueBoolean: true }]
          }
        ]
      };

      const linkedQuestionsMap = {
        'question-1': ['item-1'],
        'question-2': ['item-2']
      };

      const result = readInitialAnswers(questionnaireResponse, linkedQuestionsMap);

      expect(result).toEqual({
        'question-1': [{ valueString: 'initial-value' }],
        'question-2': [{ valueBoolean: true }]
      });
    });

    test('should extract answers from nested items recursively', () => {
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'group-1',
            item: [
              {
                linkId: 'question-1',
                answer: [{ valueString: 'nested-value' }]
              },
              {
                linkId: 'sub-group',
                item: [
                  {
                    linkId: 'question-2',
                    answer: [{ valueInteger: 42 }]
                  }
                ]
              }
            ]
          }
        ]
      };

      const linkedQuestionsMap = {
        'question-1': ['item-1'],
        'question-2': ['item-2']
      };

      const result = readInitialAnswers(questionnaireResponse, linkedQuestionsMap);

      expect(result).toEqual({
        'question-1': [{ valueString: 'nested-value' }],
        'question-2': [{ valueInteger: 42 }]
      });
    });

    test('should only include items that are in linkedQuestionsMap', () => {
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'question-1',
            answer: [{ valueString: 'value-1' }]
          },
          {
            linkId: 'question-2',
            answer: [{ valueString: 'value-2' }]
          },
          {
            linkId: 'question-3',
            answer: [{ valueString: 'value-3' }]
          }
        ]
      };

      const linkedQuestionsMap = {
        'question-1': ['item-1'],
        'question-3': ['item-3']
      };

      const result = readInitialAnswers(questionnaireResponse, linkedQuestionsMap);

      expect(result).toEqual({
        'question-1': [{ valueString: 'value-1' }],
        'question-3': [{ valueString: 'value-3' }]
      });
      expect(result['question-2']).toBeUndefined();
    });

    test('should ignore items without answers', () => {
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'question-1',
            answer: [{ valueString: 'value-1' }]
          },
          {
            linkId: 'question-2'
            // No answer property
          }
        ]
      };

      const linkedQuestionsMap = {
        'question-1': ['item-1'],
        'question-2': ['item-2']
      };

      const result = readInitialAnswers(questionnaireResponse, linkedQuestionsMap);

      expect(result).toEqual({
        'question-1': [{ valueString: 'value-1' }]
      });
      expect(result['question-2']).toBeUndefined();
    });
  });

  describe('checkItemIsEnabledSingle', () => {
    test('should return true when all linked items satisfy conditions', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            answer: [{ valueString: 'yes' }]
          }
        ]
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(true);
    });

    test('should return false when no linked items satisfy conditions', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            answer: [{ valueString: 'no' }]
          }
        ]
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(false);
    });

    test('should handle multiple answers and return true if any satisfies condition', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'target'
            },
            answer: [{ valueString: 'no' }, { valueString: 'target' }, { valueString: 'other' }]
          }
        ]
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(true);
    });

    test('should handle enableBehavior "any" - return true if any linked item is satisfied', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        enableBehavior: 'any',
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            answer: [{ valueString: 'no' }]
          },
          {
            enableWhen: {
              question: 'q2',
              operator: '=',
              answerString: 'correct'
            },
            answer: [{ valueString: 'correct' }]
          }
        ]
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(true);
    });

    test('should handle enableBehavior "all" - return true only if all linked items are satisfied', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        enableBehavior: 'all',
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            answer: [{ valueString: 'yes' }]
          },
          {
            enableWhen: {
              question: 'q2',
              operator: '=',
              answerString: 'correct'
            },
            answer: [{ valueString: 'wrong' }]
          }
        ]
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(false);
    });

    test('should handle linked items without answers but check for unanswered booleans', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '!=',
              answerBoolean: true
            }
            // No answer property
          }
        ]
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(true);
    });

    test('should return false when there are no linked items', () => {
      const enableWhenItem: EnableWhenSingleItemProperties = {
        isEnabled: false,
        linked: []
      };

      const result = checkItemIsEnabledSingle(enableWhenItem);

      expect(result).toBe(false);
    });
  });

  describe('checkItemIsEnabledRepeat', () => {
    test('should return true when linked answer satisfies condition', () => {
      const enableWhenItem: EnableWhenRepeatItemProperties = {
        parentLinkId: 'parent',
        enabledIndexes: [false],
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            parentLinkId: 'parent',
            answers: [{ valueString: 'yes' }]
          }
        ]
      };

      const result = checkItemIsEnabledRepeat(enableWhenItem, 0);

      expect(result).toBe(true);
    });

    test('should return false when linked answer does not satisfy condition', () => {
      const enableWhenItem: EnableWhenRepeatItemProperties = {
        parentLinkId: 'parent',
        enabledIndexes: [true],
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            parentLinkId: 'parent',
            answers: [{ valueString: 'no' }]
          }
        ]
      };

      const result = checkItemIsEnabledRepeat(enableWhenItem, 0);

      expect(result).toBe(false);
    });

    test('should handle missing answer at specified index', () => {
      const enableWhenItem: EnableWhenRepeatItemProperties = {
        parentLinkId: 'parent',
        enabledIndexes: [false],
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '!=',
              answerBoolean: true
            },
            parentLinkId: 'parent',
            answers: []
          }
        ]
      };

      const result = checkItemIsEnabledRepeat(enableWhenItem, 0);

      expect(result).toBe(true);
    });

    test('should handle enableBehavior "any" for repeat items', () => {
      const enableWhenItem: EnableWhenRepeatItemProperties = {
        parentLinkId: 'parent',
        enabledIndexes: [false],
        enableBehavior: 'any',
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            parentLinkId: 'parent',
            answers: [{ valueString: 'no' }]
          },
          {
            enableWhen: {
              question: 'q2',
              operator: '=',
              answerString: 'correct'
            },
            parentLinkId: 'parent',
            answers: [{ valueString: 'correct' }]
          }
        ]
      };

      const result = checkItemIsEnabledRepeat(enableWhenItem, 0);

      expect(result).toBe(true);
    });

    test('should return false when no linked items have valid conditions', () => {
      const enableWhenItem: EnableWhenRepeatItemProperties = {
        parentLinkId: 'parent',
        enabledIndexes: [true],
        linked: [
          {
            enableWhen: {
              question: 'q1',
              operator: '=',
              answerString: 'yes'
            },
            parentLinkId: 'parent',
            answers: [{ valueString: 'no' }]
          }
        ]
      };

      const result = checkItemIsEnabledRepeat(enableWhenItem, 0);

      expect(result).toBe(false);
    });
  });

  describe('updateEnableWhenItemAnswer', () => {
    test('should update single item answers and enabled status', () => {
      const items: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: false,
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '=',
                  answerString: 'yes'
                }
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const result = updateEnableWhenItemAnswer(
        items,
        ['item-1'],
        'q1',
        [{ valueString: 'yes' }],
        null
      );

      expect(result.singleItems['item-1'].linked[0].answer).toEqual([{ valueString: 'yes' }]);
      expect(result.singleItems['item-1'].isEnabled).toBe(true);
    });

    test('should update repeat item answers and enabled status', () => {
      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'parent',
            enabledIndexes: [false, false],
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '=',
                  answerString: 'yes'
                },
                parentLinkId: 'parent',
                answers: []
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const result = updateEnableWhenItemAnswer(
        items,
        ['repeat-item'],
        'q1',
        [{ valueString: 'yes' }],
        1
      );

      expect(result.repeatItems['repeat-item'].linked[0].answers[1]).toEqual({
        valueString: 'yes'
      });
      expect(result.repeatItems['repeat-item'].enabledIndexes[1]).toBe(true);
    });

    test('should handle clearing answers for repeat items', () => {
      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'parent',
            enabledIndexes: [true],
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '=',
                  answerString: 'yes'
                },
                parentLinkId: 'parent',
                answers: [{ valueString: 'yes' }]
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const result = updateEnableWhenItemAnswer(items, ['repeat-item'], 'q1', undefined, 0);

      expect(result.repeatItems['repeat-item'].linked[0].answers[0]).toBeUndefined();
      expect(result.repeatItems['repeat-item'].enabledIndexes[0]).toBe(false);
    });

    test('should skip repeat items when parentRepeatGroupIndex is null', () => {
      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'parent',
            enabledIndexes: [false],
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '=',
                  answerString: 'yes'
                },
                parentLinkId: 'parent',
                answers: []
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const result = updateEnableWhenItemAnswer(
        items,
        ['repeat-item'],
        'q1',
        [{ valueString: 'yes' }],
        null
      );

      expect(result.repeatItems['repeat-item'].linked[0].answers[0]).toBeUndefined();
      expect(result.repeatItems['repeat-item'].enabledIndexes[0]).toBe(false);
    });
  });

  describe('setInitialAnswers', () => {
    test('should set initial answers and update enabled status', () => {
      const initialAnswers = {
        q1: [{ valueString: 'yes' }],
        q2: [{ valueBoolean: true }]
      };

      const items: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: false,
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '=',
                  answerString: 'yes'
                }
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const linkedQuestionsMap = {
        q1: ['item-1'],
        q2: ['item-2']
      };

      const result = setInitialAnswers(initialAnswers, items, linkedQuestionsMap);

      expect(result.singleItems['item-1'].isEnabled).toBe(true);
    });

    test('should handle empty initial answers', () => {
      const items: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: false,
            linked: []
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const result = setInitialAnswers({}, items, {});

      expect(result).toEqual(items);
    });
  });

  describe('assignPopulatedAnswersToEnableWhen', () => {
    test('should return initialized items and linked questions', () => {
      const items: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: false,
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '=',
                  answerString: 'yes'
                }
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'q1',
            answer: [{ valueString: 'yes' }]
          }
        ]
      };

      const result = assignPopulatedAnswersToEnableWhen(items, questionnaireResponse);

      expect(result.linkedQuestions).toEqual({ q1: ['item-1'] });
      expect(result.initialisedItems.singleItems['item-1'].isEnabled).toBe(true);
    });

    test('should handle empty initial answers', () => {
      const items: EnableWhenItems = {
        singleItems: {
          'item-1': {
            isEnabled: false,
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '!=',
                  answerBoolean: true
                }
              }
            ]
          } as EnableWhenSingleItemProperties
        },
        repeatItems: {}
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = assignPopulatedAnswersToEnableWhen(items, questionnaireResponse);

      expect(result.linkedQuestions).toEqual({ q1: ['item-1'] });
      expect(result.initialisedItems.singleItems['item-1'].isEnabled).toBe(true);
    });

    test('should handle repeat items in initialization', () => {
      const items: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'repeat-item': {
            parentLinkId: 'parent',
            enabledIndexes: [false, false],
            linked: [
              {
                enableWhen: {
                  question: 'q1',
                  operator: '!=',
                  answerBoolean: true
                },
                parentLinkId: 'parent',
                answers: []
              }
            ]
          } as EnableWhenRepeatItemProperties
        }
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = assignPopulatedAnswersToEnableWhen(items, questionnaireResponse);

      expect(result.linkedQuestions).toEqual({ q1: ['repeat-item'] });
      expect(result.initialisedItems.repeatItems['repeat-item'].enabledIndexes).toEqual([
        true,
        true
      ]);
    });
  });

  describe('Additional edge cases for better coverage', () => {
    test('should handle exists operator with false expectation for non-existent answers', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: 'exists',
        answerBoolean: false
      };

      const answer: QuestionnaireResponseItemAnswer = {};

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle ">=" operator correctly', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '>=',
        answerInteger: 10
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueInteger: 10
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle "<=" operator correctly', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: '<=',
        answerDecimal: 5.5
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueDecimal: 5.5
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(true);
    });

    test('should handle unsupported operators in answerOperatorSwitcher', () => {
      const enableWhen: QuestionnaireItemEnableWhen = {
        question: 'test-question',
        operator: 'unsupported' as any,
        answerString: 'test'
      };

      const answer: QuestionnaireResponseItemAnswer = {
        valueString: 'test'
      };

      const result = isEnabledAnswerTypeSwitcher(enableWhen, answer);

      expect(result).toBe(false);
    });
  });
});
