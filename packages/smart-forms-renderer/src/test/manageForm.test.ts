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

import { beforeEach, describe, expect, jest } from '@jest/globals';
import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
// Import the functions to test
import {
  buildForm,
  destroyForm,
  getResponse,
  initialiseFhirClient,
  qrItemHasItemsOrAnswer,
  removeEmptyAnswersFromResponse,
  removeInternalIdsFromResponse
} from '../utils/manageForm';

// Import shared test data
import { patRepop } from '../../../sdc-populate/src/test-data-shared/patRepop';
import { pracPrimaryPeter } from '../../../sdc-populate/src/test-data-shared/pracPrimaryPeter';
import { encHealthCheck } from '../../../sdc-populate/src/test-data-shared/encHealthCheck';
import {
  questionnaireResponseStore,
  questionnaireStore,
  smartConfigStore,
  terminologyServerStore
} from '../stores';
import { removeEmptyAnswersFromItemRecursive } from '../utils/removeEmptyAnswers';
import { removeInternalRepeatIdsRecursive } from '../utils/removeRepeatId';
import { updateQuestionnaireResponse } from '../utils/genericRecursive';
import { initialiseQuestionnaireResponse } from '../utils/initialise';
import { readEncounter, readPatient, readUser } from '../api/smartClient';

// Mock the store dependencies
jest.mock('../stores', () => ({
  questionnaireStore: {
    getState: jest.fn(() => ({
      destroySourceQuestionnaire: jest.fn(),
      buildSourceQuestionnaire: jest.fn(),
      updateExpressions: jest.fn(),
      resetToFirstVisibleTab: jest.fn(),
      resetToFirstVisiblePage: jest.fn(),
      setFormAsReadOnly: jest.fn(),
      sourceQuestionnaire: {
        resourceType: 'Questionnaire',
        status: 'active'
      },
      targetConstraints: {},
      enableWhenIsActivated: false,
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
    }))
  },
  questionnaireResponseStore: {
    getState: jest.fn(() => ({
      destroySourceResponse: jest.fn(),
      buildSourceResponse: jest.fn(),
      updatableResponse: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        id: 'test-response'
      }
    }))
  },
  smartConfigStore: {
    getState: jest.fn(() => ({
      setClient: jest.fn(),
      setPatient: jest.fn(),
      setUser: jest.fn(),
      setEncounter: jest.fn()
    }))
  },
  rendererConfigStore: {
    getState: jest.fn(() => ({
      enableWhenIsReadOnly: false
    }))
  },
  terminologyServerStore: {
    getState: jest.fn(() => ({
      setUrl: jest.fn(),
      resetUrl: jest.fn()
    }))
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

// Mock a simple FHIR client for testing
const mockFhirClient = {
  read: jest.fn(),
  request: jest.fn(),
  patient: { read: jest.fn() },
  user: { read: jest.fn() },
  encounter: { read: jest.fn() }
};

jest.mock('../api/smartClient', () => ({
  readEncounter: jest.fn(),
  readPatient: jest.fn(),
  readUser: jest.fn()
}));

const mockQuestionnaireStore = questionnaireStore as jest.Mocked<typeof questionnaireStore>;
const mockQuestionnaireResponseStore = questionnaireResponseStore as jest.Mocked<
  typeof questionnaireResponseStore
>;
const mockSmartConfigStore = smartConfigStore as jest.Mocked<typeof smartConfigStore>;
const mockTerminologyServerStore = terminologyServerStore as jest.Mocked<
  typeof terminologyServerStore
>;
const mockRemoveInternalRepeatIdsRecursive =
  removeInternalRepeatIdsRecursive as jest.MockedFunction<typeof removeInternalRepeatIdsRecursive>;
const mockUpdateQuestionnaireResponse = updateQuestionnaireResponse as jest.MockedFunction<
  typeof updateQuestionnaireResponse
>;
const mockInitialiseQuestionnaireResponse = initialiseQuestionnaireResponse as jest.MockedFunction<
  typeof initialiseQuestionnaireResponse
>;
const mockReadEncounter = readEncounter as jest.MockedFunction<typeof readEncounter>;
const mockReadPatient = readPatient as jest.MockedFunction<typeof readPatient>;
const mockReadUser = readUser as jest.MockedFunction<typeof readUser>;

describe('manageForm utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildForm', () => {
    const mockQuestionnaire = {
      resourceType: 'Questionnaire' as const,
      status: 'active' as const,
      id: 'test-questionnaire',
      item: [
        {
          linkId: 'test-item',
          type: 'string' as const,
          text: 'Test Item'
        }
      ]
    };

    const mockQuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse' as const,
      status: 'in-progress' as const,
      id: 'test-response'
    };

    it('should build form with questionnaire only', async () => {
      const mockBuildSourceQuestionnaire = jest.fn();
      const mockBuildSourceResponse = jest.fn();
      const mockSetUrl = jest.fn();
      const mockResetUrl = jest.fn();

      mockQuestionnaireStore.getState.mockReturnValue({
        buildSourceQuestionnaire: mockBuildSourceQuestionnaire,
        updateExpressions: jest.fn(),
        resetToFirstVisibleTab: jest.fn(),
        resetToFirstVisiblePage: jest.fn()
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        buildSourceResponse: mockBuildSourceResponse
      } as any);

      mockTerminologyServerStore.getState.mockReturnValue({
        setUrl: mockSetUrl,
        resetUrl: mockResetUrl
      } as any);

      mockInitialiseQuestionnaireResponse.mockReturnValue(mockQuestionnaireResponse);

      await buildForm({ questionnaire: mockQuestionnaire });

      expect(mockResetUrl).toHaveBeenCalledTimes(1);
      expect(mockBuildSourceQuestionnaire).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        undefined
      );
      expect(mockInitialiseQuestionnaireResponse).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined
      );
      expect(mockBuildSourceResponse).toHaveBeenCalledWith(mockQuestionnaireResponse);
    });

    it('should build form with all optional parameters', async () => {
      const mockBuildSourceQuestionnaire = jest.fn();
      const mockBuildSourceResponse = jest.fn();
      const mockSetUrl = jest.fn();

      const terminologyServerUrl = 'https://terminology.server.com/fhir';
      const additionalContext = { testVar: 'testValue' };
      const qItemOverrideComponents = { 'test-item': jest.fn() };
      const sdcUiOverrideComponents = { text: jest.fn() };

      mockQuestionnaireStore.getState.mockReturnValue({
        buildSourceQuestionnaire: mockBuildSourceQuestionnaire,
        updateExpressions: jest.fn(),
        resetToFirstVisibleTab: jest.fn(),
        resetToFirstVisiblePage: jest.fn()
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        buildSourceResponse: mockBuildSourceResponse
      } as any);

      mockTerminologyServerStore.getState.mockReturnValue({
        setUrl: mockSetUrl
      } as any);

      mockInitialiseQuestionnaireResponse.mockReturnValue(mockQuestionnaireResponse);

      await buildForm({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockQuestionnaireResponse,
        readOnly: true,
        terminologyServerUrl,
        additionalContext,
        qItemOverrideComponents: qItemOverrideComponents as any,
        sdcUiOverrideComponents: sdcUiOverrideComponents as any
      });

      expect(mockSetUrl).toHaveBeenCalledWith(terminologyServerUrl);
      expect(mockBuildSourceQuestionnaire).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        additionalContext,
        terminologyServerUrl,
        true,
        qItemOverrideComponents,
        sdcUiOverrideComponents
      );
    });

    it('should handle terminology server URL correctly', async () => {
      const mockSetUrl = jest.fn();
      const mockResetUrl = jest.fn();

      mockTerminologyServerStore.getState.mockReturnValue({
        setUrl: mockSetUrl,
        resetUrl: mockResetUrl
      } as any);

      mockQuestionnaireStore.getState.mockReturnValue({
        buildSourceQuestionnaire: jest.fn(),
        updateExpressions: jest.fn(),
        resetToFirstVisibleTab: jest.fn(),
        resetToFirstVisiblePage: jest.fn()
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        buildSourceResponse: jest.fn()
      } as any);

      mockInitialiseQuestionnaireResponse.mockReturnValue(mockQuestionnaireResponse);

      // Test with terminology server URL
      await buildForm({
        questionnaire: mockQuestionnaire,
        terminologyServerUrl: 'https://test.server.com/fhir'
      });
      expect(mockSetUrl).toHaveBeenCalledWith('https://test.server.com/fhir');
      expect(mockResetUrl).not.toHaveBeenCalled();

      jest.clearAllMocks();

      // Test without terminology server URL
      await buildForm({ questionnaire: mockQuestionnaire });
      expect(mockResetUrl).toHaveBeenCalledTimes(1);
      expect(mockSetUrl).not.toHaveBeenCalled();
    });
  });

  describe('initialiseFhirClient', () => {
    it('should initialise FHIR client and set all resources', async () => {
      const mockSetClient = jest.fn();
      const mockSetPatient = jest.fn();
      const mockSetUser = jest.fn();
      const mockSetEncounter = jest.fn();

      mockSmartConfigStore.getState.mockReturnValue({
        setClient: mockSetClient,
        setPatient: mockSetPatient,
        setUser: mockSetUser,
        setEncounter: mockSetEncounter
      } as any);

      mockReadPatient.mockResolvedValue(patRepop as any);
      mockReadUser.mockResolvedValue(pracPrimaryPeter as any);
      mockReadEncounter.mockResolvedValue(encHealthCheck as any);

      await initialiseFhirClient(mockFhirClient as any);

      expect(mockSetClient).toHaveBeenCalledWith(mockFhirClient);
      expect(mockReadPatient).toHaveBeenCalledWith(expect.any(Object));
      expect(mockReadUser).toHaveBeenCalledWith(expect.any(Object));
      expect(mockReadEncounter).toHaveBeenCalledWith(expect.any(Object));
      expect(mockSetPatient).toHaveBeenCalledWith(patRepop);
      expect(mockSetUser).toHaveBeenCalledWith(pracPrimaryPeter);
      expect(mockSetEncounter).toHaveBeenCalledWith(encHealthCheck);
    });

    it('should handle Promise.all correctly even if some reads fail', async () => {
      const mockSetClient = jest.fn();
      const mockSetPatient = jest.fn();
      const mockSetUser = jest.fn();
      const mockSetEncounter = jest.fn();

      mockSmartConfigStore.getState.mockReturnValue({
        setClient: mockSetClient,
        setPatient: mockSetPatient,
        setUser: mockSetUser,
        setEncounter: mockSetEncounter
      } as any);

      const mockPatient = { resourceType: 'Patient' as const, id: 'test-patient' };
      mockReadPatient.mockResolvedValue(mockPatient as any);
      mockReadUser.mockResolvedValue(null as any);
      mockReadEncounter.mockResolvedValue(undefined as any);

      await initialiseFhirClient(mockFhirClient as any);

      expect(mockSetClient).toHaveBeenCalledWith(mockFhirClient);
      expect(mockSetPatient).toHaveBeenCalledWith(mockPatient);
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(mockSetEncounter).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getResponse', () => {
    it('should get response and clean internal IDs', () => {
      const mockSourceQuestionnaire = {
        resourceType: 'Questionnaire' as const,
        status: 'active' as const
      };

      const mockUpdatableResponse = {
        resourceType: 'QuestionnaireResponse' as const,
        status: 'in-progress' as const,
        id: 'test-response'
      };

      const mockCleanResponse = {
        resourceType: 'QuestionnaireResponse' as const,
        status: 'in-progress' as const,
        id: 'test-response-clean'
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockSourceQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockUpdatableResponse
      } as any);

      mockUpdateQuestionnaireResponse.mockReturnValue(mockCleanResponse);

      const result = getResponse();

      expect(mockUpdateQuestionnaireResponse).toHaveBeenCalledWith(
        mockSourceQuestionnaire,
        expect.any(Object), // structuredClone of updatableResponse
        mockRemoveInternalRepeatIdsRecursive,
        undefined
      );
      expect(result).toEqual(mockCleanResponse);
    });

    it('should return a clone of the response', () => {
      const mockSourceQuestionnaire = {
        resourceType: 'Questionnaire' as const,
        status: 'active' as const
      };

      const mockUpdatableResponse = {
        resourceType: 'QuestionnaireResponse' as const,
        status: 'in-progress' as const,
        id: 'test-response'
      };

      mockQuestionnaireStore.getState.mockReturnValue({
        sourceQuestionnaire: mockSourceQuestionnaire
      } as any);

      mockQuestionnaireResponseStore.getState.mockReturnValue({
        updatableResponse: mockUpdatableResponse
      } as any);

      mockUpdateQuestionnaireResponse.mockImplementation((q, qr) => qr);

      const result = getResponse();

      // The result should be a different object (cloned)
      expect(result).not.toBe(mockUpdatableResponse);
      expect(result).toEqual(mockUpdatableResponse);
    });
  });

  describe('destroyForm', () => {
    it('should call destroy methods on both stores', () => {
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

  describe('qrItemHasItemsOrAnswer', () => {
    it('should return true when qrItem has answer array with content', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: [{ valueString: 'test value' }]
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(true);
    });

    it('should return true when qrItem has item array with content', () => {
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

    it('should return false when qrItem has empty answer array', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: []
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });

    it('should return false when qrItem has empty item array', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-group',
        text: 'Test Group',
        item: []
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });

    it('should return false when qrItem has no answer or item properties', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item'
      };

      const result = qrItemHasItemsOrAnswer(qrItem);

      expect(result).toBe(false);
    });

    it('should return false when qrItem has undefined answer and item', () => {
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
    it('should process response through updateQuestionnaireResponse', () => {
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

    it('should process response through updateQuestionnaireResponse when questionnaire has items', () => {
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
    it('should process response and return structuredClone', () => {
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

    it('should process response through updateQuestionnaireResponse when questionnaire has items', () => {
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
