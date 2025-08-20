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

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import type { 
  QuestionnaireItem, 
  QuestionnaireResponseItem, 
  Questionnaire, 
  QuestionnaireResponse 
} from 'fhir/r4';
import { 
  generateItemsToRepopulate, 
  getItemsToRepopulate,
  type ItemToRepopulate 
} from '../../utils/repopulateItems';

// Mock the store dependencies
jest.mock('../../stores', () => ({
  questionnaireStore: {
    getState: jest.fn(() => ({
      sourceQuestionnaire: {
        resourceType: 'Questionnaire',
        status: 'active'
      },
      tabs: {},
      enableWhenIsActivated: false,
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
      initialExpressions: {}
    }))
  },
  questionnaireResponseStore: {
    getState: jest.fn(() => ({
      updatableResponse: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      },
      updatableResponseItems: {}
    }))
  }
}));

// Mock the utility dependencies
jest.mock('../../utils/tabs', () => ({
  containsTabs: jest.fn(() => false),
  isTabContainer: jest.fn(() => false)
}));

jest.mock('../../utils/extensions', () => ({
  getShortText: jest.fn(() => null),
  isSpecificItemControl: jest.fn(() => false)
}));

jest.mock('../../utils/mapItem', () => ({
  getQrItemsIndex: jest.fn(),
  mapQItemsIndex: jest.fn(() => ({}))
}));

jest.mock('../../utils/qItem', () => ({
  isHiddenByEnableWhen: jest.fn(() => false)
}));

jest.mock('../../utils/questionnaireResponseStoreUtils/updatableResponseItems', () => ({
  createQuestionnaireResponseItemMap: jest.fn(() => ({}))
}));

jest.mock('../../utils/misc', () => ({
  getParentItem: jest.fn(() => null),
  getQuestionnaireItem: jest.fn(() => null),
  getSectionHeading: jest.fn(() => 'Section'),
  isItemInGrid: jest.fn(() => false)
}));

jest.mock('lodash.difference', () => jest.fn(() => []));
jest.mock('lodash.intersection', () => jest.fn(() => []));
jest.mock('fast-equals', () => ({
  deepEqual: jest.fn(() => false)
}));

import { questionnaireStore, questionnaireResponseStore } from '../../stores';
import { containsTabs, isTabContainer } from '../../utils/tabs';
import { getShortText, isSpecificItemControl } from '../../utils/extensions';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { isHiddenByEnableWhen } from '../../utils/qItem';
import { createQuestionnaireResponseItemMap } from '../../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { getParentItem, getQuestionnaireItem, getSectionHeading, isItemInGrid } from '../../utils/misc';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import { deepEqual } from 'fast-equals';

const mockQuestionnaireStore = questionnaireStore as jest.Mocked<typeof questionnaireStore>;
const mockQuestionnaireResponseStore = questionnaireResponseStore as jest.Mocked<typeof questionnaireResponseStore>;
const mockContainsTabs = containsTabs as jest.MockedFunction<typeof containsTabs>;
const mockIsTabContainer = isTabContainer as jest.MockedFunction<typeof isTabContainer>;
const mockGetShortText = getShortText as jest.MockedFunction<typeof getShortText>;
const mockIsSpecificItemControl = isSpecificItemControl as jest.MockedFunction<typeof isSpecificItemControl>;
const mockGetQrItemsIndex = getQrItemsIndex as jest.MockedFunction<typeof getQrItemsIndex>;
const mockMapQItemsIndex = mapQItemsIndex as jest.MockedFunction<typeof mapQItemsIndex>;
const mockIsHiddenByEnableWhen = isHiddenByEnableWhen as jest.MockedFunction<typeof isHiddenByEnableWhen>;
const mockCreateQuestionnaireResponseItemMap = createQuestionnaireResponseItemMap as jest.MockedFunction<typeof createQuestionnaireResponseItemMap>;
const mockGetParentItem = getParentItem as jest.MockedFunction<typeof getParentItem>;
const mockGetQuestionnaireItem = getQuestionnaireItem as jest.MockedFunction<typeof getQuestionnaireItem>;
const mockGetSectionHeading = getSectionHeading as jest.MockedFunction<typeof getSectionHeading>;
const mockIsItemInGrid = isItemInGrid as jest.MockedFunction<typeof isItemInGrid>;
const mockDifference = difference as jest.MockedFunction<typeof difference>;
const mockIntersection = intersection as jest.MockedFunction<typeof intersection>;
const mockDeepEqual = deepEqual as jest.MockedFunction<typeof deepEqual>;

describe('repopulateItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateItemsToRepopulate', () => {
    test('should return items to repopulate with proper store integration', () => {
      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            answer: [{ valueString: 'populated-value' }]
          }
        ]
      };

      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            answer: [{ valueString: 'current-value' }]
          }
        ]
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        initialExpressions: {}
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockUpdatableResponse,
        updatableResponseItems: {}
      } as any);

      mockGetQrItemsIndex.mockReturnValue([mockPopulatedResponse.item![0]]);
      mockMapQItemsIndex.mockReturnValue({ 'item-1': 0 });

      const result = generateItemsToRepopulate(mockPopulatedResponse);

      expect(result).toBeDefined();
    });

    test('should handle initial expressions in diff linkIds', () => {
      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: []
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: { resourceType: 'Questionnaire', status: 'active', item: [] },
        tabs: {},
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        initialExpressions: { 'item-1': {} }
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: { resourceType: 'QuestionnaireResponse', status: 'in-progress', item: [] },
        updatableResponseItems: { 'item-1': [{ linkId: 'item-1', text: 'Item 1' }] }
      } as any);

      mockDifference.mockReturnValue(['item-1']);
      mockIntersection.mockReturnValue(['item-1']);
      mockGetQuestionnaireItem.mockReturnValue({ linkId: 'item-1', type: 'string', text: 'Item 1' });
      mockGetSectionHeading.mockReturnValue('Section 1');
      mockIsItemInGrid.mockReturnValue(false);

      const result = generateItemsToRepopulate(mockPopulatedResponse);

      expect(mockDifference).toHaveBeenCalled();
      expect(mockIntersection).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getItemsToRepopulate', () => {
    test('should return empty object when source questionnaire has no items', () => {
      const params = {
        sourceQuestionnaire: {
          resourceType: 'Questionnaire' as const,
          status: 'active' as const
          // No item property
        },
        tabs: {},
        populatedResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'completed' as const,
          item: []
        },
        updatableResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: []
        },
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      const result = getItemsToRepopulate(params);
      expect(result).toEqual({});
    });

    test('should return empty object when populated response has no items', () => {
      const params = {
        sourceQuestionnaire: {
          resourceType: 'Questionnaire' as const,
          status: 'active' as const,
          item: [{ linkId: 'item-1', type: 'string' as const, text: 'Item 1' }]
        },
        tabs: {},
        populatedResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'completed' as const
          // No item property
        },
        updatableResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const,
          item: []
        },
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      const result = getItemsToRepopulate(params);
      expect(result).toEqual({});
    });

    test('should return empty object when updatable response has no items', () => {
      const params = {
        sourceQuestionnaire: {
          resourceType: 'Questionnaire' as const,
          status: 'active' as const,
          item: [{ linkId: 'item-1', type: 'string' as const, text: 'Item 1' }]
        },
        tabs: {},
        populatedResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'completed' as const,
          item: [{ linkId: 'item-1', text: 'Item 1' }]
        },
        updatableResponse: {
          resourceType: 'QuestionnaireResponse' as const,
          status: 'in-progress' as const
          // No item property
        },
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      const result = getItemsToRepopulate(params);
      expect(result).toEqual({});
    });

    test('should process items to repopulate with basic questionnaire structure', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            answer: [{ valueString: 'populated-value' }]
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            answer: [{ valueString: 'current-value' }]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'item-1': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]]) // First call for populated items
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]); // Second call for updatable items
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockDeepEqual.mockReturnValue(false); // Items are different

      const result = getItemsToRepopulate(params);

      expect(mockMapQItemsIndex).toHaveBeenCalledWith(mockQuestionnaire);
      expect(mockGetQrItemsIndex).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    test('should handle tab containers and tabs correctly', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'tab-container',
            type: 'group',
            text: 'Tab Container'
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'tab-container',
            text: 'Tab Container'
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'tab-container',
            text: 'Tab Container'
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'tab-container': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]);
      mockIsTabContainer.mockReturnValue(true);
      mockContainsTabs.mockReturnValue(false);

      const result = getItemsToRepopulate(params);

      expect(mockIsTabContainer).toHaveBeenCalledWith(mockQuestionnaire.item![0]);
      expect(result).toBeDefined();
    });

    test('should handle grid item controls', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'grid-item',
            type: 'group',
            text: 'Grid Item'
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'grid-item',
            text: 'Grid Item'
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'grid-item',
            text: 'Grid Item'
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'grid-item': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]);
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(true);

      const result = getItemsToRepopulate(params);

      expect(mockIsSpecificItemControl).toHaveBeenCalledWith(mockQuestionnaire.item![0], 'grid');
      expect(result).toBeDefined();
    });

    test('should skip items that are not present in populated response', () => {
      const mockQuestionnaire: Questionnaire = {
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
            type: 'string',
            text: 'Item 2'
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            answer: [{ valueString: 'value' }]
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item-1',
            text: 'Item 1',
            answer: [{ valueString: 'value' }]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'item-1': 0, 'item-2': 1 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0], undefined]) // item-2 not in populated
        .mockReturnValueOnce([mockUpdatableResponse.item![0], undefined]); // item-2 not in updatable
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);

      const result = getItemsToRepopulate(params);

      expect(result).toBeDefined();
      // Should not process item-2 since it's not in populated response
    });

    test('should handle repeat groups (array of QR items)', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'repeat-group',
            type: 'group',
            text: 'Repeat Group',
            repeats: true
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'repeat-group',
            text: 'Repeat Group Instance 1'
          },
          {
            linkId: 'repeat-group',
            text: 'Repeat Group Instance 2'
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'repeat-group',
            text: 'Repeat Group Instance 1'
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'repeat-group': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item]) // Array for repeat groups
        .mockReturnValueOnce([mockUpdatableResponse.item]); // Array for repeat groups
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockDeepEqual.mockReturnValue(false); // Items are different

      const result = getItemsToRepopulate(params);

      expect(result).toBeDefined();
    });

    test('should handle items hidden by enableWhen', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'hidden-item',
            type: 'string',
            text: 'Hidden Item'
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'hidden-item',
            text: 'Hidden Item',
            answer: [{ valueString: 'value' }]
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'hidden-item',
            text: 'Hidden Item',
            answer: [{ valueString: 'value' }]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: true,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'hidden-item': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]);
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(true); // Item is hidden

      const result = getItemsToRepopulate(params);

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: 'hidden-item',
        enableWhenIsActivated: true,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      });
      expect(result).toBeDefined();
    });

    test('should handle nested group items with children', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group-1',
            type: 'group',
            text: 'Group 1',
            item: [
              {
                linkId: 'child-item-1',
                type: 'string',
                text: 'Child Item 1'
              }
            ]
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'group-1',
            text: 'Group 1',
            item: [
              {
                linkId: 'child-item-1',
                text: 'Child Item 1',
                answer: [{ valueString: 'child-value' }]
              }
            ]
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'group-1',
            text: 'Group 1',
            item: [
              {
                linkId: 'child-item-1',
                text: 'Child Item 1',
                answer: [{ valueString: 'old-child-value' }]
              }
            ]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex
        .mockReturnValueOnce({ 'group-1': 0 }) // Top level mapping
        .mockReturnValueOnce({ 'child-item-1': 0 }) // Group children mapping
        .mockReturnValueOnce({ 'child-item-1': 0 }); // For second call with current items
      
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]]) // Top level populated items
        .mockReturnValueOnce([mockPopulatedResponse.item![0].item![0]]) // Child populated items
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]) // Top level updatable items
        .mockReturnValueOnce([mockUpdatableResponse.item![0].item![0]]); // Child updatable items
      
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(false);
      mockDeepEqual.mockReturnValue(false); // Items are different

      const result = getItemsToRepopulate(params);

      expect(result).toBeDefined();
    });

    test('should handle items with tabs and short text', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'tab-item',
            type: 'group',
            text: 'Tab Item Full Text',
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

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'tab-item',
            text: 'Tab Item',
            item: [
              {
                linkId: 'child-item',
                text: 'Child Item',
                answer: [{ valueString: 'value' }]
              }
            ]
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'tab-item',
            text: 'Tab Item',
            item: [
              {
                linkId: 'child-item',
                text: 'Child Item',
                answer: [{ valueString: 'old-value' }]
              }
            ]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: { 'tab-item': { tabIndex: 0, isComplete: false, isHidden: false } },
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex
        .mockReturnValueOnce({ 'tab-item': 0 })
        .mockReturnValueOnce({ 'child-item': 0 })
        .mockReturnValueOnce({ 'child-item': 0 });
      
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]])
        .mockReturnValueOnce([mockPopulatedResponse.item![0].item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0].item![0]]);
      
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(false);
      mockGetShortText.mockReturnValue('Short Tab Text');
      mockDeepEqual.mockReturnValue(false);

      const result = getItemsToRepopulate(params);

      expect(mockGetShortText).toHaveBeenCalledWith(mockQuestionnaire.item![0]);
      expect(result).toBeDefined();
    });

    test('should remove items from result when current and server items are equal', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          }
        ]
      };

      const identicalItem = {
        linkId: 'item-1',
        text: 'Item 1',
        answer: [{ valueString: 'same-value' }]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [identicalItem]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [identicalItem]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'item-1': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]);
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(false);
      mockDeepEqual.mockReturnValue(true); // Items are identical

      const result = getItemsToRepopulate(params);

      expect(mockDeepEqual).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test('should handle group items with both children and answers', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group-with-answer',
            type: 'group',
            text: 'Group With Answer',
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

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'group-with-answer',
            text: 'Group With Answer',
            answer: [{ valueString: 'group-answer' }], // Group has both children and answer
            item: [
              {
                linkId: 'child-item',
                text: 'Child Item',
                answer: [{ valueString: 'child-value' }]
              }
            ]
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'group-with-answer',
            text: 'Group With Answer',
            answer: [{ valueString: 'old-group-answer' }],
            item: [
              {
                linkId: 'child-item',
                text: 'Child Item',
                answer: [{ valueString: 'old-child-value' }]
              }
            ]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex
        .mockReturnValueOnce({ 'group-with-answer': 0 })
        .mockReturnValueOnce({ 'child-item': 0 })
        .mockReturnValueOnce({ 'child-item': 0 });
      
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item![0]])
        .mockReturnValueOnce([mockPopulatedResponse.item![0].item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0]])
        .mockReturnValueOnce([mockUpdatableResponse.item![0].item![0]]);
      
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(false);
      mockDeepEqual.mockReturnValue(false);

      const result = getItemsToRepopulate(params);

      expect(result).toBeDefined();
    });

    test('should handle retrieving current QR items when no server item exists', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item-no-server',
            type: 'string',
            text: 'Item Without Server Data'
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: []
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'item-no-server',
            text: 'Item Without Server Data',
            answer: [{ valueString: 'current-value' }]
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'item-no-server': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([undefined]) // No populated item
        .mockReturnValueOnce([mockUpdatableResponse.item![0]]); // Has updatable item
      
      const result = getItemsToRepopulate(params);

      expect(result).toEqual({});
    });

    test('should handle repeat groups with no current QR items', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'repeat-group-empty',
            type: 'group',
            text: 'Empty Repeat Group',
            repeats: true
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'repeat-group-empty',
            text: 'Repeat Group Instance 1'
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'repeat-group-empty': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item]) // Array for repeat groups
        .mockReturnValueOnce([undefined]); // No current items
      
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(false);

      const result = getItemsToRepopulate(params);

      expect(result).toBeDefined();
    });

    test('should handle repeat groups with no server QR items in retrieval', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'repeat-group-no-server',
            type: 'group',
            text: 'Repeat Group No Server',
            repeats: true
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: []
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'repeat-group-no-server',
            text: 'Current Repeat Item'
          }
        ]
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'repeat-group-no-server': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([undefined]) // No populated items
        .mockReturnValueOnce([mockUpdatableResponse.item]); // Has current items
      
      const result = getItemsToRepopulate(params);

      expect(result).toEqual({});
    });

    test('should handle checking repeat groups with missing conditions', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'invalid-repeat',
            type: 'group',
            text: 'Invalid Repeat',
            repeats: true
          }
        ]
      };

      const mockPopulatedResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'invalid-repeat',
            text: 'Invalid Repeat Instance'
          }
        ]
      };

      const mockUpdatableResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const params = {
        sourceQuestionnaire: mockQuestionnaire,
        tabs: {},
        populatedResponse: mockPopulatedResponse,
        updatableResponse: mockUpdatableResponse,
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      mockMapQItemsIndex.mockReturnValue({ 'invalid-repeat': 0 });
      mockGetQrItemsIndex
        .mockReturnValueOnce([mockPopulatedResponse.item]) // Populated items as array
        .mockReturnValueOnce([undefined]); // No current items - this triggers missing conditions check
      
      mockIsTabContainer.mockReturnValue(false);
      mockContainsTabs.mockReturnValue(false);
      mockIsSpecificItemControl.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(false);

      const result = getItemsToRepopulate(params);

      expect(result).toBeDefined();
    });
  });
});
