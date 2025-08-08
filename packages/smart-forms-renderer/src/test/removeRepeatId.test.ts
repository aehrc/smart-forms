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

import { removeInternalRepeatIdsRecursive } from '../utils/removeRepeatId';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

describe('removeRepeatId', () => {
  describe('removeInternalRepeatIdsRecursive', () => {
    it('should handle null qrItemOrItems', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test item'
      };

      const result = removeInternalRepeatIdsRecursive(qItem, null);

      expect(result).toBeNull();
    });

    it('should remove internal repeatId from answers', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test item'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [
          { id: 'internal-repeat-id-1', valueString: 'answer1' },
          { id: 'internal-repeat-id-2', valueString: 'answer2' }
        ]
      };

      const result = removeInternalRepeatIdsRecursive(qItem, qrItem) as QuestionnaireResponseItem;

      expect(result).toBeDefined();
      expect(result.linkId).toBe('test-item');
      expect(result.answer).toHaveLength(2);
      expect(result.answer![0]).not.toHaveProperty('id');
      expect(result.answer![0].valueString).toBe('answer1');
      expect(result.answer![1]).not.toHaveProperty('id');
      expect(result.answer![1].valueString).toBe('answer2');
    });

    it('should preserve qItem text when present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test item text'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [{ valueString: 'answer' }]
      };

      const result = removeInternalRepeatIdsRecursive(qItem, qrItem) as QuestionnaireResponseItem;

      expect(result.text).toBe('Test item text');
    });

    it('should handle empty answers correctly', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test item'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: []
      };

      const result = removeInternalRepeatIdsRecursive(qItem, qrItem) as QuestionnaireResponseItem;

      expect(result).toBeDefined();
      expect(result.linkId).toBe('test-item');
      expect(result).not.toHaveProperty('answer');
    });

    it('should filter out empty answers after removing ids', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test item'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [
          { id: 'internal-repeat-id-1', valueString: 'answer1' },
          { id: 'internal-repeat-id-2' }, // Only has id, should be filtered out
          { id: 'internal-repeat-id-3', valueString: 'answer3' }
        ]
      };

      const result = removeInternalRepeatIdsRecursive(qItem, qrItem) as QuestionnaireResponseItem;

      expect(result.answer).toHaveLength(2);
      expect(result.answer![0].valueString).toBe('answer1');
      expect(result.answer![1].valueString).toBe('answer3');
    });

    it('should handle nested items recursively', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'parent-group',
        type: 'group',
        text: 'Parent group',
        item: [
          {
            linkId: 'child-item',
            type: 'string',
            text: 'Child item'
          }
        ]
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'parent-group',
        item: [
          {
            linkId: 'child-item',
            answer: [{ id: 'internal-repeat-id', valueString: 'child answer' }]
          }
        ]
      };

      const result = removeInternalRepeatIdsRecursive(qItem, qrItem) as QuestionnaireResponseItem;

      expect(result).toBeDefined();
      expect(result.linkId).toBe('parent-group');
      expect(result.item).toHaveLength(1);
      expect(result.item![0].linkId).toBe('child-item');
      expect(result.item![0].answer![0]).not.toHaveProperty('id');
      expect(result.item![0].answer![0].valueString).toBe('child answer');
    });

    it('should handle repeat group arrays', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'repeat-group',
        type: 'group',
        text: 'Repeat group',
        item: [
          {
            linkId: 'child-item',
            type: 'string',
            text: 'Child item'
          }
        ]
      };

      const qrItems: QuestionnaireResponseItem[] = [
        {
          linkId: 'repeat-group',
          item: [
            {
              linkId: 'child-item',
              answer: [{ id: 'internal-repeat-id-1', valueString: 'first instance' }]
            }
          ]
        },
        {
          linkId: 'repeat-group',
          item: [
            {
              linkId: 'child-item',
              answer: [{ id: 'internal-repeat-id-2', valueString: 'second instance' }]
            }
          ]
        }
      ];

      const result = removeInternalRepeatIdsRecursive(qItem, qrItems) as QuestionnaireResponseItem[];

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      
      expect(result[0].linkId).toBe('repeat-group');
      expect(result[0].item![0].answer![0]).not.toHaveProperty('id');
      expect(result[0].item![0].answer![0].valueString).toBe('first instance');
      
      expect(result[1].linkId).toBe('repeat-group');
      expect(result[1].item![0].answer![0]).not.toHaveProperty('id');
      expect(result[1].item![0].answer![0].valueString).toBe('second instance');
    });

    it('should handle repeat group with no child items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'repeat-group',
        type: 'group',
        text: 'Repeat group'
        // no item property to cover line 77
      };

      const qrItems: QuestionnaireResponseItem[] = [
        {
          linkId: 'repeat-group'
        }
      ];

      const result = removeInternalRepeatIdsRecursive(qItem, qrItems);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0); // Should return empty array when no child items
    });

    it('should exclude null results from repeat group processing', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'repeat-group',
        type: 'group',
        text: 'Repeat group',
        item: [
          {
            linkId: 'child-item',
            type: 'string',
            text: 'Child item'
          }
        ]
      };

      const qrItems: QuestionnaireResponseItem[] = [
        {
          linkId: 'repeat-group',
          item: [
            {
              linkId: 'child-item',
              answer: [{ valueString: 'valid answer' }]
            }
          ]
        }
      ];

      const result = removeInternalRepeatIdsRecursive(qItem, qrItems) as QuestionnaireResponseItem[];

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeDefined();
      expect(result[0].linkId).toBe('repeat-group');
    });
  });
});
