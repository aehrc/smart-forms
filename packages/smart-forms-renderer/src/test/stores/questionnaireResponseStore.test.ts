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

import { questionnaireResponseStore } from '../../stores/questionnaireResponseStore';
import { questionnaireStore } from '../../stores/questionnaireStore';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { emptyQuestionnaire, emptyResponse } from '../../utils/emptyResource';
import { validateForm } from '../../utils/validate';
import { createQuestionnaireResponseItemMap } from '../../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { generateUniqueId } from '../../utils/extractObservation';

// Mock dependencies
jest.mock('../../utils/validate');
jest.mock('../../utils/questionnaireResponseStoreUtils/updatableResponseItems');
jest.mock('../../utils/extractObservation');

const mockValidateForm = validateForm as jest.MockedFunction<typeof validateForm>;
const mockCreateQuestionnaireResponseItemMap =
  createQuestionnaireResponseItemMap as jest.MockedFunction<
    typeof createQuestionnaireResponseItemMap
  >;
const mockGenerateUniqueId = generateUniqueId as jest.MockedFunction<typeof generateUniqueId>;

describe('questionnaireResponseStore', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'test-questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question'
      }
    ]
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'test-response',
    status: 'in-progress',
    questionnaire: 'test-questionnaire',
    item: [
      {
        linkId: 'test-item',
        answer: [{ valueString: 'test answer' }]
      }
    ]
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockValidateForm.mockReturnValue({});
    mockCreateQuestionnaireResponseItemMap.mockReturnValue({});
    mockGenerateUniqueId.mockReturnValue('QR-unique-id');

    // Reset stores to initial state
    questionnaireStore.setState({
      sourceQuestionnaire: structuredClone(emptyQuestionnaire)
    });

    questionnaireResponseStore.setState({
      key: 'QR-initial-key',
      sourceResponse: structuredClone(emptyResponse),
      updatableResponse: structuredClone(emptyResponse),
      updatableResponseItems: {},
      formChangesHistory: [],
      invalidItems: {},
      requiredItemsIsHighlighted: false,
      responseIsValid: true
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = questionnaireResponseStore.getState();

      expect(state.key).toBe('QR-initial-key');
      expect(state.sourceResponse).toEqual(emptyResponse);
      expect(state.updatableResponse).toEqual(emptyResponse);
      expect(state.updatableResponseItems).toEqual({});
      expect(state.formChangesHistory).toEqual([]);
      expect(state.invalidItems).toEqual({});
      expect(state.requiredItemsIsHighlighted).toBe(false);
      expect(state.responseIsValid).toBe(true);
    });
  });

  describe('validateResponse', () => {
    it('should validate response and update invalid items', () => {
      const mockInvalidItems = {
        'test-item': { resourceType: 'OperationOutcome' as const, issue: [] }
      };
      mockValidateForm.mockReturnValue(mockInvalidItems);

      questionnaireResponseStore
        .getState()
        .validateResponse(mockQuestionnaire, mockQuestionnaireResponse);

      expect(mockValidateForm).toHaveBeenCalledWith(mockQuestionnaire, mockQuestionnaireResponse);

      const state = questionnaireResponseStore.getState();
      expect(state.invalidItems).toBe(mockInvalidItems);
      expect(state.responseIsValid).toBe(false);
    });

    it('should set responseIsValid to true when no invalid items', () => {
      mockValidateForm.mockReturnValue({});

      questionnaireResponseStore
        .getState()
        .validateResponse(mockQuestionnaire, mockQuestionnaireResponse);

      const state = questionnaireResponseStore.getState();
      expect(state.invalidItems).toEqual({});
      expect(state.responseIsValid).toBe(true);
    });
  });

  describe('buildSourceResponse', () => {
    beforeEach(() => {
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire
      });
    });

    it('should build source response with provided questionnaire response', () => {
      const mockResponseItemMap = { 'test-item': [] };
      mockCreateQuestionnaireResponseItemMap.mockReturnValue(mockResponseItemMap);
      mockGenerateUniqueId.mockReturnValue('QR-new-key');

      questionnaireResponseStore.getState().buildSourceResponse(mockQuestionnaireResponse);

      expect(mockCreateQuestionnaireResponseItemMap).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse
      );
      expect(mockValidateForm).toHaveBeenCalledWith(mockQuestionnaire, mockQuestionnaireResponse);

      const state = questionnaireResponseStore.getState();
      expect(state.key).toBe('QR-new-key');
      expect(state.sourceResponse).toBe(mockQuestionnaireResponse);
      expect(state.updatableResponse).toBe(mockQuestionnaireResponse);
      expect(state.updatableResponseItems).toBe(mockResponseItemMap);
      expect(state.requiredItemsIsHighlighted).toBe(false);
    });

    it('should handle validation errors during build', () => {
      const mockInvalidItems = {
        'test-item': { resourceType: 'OperationOutcome' as const, issue: [] }
      };
      mockValidateForm.mockReturnValue(mockInvalidItems);

      questionnaireResponseStore.getState().buildSourceResponse(mockQuestionnaireResponse);

      const state = questionnaireResponseStore.getState();
      expect(state.invalidItems).toBe(mockInvalidItems);
      expect(state.responseIsValid).toBe(false);
    });
  });

  describe('updateResponse', () => {
    beforeEach(() => {
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire
      });

      questionnaireResponseStore.setState({
        updatableResponse: structuredClone(emptyResponse),
        formChangesHistory: []
      });
    });

    it('should update response and add to history', () => {
      const mockResponseItemMap = { 'test-item': [] };
      mockCreateQuestionnaireResponseItemMap.mockReturnValue(mockResponseItemMap);

      questionnaireResponseStore.getState().updateResponse(mockQuestionnaireResponse, false);

      expect(mockCreateQuestionnaireResponseItemMap).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse
      );

      const state = questionnaireResponseStore.getState();
      expect(state.updatableResponse).toBe(mockQuestionnaireResponse);
      expect(state.updatableResponseItems).toBe(mockResponseItemMap);
      expect(state.formChangesHistory.length).toBe(1);
    });

    it('should validate updated response', () => {
      const mockInvalidItems = {
        'test-item': { resourceType: 'OperationOutcome' as const, issue: [] }
      };
      mockValidateForm.mockReturnValue(mockInvalidItems);

      questionnaireResponseStore.getState().updateResponse(mockQuestionnaireResponse, false);

      expect(mockValidateForm).toHaveBeenCalledWith(mockQuestionnaire, mockQuestionnaireResponse);

      const state = questionnaireResponseStore.getState();
      expect(state.invalidItems).toBe(mockInvalidItems);
      expect(state.responseIsValid).toBe(false);
    });
  });

  describe('setUpdatableResponseAsSaved', () => {
    beforeEach(() => {
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire
      });
    });

    it('should set saved response and reset history', () => {
      const mockResponseItemMap = { 'test-item': [] };
      mockCreateQuestionnaireResponseItemMap.mockReturnValue(mockResponseItemMap);
      mockGenerateUniqueId.mockReturnValue('QR-saved-key');

      questionnaireResponseStore.getState().setUpdatableResponseAsSaved(mockQuestionnaireResponse);

      expect(mockCreateQuestionnaireResponseItemMap).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse
      );

      const state = questionnaireResponseStore.getState();
      expect(state.key).toBe('QR-saved-key');
      expect(state.sourceResponse).toBe(mockQuestionnaireResponse);
      expect(state.updatableResponse).toBe(mockQuestionnaireResponse);
      expect(state.updatableResponseItems).toBe(mockResponseItemMap);
      expect(state.formChangesHistory).toEqual([]);
    });
  });

  describe('setUpdatableResponseAsEmpty', () => {
    beforeEach(() => {
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire
      });
    });

    it('should set empty response and reset history', () => {
      const mockResponseItemMap = { 'test-item': [] };
      mockCreateQuestionnaireResponseItemMap.mockReturnValue(mockResponseItemMap);

      const clearedResponse = structuredClone(emptyResponse);
      questionnaireResponseStore.getState().setUpdatableResponseAsEmpty(clearedResponse);

      expect(mockCreateQuestionnaireResponseItemMap).toHaveBeenCalledWith(
        mockQuestionnaire,
        clearedResponse
      );

      const state = questionnaireResponseStore.getState();
      expect(state.updatableResponse).toBe(clearedResponse);
      expect(state.updatableResponseItems).toBe(mockResponseItemMap);
      expect(state.formChangesHistory).toEqual([]);
      expect(state.requiredItemsIsHighlighted).toBe(false);
    });
  });

  describe('destroySourceResponse', () => {
    beforeEach(() => {
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire
      });

      // Set some state to destroy
      questionnaireResponseStore.setState({
        key: 'old-key',
        sourceResponse: mockQuestionnaireResponse,
        updatableResponse: mockQuestionnaireResponse,
        updatableResponseItems: { 'test-item': [] },
        formChangesHistory: [null],
        invalidItems: { 'test-item': { resourceType: 'OperationOutcome' as const, issue: [] } },
        requiredItemsIsHighlighted: true,
        responseIsValid: false
      });
    });

    it('should reset all response state to initial values', () => {
      const mockResponseItemMap = {};
      mockCreateQuestionnaireResponseItemMap.mockReturnValue(mockResponseItemMap);
      mockGenerateUniqueId.mockReturnValue('QR-destroyed-key');

      questionnaireResponseStore.getState().destroySourceResponse();

      expect(mockCreateQuestionnaireResponseItemMap).toHaveBeenCalledWith(
        mockQuestionnaire,
        expect.any(Object)
      );

      const state = questionnaireResponseStore.getState();
      expect(state.key).toBe('QR-destroyed-key');
      expect(state.sourceResponse).toEqual(emptyResponse);
      expect(state.updatableResponse).toEqual(emptyResponse);
      expect(state.updatableResponseItems).toBe(mockResponseItemMap);
      expect(state.formChangesHistory).toEqual([]);
      expect(state.invalidItems).toEqual({});
      expect(state.requiredItemsIsHighlighted).toBe(false);
      expect(state.responseIsValid).toBe(true);
    });
  });

  describe('highlightRequiredItems', () => {
    it('should set requiredItemsIsHighlighted to true', () => {
      expect(questionnaireResponseStore.getState().requiredItemsIsHighlighted).toBe(false);

      questionnaireResponseStore.getState().highlightRequiredItems();

      expect(questionnaireResponseStore.getState().requiredItemsIsHighlighted).toBe(true);
    });

    it('should remain true if already highlighted', () => {
      questionnaireResponseStore.setState({ requiredItemsIsHighlighted: true });

      questionnaireResponseStore.getState().highlightRequiredItems();

      expect(questionnaireResponseStore.getState().requiredItemsIsHighlighted).toBe(true);
    });
  });

  describe('store subscription', () => {
    it('should notify subscribers when state changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = questionnaireResponseStore.subscribe(mockSubscriber);

      questionnaireResponseStore.getState().highlightRequiredItems();

      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });
  });
});
