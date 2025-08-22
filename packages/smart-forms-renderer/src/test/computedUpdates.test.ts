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
import { applyComputedUpdates } from '../utils/computedUpdates';
import type {
  Questionnaire,
  QuestionnaireResponse
  // QuestionnaireItem,
  // QuestionnaireResponseItem
} from 'fhir/r4';
import type { ComputedQRItemUpdates } from '../interfaces/computedUpdates.interface';

// Mock dependencies
jest.mock('../utils/genericRecursive', () => ({
  updateQuestionnaireResponse: jest.fn(
    (questionnaire: any, response: any, updateFn: any, computedUpdates: any) => {
      // Simple mock that calls the update function for each item
      const result = { ...response };
      if (questionnaire.item && response.item) {
        result.item = response.item.map((qrItem: any) => {
          const qItem = questionnaire.item?.find((qi: any) => qi.linkId === qrItem.linkId);
          if (qItem) {
            return updateFn(qItem, qrItem, computedUpdates) || qrItem;
          }
          return qrItem;
        });
      }
      return result;
    }
  )
}));

jest.mock('../utils/mapItem', () => ({
  getQrItemsIndex: jest.fn(() => []),
  mapQItemsIndex: jest.fn(() => ({}))
}));

jest.mock('../utils/qrItem', () => ({
  createEmptyQrGroup: jest.fn((qItem: any) => ({
    linkId: qItem.linkId,
    text: qItem.text,
    item: []
  })),
  createEmptyQrItem: jest.fn((qItem: any, answerKey: any) => ({
    linkId: qItem.linkId,
    text: qItem.text,
    answer: answerKey ? [{ id: answerKey }] : []
  })),
  updateQrItemsInGroup: jest.fn()
}));

describe('computedUpdates utils', () => {
  describe('applyComputedUpdates', () => {
    it('should return original response when no computed updates', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-item',
            type: 'string',
            text: 'Test Item'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'test-item',
            text: 'Test Item',
            answer: [{ valueString: 'test value' }]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {};

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBe(response); // Should return the exact same object
    });

    it('should apply computed updates when they exist', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'computed-item',
            type: 'string',
            text: 'Computed Item'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'computed-item',
            text: 'Computed Item'
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'computed-item': {
          linkId: 'computed-item',
          answer: [{ valueString: 'computed value' }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
      expect(result.item).toBeDefined();
    });

    it('should handle computed updates with null values', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'remove-item',
            type: 'string',
            text: 'Remove Item'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'remove-item',
            text: 'Remove Item',
            answer: [{ valueString: 'to be removed' }]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'remove-item': null
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
    });

    it('should handle questionnaire with group items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group-item',
            type: 'group',
            text: 'Group Item',
            item: [
              {
                linkId: 'child-item',
                type: 'string',
                text: 'Child Item'
              }
            ]
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'group-item',
            text: 'Group Item',
            item: [
              {
                linkId: 'child-item',
                text: 'Child Item'
              }
            ]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'child-item': {
          linkId: 'child-item',
          answer: [{ valueString: 'computed child value' }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
    });

    it('should handle repeat groups', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'repeat-group',
            type: 'group',
            text: 'Repeat Group',
            repeats: true,
            item: [
              {
                linkId: 'repeat-item',
                type: 'string',
                text: 'Repeat Item'
              }
            ]
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'repeat-group',
            text: 'Repeat Group',
            item: [
              {
                linkId: 'repeat-item',
                text: 'Repeat Item',
                answer: [{ valueString: 'instance 1' }]
              }
            ]
          },
          {
            linkId: 'repeat-group',
            text: 'Repeat Group',
            item: [
              {
                linkId: 'repeat-item',
                text: 'Repeat Item',
                answer: [{ valueString: 'instance 2' }]
              }
            ]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'repeat-item': {
          linkId: 'repeat-item',
          answer: [{ valueString: 'computed repeat value' }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
    });

    it('should handle empty questionnaire', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const computedUpdates: ComputedQRItemUpdates = {};

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBe(response);
    });

    it('should handle empty response', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-item',
            type: 'string',
            text: 'Test Item'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'test-item': {
          linkId: 'test-item',
          answer: [{ valueString: 'new value' }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
    });

    it('should preserve existing answers when no computed update exists', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'preserve-item',
            type: 'string',
            text: 'Preserve Item'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'preserve-item',
            text: 'Preserve Item',
            answer: [{ valueString: 'original value' }]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'other-item': {
          linkId: 'other-item',
          answer: [{ valueString: 'other value' }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
      expect(result.item?.[0].answer?.[0].valueString).toBe('original value');
    });

    it('should handle nested group structures', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'outer-group',
            type: 'group',
            text: 'Outer Group',
            item: [
              {
                linkId: 'inner-group',
                type: 'group',
                text: 'Inner Group',
                item: [
                  {
                    linkId: 'nested-item',
                    type: 'string',
                    text: 'Nested Item'
                  }
                ]
              }
            ]
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'outer-group',
            text: 'Outer Group',
            item: [
              {
                linkId: 'inner-group',
                text: 'Inner Group',
                item: [
                  {
                    linkId: 'nested-item',
                    text: 'Nested Item'
                  }
                ]
              }
            ]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'nested-item': {
          linkId: 'nested-item',
          answer: [{ valueString: 'nested computed value' }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
    });

    it('should handle multiple computed updates', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          },
          {
            linkId: 'item-2',
            type: 'integer',
            text: 'Item 2'
          },
          {
            linkId: 'item-3',
            type: 'boolean',
            text: 'Item 3'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1'
          },
          {
            linkId: 'item-2',
            text: 'Item 2'
          },
          {
            linkId: 'item-3',
            text: 'Item 3'
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'item-1': {
          linkId: 'item-1',
          answer: [{ valueString: 'computed string' }]
        },
        'item-2': {
          linkId: 'item-2',
          answer: [{ valueInteger: 42 }]
        },
        'item-3': {
          linkId: 'item-3',
          answer: [{ valueBoolean: true }]
        }
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
      expect(result.item).toHaveLength(3);
    });

    it('should handle mixed updates and removals', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'update-item',
            type: 'string',
            text: 'Update Item'
          },
          {
            linkId: 'remove-item',
            type: 'string',
            text: 'Remove Item'
          },
          {
            linkId: 'preserve-item',
            type: 'string',
            text: 'Preserve Item'
          }
        ]
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'update-item',
            text: 'Update Item',
            answer: [{ valueString: 'old value' }]
          },
          {
            linkId: 'remove-item',
            text: 'Remove Item',
            answer: [{ valueString: 'to be removed' }]
          },
          {
            linkId: 'preserve-item',
            text: 'Preserve Item',
            answer: [{ valueString: 'keep this' }]
          }
        ]
      };

      const computedUpdates: ComputedQRItemUpdates = {
        'update-item': {
          linkId: 'update-item',
          answer: [{ valueString: 'new value' }]
        },
        'remove-item': null
      };

      const result = applyComputedUpdates(questionnaire, response, computedUpdates);

      expect(result).toBeDefined();
    });
  });
});
