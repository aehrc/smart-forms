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
import { repopulateResponse } from '../../utils/repopulateIntoResponse';
import type { ItemToRepopulate } from '../../utils/repopulateItems';

// Note: This test file uses mock data to test repopulation logic
// Shared test data from sdc-populate can be used in integration tests if needed

// Mock the store dependencies
jest.mock('../../stores', () => ({
  questionnaireStore: {
    getState: jest.fn(() => ({
      sourceQuestionnaire: {
        resourceType: 'Questionnaire',
        status: 'active'
      }
    }))
  },
  questionnaireResponseStore: {
    getState: jest.fn(() => ({
      updatableResponse: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      }
    }))
  }
}));

// Mock the utility dependencies
jest.mock('../../utils/mapItem', () => ({
  getQrItemsIndex: jest.fn(),
  mapQItemsIndex: jest.fn()
}));

jest.mock('../../utils/genericRecursive', () => ({
  updateQuestionnaireResponse: jest.fn()
}));

import { questionnaireStore, questionnaireResponseStore } from '../../stores';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { updateQuestionnaireResponse } from '../../utils/genericRecursive';

const mockQuestionnaireStore = questionnaireStore as jest.Mocked<typeof questionnaireStore>;
const mockQuestionnaireResponseStore = questionnaireResponseStore as jest.Mocked<
  typeof questionnaireResponseStore
>;
const mockGetQrItemsIndex = getQrItemsIndex as jest.MockedFunction<typeof getQrItemsIndex>;
const mockMapQItemsIndex = mapQItemsIndex as jest.MockedFunction<typeof mapQItemsIndex>;
const mockUpdateQuestionnaireResponse = updateQuestionnaireResponse as jest.MockedFunction<
  typeof updateQuestionnaireResponse
>;

describe('repopulateIntoResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('repopulateResponse', () => {
    it('should call updateQuestionnaireResponse with correct parameters', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        id: 'test-questionnaire'
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        id: 'test-response'
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {
        'test-item': {
          qItem: {
            linkId: 'test-item',
            type: 'string',
            text: 'Test Item'
          },
          sectionItemText: 'Section 1',
          parentItemText: 'Parent Item',
          isInGrid: false,
          serverQRItem: {
            linkId: 'test-item',
            text: 'Test Item',
            answer: [{ valueString: 'server value' }]
          }
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      mockUpdateQuestionnaireResponse.mockReturnValue(mockQuestionnaireResponse);

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        expect.any(Function), // repopulateItemRecursive function
        filteredItemsToRepopulate
      );
      expect(result).toEqual(mockQuestionnaireResponse);
    });

    it('should handle empty filteredItemsToRepopulate', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      mockUpdateQuestionnaireResponse.mockReturnValue(mockQuestionnaireResponse);

      const result = repopulateResponse({});

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        expect.any(Function),
        {}
      );
      expect(result).toEqual(mockQuestionnaireResponse);
    });
  });

  describe('repopulateItemRecursive (via integration tests)', () => {
    it('should handle single item with repopulation data', () => {
      const mockQuestionnaire: Questionnaire = {
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

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'test-item',
            text: 'Test Item',
            answer: [{ valueString: 'current value' }]
          }
        ]
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {
        'test-item': {
          qItem: {
            linkId: 'test-item',
            type: 'string',
            text: 'Test Item'
          },
          sectionItemText: 'Section 1',
          parentItemText: null,
          isInGrid: false,
          serverQRItem: {
            linkId: 'test-item',
            text: 'Test Item',
            answer: [{ valueString: 'server value' }]
          }
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      // Mock the actual implementation since we're testing the recursive function
      mockUpdateQuestionnaireResponse.mockImplementation((q, qr, recursiveFn, data) => {
        if (q.item && qr.item) {
          const updatedItems = q.item.map((qItem, index) => {
            const qrItem = qr.item![index];
            return recursiveFn(qItem, qrItem, data);
          });
          return {
            ...qr,
            item: updatedItems.filter((item) => item !== null)
          } as any;
        }
        return qr;
      });

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(result.item).toBeDefined();
      expect(result.item![0]).toEqual({
        linkId: 'test-item',
        text: 'Test Item',
        answer: [{ valueString: 'server value' }]
      });
    });

    it('should handle group item with children', () => {
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
              },
              {
                linkId: 'child-item-2',
                type: 'string',
                text: 'Child Item 2'
              }
            ]
          }
        ]
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
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
                answer: [{ valueString: 'current value 1' }]
              },
              {
                linkId: 'child-item-2',
                text: 'Child Item 2',
                answer: [{ valueString: 'current value 2' }]
              }
            ]
          }
        ]
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {
        'child-item-1': {
          qItem: {
            linkId: 'child-item-1',
            type: 'string',
            text: 'Child Item 1'
          },
          sectionItemText: 'Group 1',
          parentItemText: 'Group 1',
          isInGrid: false,
          serverQRItem: {
            linkId: 'child-item-1',
            text: 'Child Item 1',
            answer: [{ valueString: 'server value 1' }]
          }
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      mockMapQItemsIndex.mockReturnValue({ 'child-item-1': 0, 'child-item-2': 1 });
      mockGetQrItemsIndex.mockReturnValue([
        mockQuestionnaireResponse.item![0].item![0],
        mockQuestionnaireResponse.item![0].item![1]
      ] as any);

      // Mock the recursive implementation for group handling
      mockUpdateQuestionnaireResponse.mockImplementation((q, qr, recursiveFn, data) => {
        if (q.item && qr.item) {
          const updatedItems = q.item.map((qItem, index) => {
            const qrItem = qr.item![index];
            return recursiveFn(qItem, qrItem, data);
          });
          return {
            ...qr,
            item: updatedItems.filter((item) => item !== null)
          } as any;
        }
        return qr;
      });

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(result.item).toBeDefined();
      expect(result.item![0].linkId).toBe('group-1');
      expect(result.item![0].item).toBeDefined();
    });

    it('should handle repeat groups', () => {
      const mockQuestionnaire: Questionnaire = {
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

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'repeat-group',
            text: 'Repeat Group',
            answer: [{ valueString: 'instance 1' }]
          },
          {
            linkId: 'repeat-group',
            text: 'Repeat Group',
            answer: [{ valueString: 'instance 2' }]
          }
        ]
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {
        'repeat-group': {
          qItem: {
            linkId: 'repeat-group',
            type: 'group',
            text: 'Repeat Group',
            repeats: true
          },
          sectionItemText: 'Repeat Group',
          parentItemText: null,
          isInGrid: false,
          serverQRItems: [
            {
              linkId: 'repeat-group',
              text: 'Repeat Group',
              answer: [{ valueString: 'server instance 1' }]
            },
            {
              linkId: 'repeat-group',
              text: 'Repeat Group',
              answer: [{ valueString: 'server instance 2' }]
            },
            {
              linkId: 'repeat-group',
              text: 'Repeat Group',
              answer: [{ valueString: 'server instance 3' }]
            }
          ]
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      // Mock for repeat group handling
      mockUpdateQuestionnaireResponse.mockImplementation((q, qr, recursiveFn, data) => {
        if (q.item && qr.item) {
          // Simulate repeat group processing
          const qItem = q.item[0];
          const qrItems = qr.item;
          const result = recursiveFn(qItem, qrItems, data);
          return {
            ...qr,
            item: Array.isArray(result) ? result : [result].filter((item) => item !== null)
          } as any;
        }
        return qr;
      });

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(result.item).toBeDefined();
      expect(Array.isArray(result.item)).toBe(true);
    });

    it('should handle items without repopulation data', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'no-repop-item',
            type: 'string',
            text: 'No Repop Item'
          }
        ]
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'no-repop-item',
            text: 'No Repop Item',
            answer: [{ valueString: 'current value' }]
          }
        ]
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {};

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      mockUpdateQuestionnaireResponse.mockImplementation((q, qr, recursiveFn, data) => {
        if (q.item && qr.item) {
          const updatedItems = q.item.map((qItem, index) => {
            const qrItem = qr.item![index];
            return recursiveFn(qItem, qrItem, data);
          });
          return {
            ...qr,
            item: updatedItems.filter((item) => item !== null)
          } as any;
        }
        return qr;
      });

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(result.item).toBeDefined();
      expect(result.item![0]).toEqual({
        linkId: 'no-repop-item',
        text: 'No Repop Item',
        answer: [{ valueString: 'current value' }]
      });
    });

    it('should handle null qrItem with repopulation data', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'new-item',
            type: 'string',
            text: 'New Item'
          }
        ]
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {
        'new-item': {
          qItem: {
            linkId: 'new-item',
            type: 'string',
            text: 'New Item'
          },
          sectionItemText: 'Section 1',
          parentItemText: null,
          isInGrid: false,
          serverQRItem: {
            linkId: 'new-item',
            text: 'New Item',
            answer: [{ valueString: 'server value' }]
          }
        }
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      mockUpdateQuestionnaireResponse.mockImplementation((q, qr, recursiveFn, data) => {
        if (q.item) {
          const updatedItems = q.item.map((qItem) => {
            return recursiveFn(qItem, null, data);
          });
          return {
            ...qr,
            item: updatedItems.filter((item) => item !== null)
          } as any;
        }
        return qr;
      });

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(result.item).toBeDefined();
      expect(result.item![0]).toEqual({
        linkId: 'new-item',
        text: 'New Item',
        answer: [{ valueString: 'server value' }]
      });
    });

    it('should handle empty group with no children', () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'empty-group',
            type: 'group',
            text: 'Empty Group',
            item: []
          }
        ]
      };

      const mockQuestionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'empty-group',
            text: 'Empty Group',
            item: []
          }
        ]
      };

      const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {};

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockQuestionnaireResponse
      } as any);

      mockMapQItemsIndex.mockReturnValue({});
      mockGetQrItemsIndex.mockReturnValue([] as any);

      mockUpdateQuestionnaireResponse.mockImplementation((q, qr, recursiveFn, data) => {
        if (q.item && qr.item) {
          const updatedItems = q.item.map((qItem, index) => {
            const qrItem = qr.item![index];
            return recursiveFn(qItem, qrItem, data);
          });
          return {
            ...qr,
            item: updatedItems.filter((item) => item !== null)
          } as any;
        }
        return qr;
      });

      const result = repopulateResponse(filteredItemsToRepopulate);

      expect(result.item).toBeDefined();
      expect(result.item!.length).toBe(1);
      expect(result.item![0].linkId).toBe('empty-group');
      expect(result.item![0].item).toEqual([]);
    });
  });
});
