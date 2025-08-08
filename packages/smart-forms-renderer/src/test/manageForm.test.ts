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
import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
// Import only the functions we can test easily
import { 
  destroyForm, 
  removeEmptyAnswersFromResponse, 
  removeInternalIdsFromResponse, 
  qrItemHasItemsOrAnswer 
} from '../utils/manageForm';

// Mock the store dependencies
jest.mock('../stores', () => ({
  questionnaireStore: {
    getState: jest.fn(() => ({
      destroySourceQuestionnaire: jest.fn()
    }))
  },
  questionnaireResponseStore: {
    getState: jest.fn(() => ({
      destroySourceResponse: jest.fn(),
      sourceResponse: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        id: 'test-response'
      }
    }))
  },
  smartConfigStore: {
    getState: jest.fn()
  },
  terminologyServerStore: {
    getState: jest.fn()
  }
}));

// Mock the utility dependencies
jest.mock('../utils/initialise', () => ({
  initialiseQuestionnaireResponse: jest.fn()
}));

jest.mock('../utils/removeEmptyAnswers', () => ({
  removeEmptyAnswersFromItemRecursive: jest.fn()
}));

jest.mock('../utils/removeRepeatId', () => ({
  removeInternalRepeatIdsRecursive: jest.fn()
}));

// Skip complex mocking for now

jest.mock('../utils/genericRecursive', () => ({
  updateQuestionnaireResponse: jest.fn()
}));

jest.mock('../api/smartClient', () => ({
  readEncounter: jest.fn(),
  readPatient: jest.fn(),
  readUser: jest.fn()
}));

import { questionnaireStore, questionnaireResponseStore } from '../stores';
import { removeEmptyAnswersFromItemRecursive } from '../utils/removeEmptyAnswers';
import { removeInternalRepeatIdsRecursive } from '../utils/removeRepeatId';
import { updateQuestionnaireResponse } from '../utils/genericRecursive';

const mockQuestionnaireStore = questionnaireStore as jest.Mocked<typeof questionnaireStore>;
const mockQuestionnaireResponseStore = questionnaireResponseStore as jest.Mocked<typeof questionnaireResponseStore>;
const mockRemoveEmptyAnswersFromItemRecursive = removeEmptyAnswersFromItemRecursive as jest.MockedFunction<typeof removeEmptyAnswersFromItemRecursive>;
const mockRemoveInternalRepeatIdsRecursive = removeInternalRepeatIdsRecursive as jest.MockedFunction<typeof removeInternalRepeatIdsRecursive>;
const mockUpdateQuestionnaireResponse = updateQuestionnaireResponse as jest.MockedFunction<typeof updateQuestionnaireResponse>;

describe('manageForm utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('destroyForm', () => {
    test('should call destroy methods on both stores', () => {
      const mockDestroyQuestionnaire = jest.fn();
      const mockDestroyResponse = jest.fn();

      mockQuestionnaireStore.getState.mockReturnValue({
        destroySourceQuestionnaire: mockDestroyQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        destroySourceResponse: mockDestroyResponse
      } as any);

      destroyForm();

      expect(mockDestroyQuestionnaire).toHaveBeenCalledTimes(1);
      expect(mockDestroyResponse).toHaveBeenCalledTimes(1);
    });
  });

  // Note: getResponse is complex to test due to structuredClone and store dependencies
  // TODO: Add test for getResponse when store mocking is improved

  describe('qrItemHasItemsOrAnswer', () => {
    test('should return true when qrItem has answer array with content', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: [{ valueString: 'test value' }]
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(true);
    });

    test('should return true when qrItem has item array with content', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-group',
        text: 'Test Group',
        item: [
          {
            linkId: 'child-item',
            text: 'Child Item'
          }
        ]
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(true);
    });

    test('should return false when qrItem has empty answer array', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: []
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });

    test('should return false when qrItem has empty item array', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-group',
        text: 'Test Group',
        item: []
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });

    test('should return false when qrItem has no answer or item properties', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item'
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });

    test('should return false when qrItem has undefined answer and item', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: undefined,
        item: undefined
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });
  });

  describe('removeEmptyAnswersFromResponse', () => {
    test('should process response through updateQuestionnaireResponse', () => {
      const questionnaire = {
        resourceType: 'Questionnaire' as const,
        status: 'active' as const
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      // Mock store state
      mockQuestionnaireStore.getState.mockReturnValue({
        enableWhenIsActivated: false,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      } as any);

      mockUpdateQuestionnaireResponse.mockReturnValue(response);

      const result = removeEmptyAnswersFromResponse(questionnaire, response);

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        questionnaire,
        response,
        removeEmptyAnswersFromItemRecursive,
        expect.objectContaining({
          enableWhenIsActivated: false,
          enableWhenItems: expect.any(Object),
          enableWhenExpressions: expect.any(Object)
        })
      );
      expect(result).toEqual(response);
    });

    test('should process response through updateQuestionnaireResponse when questionnaire has items', () => {
      const questionnaire = {
        resourceType: 'Questionnaire' as const,
        status: 'active' as const,
        item: [
          {
            linkId: 'test-item',
            type: 'string' as const,
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
            answer: [{ valueString: 'test' }]
          }
        ]
      };

      const processedResponse = {
        ...response,
        item: [
          {
            linkId: 'test-item',
            text: 'Test Item',
            answer: [{ valueString: 'processed test' }]
          }
        ]
      };

      mockUpdateQuestionnaireResponse.mockReturnValue(processedResponse);

      const result = removeEmptyAnswersFromResponse(questionnaire, response);

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        questionnaire,
        response,
        removeEmptyAnswersFromItemRecursive,
        expect.any(Object)
      );
      expect(result).toEqual(processedResponse);
    });
  });

  describe('removeInternalIdsFromResponse', () => {
    test('should process response and return structuredClone', () => {
      const questionnaire = {
        resourceType: 'Questionnaire' as const,
        status: 'active' as const
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };

      mockUpdateQuestionnaireResponse.mockReturnValue(response);

      const result = removeInternalIdsFromResponse(questionnaire, response);

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        questionnaire,
        response, // This should be the cloned version
        removeInternalRepeatIdsRecursive,
        undefined
      );
      expect(result).toEqual(response);
    });

    test('should process response through updateQuestionnaireResponse when questionnaire has items', () => {
      const questionnaire = {
        resourceType: 'Questionnaire' as const,
        status: 'active' as const,
        item: [
          {
            linkId: 'test-item',
            type: 'string' as const,
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
            answer: [{ valueString: 'test' }]
          }
        ]
      };

      const processedResponse = {
        ...response,
        item: [
          {
            linkId: 'test-item',
            text: 'Test Item',
            answer: [{ valueString: 'clean test' }]
          }
        ]
      };

      mockUpdateQuestionnaireResponse.mockReturnValue(processedResponse);

      const result = removeInternalIdsFromResponse(questionnaire, response);

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        questionnaire,
        response,
        removeInternalRepeatIdsRecursive,
        undefined
      );
      expect(result).toEqual(processedResponse);
    });
  });
});
