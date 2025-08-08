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

import { getQrItemsIndex, mapQItemsIndex } from '../utils/mapItem';
import type { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

// Mock the isRepeatItemAndNotCheckbox function
jest.mock('../utils/qItem', () => ({
  isRepeatItemAndNotCheckbox: jest.fn()
}));

import { isRepeatItemAndNotCheckbox } from '../utils/qItem';
const mockIsRepeatItemAndNotCheckbox = isRepeatItemAndNotCheckbox as jest.MockedFunction<
  typeof isRepeatItemAndNotCheckbox
>;

describe('mapItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapQItemsIndex', () => {
    it('should create a dictionary of linkId to index mapping for Questionnaire items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'item1', type: 'string', text: 'First item' },
          { linkId: 'item2', type: 'integer', text: 'Second item' },
          { linkId: 'item3', type: 'boolean', text: 'Third item' }
        ]
      };

      const result = mapQItemsIndex(questionnaire);

      expect(result).toEqual({
        item1: 0,
        item2: 1,
        item3: 2
      });
    });

    it('should create a dictionary of linkId to index mapping for QuestionnaireItem items', () => {
      const questionnaireItem: QuestionnaireItem = {
        linkId: 'parent',
        type: 'group',
        text: 'Parent group',
        item: [
          { linkId: 'child1', type: 'string', text: 'First child' },
          { linkId: 'child2', type: 'integer', text: 'Second child' }
        ]
      };

      const result = mapQItemsIndex(questionnaireItem);

      expect(result).toEqual({
        child1: 0,
        child2: 1
      });
    });

    it('should return empty object when no items are present', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const result = mapQItemsIndex(questionnaire);

      expect(result).toEqual({});
    });

    it('should return empty object when items array is empty', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const result = mapQItemsIndex(questionnaire);

      expect(result).toEqual({});
    });
  });

  describe('getQrItemsIndex', () => {
    const qItems: QuestionnaireItem[] = [
      { linkId: 'item1', type: 'string', text: 'First item' },
      { linkId: 'item2', type: 'group', text: 'Repeat group' },
      { linkId: 'item3', type: 'boolean', text: 'Third item' }
    ];

    const qItemsIndexMap: Record<string, number> = {
      item1: 0,
      item2: 1,
      item3: 2
    };

    it('should map single QuestionnaireResponseItems correctly', () => {
      const qrItems: QuestionnaireResponseItem[] = [
        { linkId: 'item1', answer: [{ valueString: 'test' }] },
        { linkId: 'item3', answer: [{ valueBoolean: true }] }
      ];

      mockIsRepeatItemAndNotCheckbox.mockReturnValue(false);

      const result = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe(qrItems[0]); // item1
      expect(result[1]).toBeUndefined(); // item2 - no corresponding qrItem
      expect(result[2]).toBe(qrItems[1]); // item3
    });

    it('should handle repeat groups correctly', () => {
      const qrItems: QuestionnaireResponseItem[] = [
        { linkId: 'item2', item: [{ linkId: 'child1', answer: [{ valueString: 'first instance' }] }] },
        { linkId: 'item2', item: [{ linkId: 'child1', answer: [{ valueString: 'second instance' }] }] }
      ];

      mockIsRepeatItemAndNotCheckbox.mockImplementation((qItem) => {
        return qItem.linkId === 'item2';
      });

      const result = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeUndefined(); // item1 - no corresponding qrItem
      expect(Array.isArray(result[1])).toBe(true); // item2 - repeat group as array
      expect((result[1] as QuestionnaireResponseItem[]).length).toBe(2);
      expect(result[2]).toBeUndefined(); // item3 - no corresponding qrItem
    });

    it('should convert single qrItem to array when it becomes a repeat group', () => {
      const qrItems: QuestionnaireResponseItem[] = [
        { linkId: 'item2', item: [{ linkId: 'child1', answer: [{ valueString: 'first instance' }] }] }
      ];

      // Mock to return true for item2 (indicating it's a repeat group)
      mockIsRepeatItemAndNotCheckbox.mockImplementation((qItem) => {
        return qItem.linkId === 'item2' && qItem.type === 'group';
      });

      const result = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

      expect(result[1]).toBeDefined();
      expect(Array.isArray(result[1])).toBe(true);
      expect((result[1] as QuestionnaireResponseItem[]).length).toBe(1);
    });

    it('should handle multiple qrItems with same linkId that start as single item', () => {
      const qrItems: QuestionnaireResponseItem[] = [
        { linkId: 'item1', answer: [{ valueString: 'first' }] },
        { linkId: 'item1', answer: [{ valueString: 'second' }] } // This creates the array scenario
      ];

      mockIsRepeatItemAndNotCheckbox.mockReturnValue(false);

      const result = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

      // The function should handle the case where storedValue is not initially an array
      expect(result[0]).toBeDefined();
      expect(Array.isArray(result[0])).toBe(true);
      expect((result[0] as QuestionnaireResponseItem[]).length).toBe(2);
    });

    it('should default repeat groups to empty arrays when no qrItems exist', () => {
      const qrItems: QuestionnaireResponseItem[] = [];

      mockIsRepeatItemAndNotCheckbox.mockImplementation((qItem) => {
        return qItem.linkId === 'item2' && qItem.type === 'group';
      });

      const result = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeUndefined(); // item1 - no qrItem, not repeat group
      expect(Array.isArray(result[1])).toBe(true); // item2 - repeat group gets empty array
      expect((result[1] as QuestionnaireResponseItem[]).length).toBe(0);
      expect(result[2]).toBeUndefined(); // item3 - no qrItem, not repeat group
    });
  });
});
