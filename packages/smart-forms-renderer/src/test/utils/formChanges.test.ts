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

import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { readFormChanges, readItemChangesRecursive } from '../../utils/formChanges';

describe('formChanges', () => {
  const createMockItemMap = (): Record<string, Omit<QuestionnaireItem, 'item'>> => ({
    'question-1': {
      linkId: 'question-1',
      type: 'string' as const,
      text: 'Question 1'
    },
    'question-2': {
      linkId: 'question-2',
      type: 'integer' as const,
      text: 'Question 2'
    },
    'question-3': {
      linkId: 'question-3',
      type: 'boolean' as const,
      text: 'Question 3'
    },
    'group-1': {
      linkId: 'group-1',
      type: 'group' as const,
      text: 'Group 1'
    }
  });

  const createMockAnswer = (value: any): QuestionnaireResponseItemAnswer => ({
    valueString: typeof value === 'string' ? value : undefined,
    valueInteger: typeof value === 'number' ? value : undefined,
    valueBoolean: typeof value === 'boolean' ? value : undefined
  });

  describe('readFormChanges', () => {
    it('should return empty object when formChanges has no item property', () => {
      const formChanges = { someOtherProperty: 'value' };
      const itemMap = createMockItemMap();

      const result = readFormChanges(formChanges, itemMap);

      expect(result).toEqual({});
    });

    it('should return empty object when formChanges item is empty array', () => {
      const formChanges = { item: [] };
      const itemMap = createMockItemMap();

      const result = readFormChanges(formChanges, itemMap);

      expect(result).toEqual({});
    });

    it('should process single item change', () => {
      const formChanges = {
        item: [
          [
            '+',
            {
              linkId: 'question-1',
              item: undefined,
              answer: [['+', createMockAnswer('test value')]]
            }
          ]
        ]
      };
      const itemMap = createMockItemMap();

      const result = readFormChanges(formChanges, itemMap);

      expect(result).toEqual({
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'add',
          value: createMockAnswer('test value')
        }
      });
    });

    it('should process multiple item changes', () => {
      const formChanges = {
        item: [
          [
            '+',
            {
              linkId: 'question-1',
              item: undefined,
              answer: [['+', createMockAnswer('new value')]]
            }
          ],
          [
            '-',
            {
              linkId: 'question-2',
              item: undefined,
              answer: [['-', createMockAnswer(42)]]
            }
          ]
        ]
      };
      const itemMap = createMockItemMap();

      const result = readFormChanges(formChanges, itemMap);

      expect(result).toEqual({
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'add',
          value: createMockAnswer('new value')
        },
        'question-2': {
          linkId: 'question-2',
          itemType: 'integer',
          operation: 'remove',
          value: createMockAnswer(42)
        }
      });
    });

    it('should handle nested item changes', () => {
      const formChanges = {
        item: [
          [
            ' ',
            {
              linkId: 'group-1',
              item: [
                [
                  '~',
                  {
                    linkId: 'question-1',
                    item: undefined,
                    answer: [['~', createMockAnswer('updated value')]]
                  }
                ]
              ],
              answer: undefined
            }
          ]
        ]
      };
      const itemMap = createMockItemMap();

      const result = readFormChanges(formChanges, itemMap);

      expect(result).toEqual({
        'group-1': null, // Group items get null value
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'update',
          value: createMockAnswer('updated value')
        }
      });
    });

    it('should handle complex nested structure', () => {
      const formChanges = {
        item: [
          [
            '+',
            {
              linkId: 'group-1',
              item: [
                [
                  '+',
                  {
                    linkId: 'question-1',
                    item: [
                      [
                        '+',
                        {
                          linkId: 'question-2',
                          item: undefined,
                          answer: [['+', createMockAnswer(123)]]
                        }
                      ]
                    ],
                    answer: [['+', createMockAnswer('parent value')]]
                  }
                ]
              ],
              answer: undefined
            }
          ]
        ]
      };
      const itemMap = createMockItemMap();

      const result = readFormChanges(formChanges, itemMap);

      expect(result).toEqual({
        'group-1': null,
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'add',
          value: createMockAnswer('parent value')
        },
        'question-2': {
          linkId: 'question-2',
          itemType: 'integer',
          operation: 'add',
          value: createMockAnswer(123)
        }
      });
    });
  });

  describe('readItemChangesRecursive', () => {
    it('should return early when operator is missing', () => {
      const diffArray: any = [undefined, { linkId: 'test', item: undefined, answer: undefined }];
      const itemMap = createMockItemMap();
      const changedItems = {};

      const result = readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(result).toBe(changedItems);
      expect(changedItems).toEqual({});
    });

    it('should return early when diffItem is missing', () => {
      const diffArray: any = ['+', undefined];
      const itemMap = createMockItemMap();
      const changedItems = {};

      const result = readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(result).toBe(changedItems);
      expect(changedItems).toEqual({});
    });

    it('should add linkId to changedItems even without answers', () => {
      const diffArray: any = [
        ' ',
        {
          linkId: 'question-1',
          item: undefined,
          answer: undefined
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'question-1': null
      });
    });

    it('should process child items recursively', () => {
      const diffArray: any = [
        ' ',
        {
          linkId: 'group-1',
          item: [
            [
              '+',
              {
                linkId: 'question-1',
                item: undefined,
                answer: undefined
              }
            ],
            [
              '-',
              {
                linkId: 'question-2',
                item: undefined,
                answer: undefined
              }
            ]
          ],
          answer: undefined
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'group-1': null,
        'question-1': null,
        'question-2': null
      });
    });

    it('should handle empty child items array', () => {
      const diffArray: any = [
        ' ',
        {
          linkId: 'group-1',
          item: [],
          answer: undefined
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'group-1': null
      });
    });

    it('should process answer diff arrays', () => {
      const diffArray: any = [
        '+',
        {
          linkId: 'question-1',
          item: undefined,
          answer: [
            ['+', createMockAnswer('test')],
            ['-', createMockAnswer('old value')]
          ]
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'remove', // Last operation wins
          value: createMockAnswer('old value')
        }
      });
    });

    it('should handle regular answer arrays (not diff arrays)', () => {
      const diffArray: any = [
        '+',
        {
          linkId: 'question-1',
          item: undefined,
          answer: [createMockAnswer('regular answer 1'), createMockAnswer('regular answer 2')]
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      // Should only set null for linkId since it's not a diff array
      expect(changedItems).toEqual({
        'question-1': null
      });
    });

    it('should skip space operator answers', () => {
      const diffArray: any = [
        '+',
        {
          linkId: 'question-1',
          item: undefined,
          answer: [
            [' ', createMockAnswer('unchanged')],
            ['+', createMockAnswer('added')]
          ]
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'add',
          value: createMockAnswer('added')
        }
      });
    });

    it('should handle missing qItem in itemMap', () => {
      const diffArray: any = [
        '+',
        {
          linkId: 'unknown-question',
          item: undefined,
          answer: [['+', createMockAnswer('test')]]
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'unknown-question': null // Should remain null since qItem not found
      });
    });

    it('should handle invalid diff operators', () => {
      const diffArray: any = [
        '+',
        {
          linkId: 'question-1',
          item: undefined,
          answer: [
            ['?', createMockAnswer('invalid operator')] // Invalid operator
          ]
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      expect(changedItems).toEqual({
        'question-1': null // Should remain null since operation is null
      });
    });

    it('should test all diff operators', () => {
      const diffArray: any = [
        '+',
        {
          linkId: 'question-1',
          item: undefined,
          answer: [
            ['+', createMockAnswer('add')],
            ['-', createMockAnswer('remove')],
            ['~', createMockAnswer('update')]
          ]
        }
      ];
      const itemMap = createMockItemMap();
      const changedItems = {};

      readItemChangesRecursive(diffArray, itemMap, changedItems);

      // Last operation should win
      expect(changedItems).toEqual({
        'question-1': {
          linkId: 'question-1',
          itemType: 'string',
          operation: 'update',
          value: createMockAnswer('update')
        }
      });
    });

    describe('edge cases', () => {
      it('should handle null/undefined answer arrays', () => {
        const diffArray: any = [
          '+',
          {
            linkId: 'question-1',
            item: undefined,
            answer: null
          }
        ];
        const itemMap = createMockItemMap();
        const changedItems = {};

        readItemChangesRecursive(diffArray, itemMap, changedItems);

        expect(changedItems).toEqual({
          'question-1': null
        });
      });

      it('should handle mixed valid and invalid answer diff items', () => {
        const diffArray: any = [
          '+',
          {
            linkId: 'question-1',
            item: undefined,
            answer: [
              ['+', createMockAnswer('valid')],
              'invalid-item', // Not an array
              ['-', createMockAnswer('also valid')]
            ]
          }
        ];
        const itemMap = createMockItemMap();
        const changedItems = {};

        readItemChangesRecursive(diffArray, itemMap, changedItems);

        // Should not process as diff array due to invalid item
        expect(changedItems).toEqual({
          'question-1': null
        });
      });

      it('should handle answer diff arrays with non-string operators', () => {
        const diffArray: any = [
          '+',
          {
            linkId: 'question-1',
            item: undefined,
            answer: [
              [123, createMockAnswer('numeric operator')], // Invalid operator type
              ['+', createMockAnswer('valid')]
            ]
          }
        ];
        const itemMap = createMockItemMap();
        const changedItems = {};

        readItemChangesRecursive(diffArray, itemMap, changedItems);

        // Should not process as diff array due to non-string operator
        expect(changedItems).toEqual({
          'question-1': null
        });
      });

      it('should handle answer diff arrays with non-object values', () => {
        const diffArray: any = [
          '+',
          {
            linkId: 'question-1',
            item: undefined,
            answer: [
              ['+', 'not an object'], // Invalid value type
              ['-', createMockAnswer('valid')]
            ]
          }
        ];
        const itemMap = createMockItemMap();
        const changedItems = {};

        readItemChangesRecursive(diffArray, itemMap, changedItems);

        // Should not process as diff array due to non-object value
        expect(changedItems).toEqual({
          'question-1': null
        });
      });

      it('should handle deeply nested items with multiple levels', () => {
        const diffArray: any = [
          '+',
          {
            linkId: 'level-1',
            item: [
              [
                '+',
                {
                  linkId: 'level-2',
                  item: [
                    [
                      '+',
                      {
                        linkId: 'level-3',
                        item: [
                          [
                            '+',
                            {
                              linkId: 'question-1',
                              item: undefined,
                              answer: [['+', createMockAnswer('deep value')]]
                            }
                          ]
                        ],
                        answer: undefined
                      }
                    ]
                  ],
                  answer: undefined
                }
              ]
            ],
            answer: undefined
          }
        ];
        const itemMap = {
          ...createMockItemMap(),
          'level-1': { linkId: 'level-1', type: 'group' as const, text: 'Level 1' },
          'level-2': { linkId: 'level-2', type: 'group' as const, text: 'Level 2' },
          'level-3': { linkId: 'level-3', type: 'group' as const, text: 'Level 3' }
        };
        const changedItems = {};

        readItemChangesRecursive(diffArray, itemMap, changedItems);

        expect(changedItems).toEqual({
          'level-1': null,
          'level-2': null,
          'level-3': null,
          'question-1': {
            linkId: 'question-1',
            itemType: 'string',
            operation: 'add',
            value: createMockAnswer('deep value')
          }
        });
      });
    });
  });

  describe('internal functions coverage', () => {
    it('should test isAnswerDiffArray type predicate with various inputs', () => {
      // This test ensures we cover the isAnswerDiffArray function branches
      const validDiffArray = [
        ['+', createMockAnswer('test')],
        ['-', createMockAnswer('test2')]
      ];

      const invalidDiffArray1 = ['not an array', ['+', createMockAnswer('test')]];

      const invalidDiffArray2 = [
        [123, createMockAnswer('test')], // Non-string operator
        ['+', createMockAnswer('test')]
      ];

      const invalidDiffArray3 = [
        ['+', 'not an object'], // Non-object value
        ['+', createMockAnswer('test')]
      ];

      // Test through the main function to ensure coverage
      const validFormChanges = {
        item: [
          [
            '+',
            {
              linkId: 'question-1',
              item: undefined,
              answer: validDiffArray
            }
          ]
        ]
      };

      const invalidFormChanges1 = {
        item: [
          [
            '+',
            {
              linkId: 'question-1',
              item: undefined,
              answer: invalidDiffArray1
            }
          ]
        ]
      };

      const invalidFormChanges2 = {
        item: [
          [
            '+',
            {
              linkId: 'question-1',
              item: undefined,
              answer: invalidDiffArray2
            }
          ]
        ]
      };

      const invalidFormChanges3 = {
        item: [
          [
            '+',
            {
              linkId: 'question-1',
              item: undefined,
              answer: invalidDiffArray3
            }
          ]
        ]
      };

      const itemMap = createMockItemMap();

      // Valid diff array should be processed
      const result1 = readFormChanges(validFormChanges, itemMap);
      expect(result1['question-1']).not.toBeNull();

      // Invalid diff arrays should not be processed
      const result2 = readFormChanges(invalidFormChanges1, itemMap);
      expect(result2['question-1']).toBeNull();

      const result3 = readFormChanges(invalidFormChanges2, itemMap);
      expect(result3['question-1']).toBeNull();

      const result4 = readFormChanges(invalidFormChanges3, itemMap);
      expect(result4['question-1']).toBeNull();
    });

    it('should test answerDiffOperationSwitcher coverage', () => {
      // This covers all operator cases in the switch statement
      const operators = ['+', '-', '~', ' ', 'invalid'] as any[];

      operators.forEach((operator) => {
        const diffArray: any = [
          '+',
          {
            linkId: 'question-1',
            item: undefined,
            answer: [[operator, createMockAnswer('test')]]
          }
        ];
        const itemMap = createMockItemMap();
        const changedItems: Record<string, any> = {};

        readItemChangesRecursive(diffArray, itemMap, changedItems);

        // Verify the result based on operator
        if (operator === '+') {
          expect(changedItems['question-1']).toEqual(expect.objectContaining({ operation: 'add' }));
        } else if (operator === '-') {
          expect(changedItems['question-1']).toEqual(
            expect.objectContaining({ operation: 'remove' })
          );
        } else if (operator === '~') {
          expect(changedItems['question-1']).toEqual(
            expect.objectContaining({ operation: 'update' })
          );
        } else {
          // ' ' and 'invalid' should result in null
          expect(changedItems['question-1']).toBeNull();
        }
      });
    });
  });
});
