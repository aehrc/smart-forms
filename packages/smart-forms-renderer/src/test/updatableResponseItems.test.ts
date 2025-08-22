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

import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { createQuestionnaireResponseItemMap } from '../utils/questionnaireResponseStoreUtils/updatableResponseItems';

describe('updatableResponseItems - Phase 5', () => {
  describe('createQuestionnaireResponseItemMap', () => {
    it('should return empty object when questionnaire has no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({});
    });

    it('should return empty object when questionnaire has empty items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({});
    });

    it('should create empty entries for questionnaire items when response has no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1'
          },
          {
            linkId: 'item2',
            type: 'integer',
            text: 'Question 2'
          }
        ]
      };
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        item1: [],
        item2: []
      });
    });

    it('should create empty entries for nested questionnaire items', () => {
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
                type: 'string',
                text: 'Nested Question 1'
              },
              {
                linkId: 'nested2',
                type: 'boolean',
                text: 'Nested Question 2'
              }
            ]
          },
          {
            linkId: 'item2',
            type: 'decimal',
            text: 'Question 2'
          }
        ]
      };
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        group1: [],
        nested1: [],
        nested2: [],
        item2: []
      });
    });

    it('should populate response items into the map when they exist', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1'
          },
          {
            linkId: 'item2',
            type: 'integer',
            text: 'Question 2'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item1',
            answer: [{ valueString: 'Answer 1' }]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        item1: [{ linkId: 'item1', answer: [{ valueString: 'Answer 1' }] }],
        item2: []
      });
    });

    it('should handle repeat group items (multiple items with same linkId)', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'repeat-group',
            type: 'group',
            repeats: true,
            text: 'Repeat Group',
            item: [
              {
                linkId: 'repeat-item',
                type: 'string',
                text: 'Item in repeat group'
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'repeat-group',
            item: [
              {
                linkId: 'repeat-item',
                answer: [{ valueString: 'First instance' }]
              }
            ]
          },
          {
            linkId: 'repeat-group',
            item: [
              {
                linkId: 'repeat-item',
                answer: [{ valueString: 'Second instance' }]
              }
            ]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result['repeat-group']).toHaveLength(2);
      expect(result['repeat-item']).toHaveLength(2);
      expect(result['repeat-item'][0].answer?.[0].valueString).toBe('First instance');
      expect(result['repeat-item'][1].answer?.[0].valueString).toBe('Second instance');
    });

    it('should handle nested response items correctly', () => {
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
                type: 'string',
                text: 'Nested Question 1'
              },
              {
                linkId: 'subgroup',
                type: 'group',
                text: 'Sub Group',
                item: [
                  {
                    linkId: 'deeply-nested',
                    type: 'boolean',
                    text: 'Deeply nested question'
                  }
                ]
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'group1',
            item: [
              {
                linkId: 'nested1',
                answer: [{ valueString: 'Nested answer' }]
              },
              {
                linkId: 'subgroup',
                item: [
                  {
                    linkId: 'deeply-nested',
                    answer: [{ valueBoolean: true }]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        group1: [expect.objectContaining({ linkId: 'group1' })],
        nested1: [
          expect.objectContaining({ linkId: 'nested1', answer: [{ valueString: 'Nested answer' }] })
        ],
        subgroup: [expect.objectContaining({ linkId: 'subgroup' })],
        'deeply-nested': [
          expect.objectContaining({ linkId: 'deeply-nested', answer: [{ valueBoolean: true }] })
        ]
      });
    });

    it('should handle complex mix of single and repeat items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'single-item',
            type: 'string',
            text: 'Single Item'
          },
          {
            linkId: 'repeat-item',
            type: 'string',
            repeats: true,
            text: 'Repeat Item'
          },
          {
            linkId: 'group',
            type: 'group',
            text: 'Group',
            item: [
              {
                linkId: 'group-child',
                type: 'integer',
                text: 'Group Child'
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'single-item',
            answer: [{ valueString: 'Single answer' }]
          },
          {
            linkId: 'repeat-item',
            answer: [{ valueString: 'First repeat' }]
          },
          {
            linkId: 'repeat-item',
            answer: [{ valueString: 'Second repeat' }]
          },
          {
            linkId: 'group',
            item: [
              {
                linkId: 'group-child',
                answer: [{ valueInteger: 42 }]
              }
            ]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result['single-item']).toHaveLength(1);
      expect(result['repeat-item']).toHaveLength(2);
      expect(result['group']).toHaveLength(1);
      expect(result['group-child']).toHaveLength(1);

      expect(result['single-item'][0].answer?.[0].valueString).toBe('Single answer');
      expect(result['repeat-item'][0].answer?.[0].valueString).toBe('First repeat');
      expect(result['repeat-item'][1].answer?.[0].valueString).toBe('Second repeat');
      expect(result['group-child'][0].answer?.[0].valueInteger).toBe(42);
    });

    it('should handle response items without corresponding questionnaire items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'existing-item',
            type: 'string',
            text: 'Existing Item'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'existing-item',
            answer: [{ valueString: 'Answer' }]
          },
          {
            linkId: 'orphan-item',
            answer: [{ valueString: 'Orphan answer' }]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      // Orphan items should still be included in the map
      expect(result).toEqual({
        'existing-item': [{ linkId: 'existing-item', answer: [{ valueString: 'Answer' }] }],
        'orphan-item': [{ linkId: 'orphan-item', answer: [{ valueString: 'Orphan answer' }] }]
      });
    });

    it('should handle empty response with undefined items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
        // no item property at all
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        item1: []
      });
    });

    it('should handle response items with no answers', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1'
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item1'
            // no answer property
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        item1: [{ linkId: 'item1' }]
      });
    });

    it('should handle deeply nested questionnaire structures', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'level1',
            type: 'group',
            text: 'Level 1',
            item: [
              {
                linkId: 'level2',
                type: 'group',
                text: 'Level 2',
                item: [
                  {
                    linkId: 'level3',
                    type: 'group',
                    text: 'Level 3',
                    item: [
                      {
                        linkId: 'level4',
                        type: 'string',
                        text: 'Level 4 Question'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'level1',
            item: [
              {
                linkId: 'level2',
                item: [
                  {
                    linkId: 'level3',
                    item: [
                      {
                        linkId: 'level4',
                        answer: [{ valueString: 'Deep answer' }]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result).toEqual({
        level1: [expect.objectContaining({ linkId: 'level1' })],
        level2: [expect.objectContaining({ linkId: 'level2' })],
        level3: [expect.objectContaining({ linkId: 'level3' })],
        level4: [
          expect.objectContaining({ linkId: 'level4', answer: [{ valueString: 'Deep answer' }] })
        ]
      });
    });

    it('should handle mixed repeat groups with individual repeat items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'repeat-group',
            type: 'group',
            repeats: true,
            text: 'Repeat Group',
            item: [
              {
                linkId: 'in-repeat-group',
                type: 'string',
                text: 'In Repeat Group'
              },
              {
                linkId: 'also-in-repeat',
                type: 'string',
                repeats: true,
                text: 'Also In Repeat (and itself repeats)'
              }
            ]
          }
        ]
      };

      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          // First instance of repeat group
          {
            linkId: 'repeat-group',
            item: [
              {
                linkId: 'in-repeat-group',
                answer: [{ valueString: 'Group 1, Item 1' }]
              },
              {
                linkId: 'also-in-repeat',
                answer: [{ valueString: 'Group 1, Repeat 1' }]
              },
              {
                linkId: 'also-in-repeat',
                answer: [{ valueString: 'Group 1, Repeat 2' }]
              }
            ]
          },
          // Second instance of repeat group
          {
            linkId: 'repeat-group',
            item: [
              {
                linkId: 'in-repeat-group',
                answer: [{ valueString: 'Group 2, Item 1' }]
              },
              {
                linkId: 'also-in-repeat',
                answer: [{ valueString: 'Group 2, Repeat 1' }]
              }
            ]
          }
        ]
      };

      const result = createQuestionnaireResponseItemMap(questionnaire, questionnaireResponse);

      expect(result['repeat-group']).toHaveLength(2);
      expect(result['in-repeat-group']).toHaveLength(2);
      expect(result['also-in-repeat']).toHaveLength(3); // 2 from first group + 1 from second group
    });
  });
});
