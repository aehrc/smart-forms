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

// Mock the dependencies before importing
jest.mock('@aehrc/smart-forms-renderer', () => ({
  buildForm: jest.fn(),
  destroyForm: jest.fn(),
  questionnaireStore: {
    getState: jest.fn()
  }
}));

jest.mock('../features/playground/stores/extractDebuggerStore.ts', () => ({
  extractDebuggerStore: {
    getState: jest.fn()
  }
}));

import { buildFormWrapper, destroyFormWrapper } from '../utils/manageForm';
import { buildForm, destroyForm, questionnaireStore } from '@aehrc/smart-forms-renderer';
import { extractDebuggerStore } from '../features/playground/stores/extractDebuggerStore';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

describe('manageForm', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'test-questionnaire'
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock questionnaireStore
    const mockQuestionnaireState = {
      destroySourceQuestionnaire: jest.fn()
    };
    (questionnaireStore.getState as jest.Mock).mockReturnValue(mockQuestionnaireState);

    // Mock extractDebuggerStore
    const mockExtractState = {
      resetStore: jest.fn()
    };
    (extractDebuggerStore.getState as jest.Mock).mockReturnValue(mockExtractState);
  });

  describe('buildFormWrapper', () => {
    it('should destroy previous questionnaire state before building new form', async () => {
      const mockBuildFormResult = { success: true };
      (buildForm as jest.Mock).mockResolvedValue(mockBuildFormResult);

      await buildFormWrapper(mockQuestionnaire);

      expect(questionnaireStore.getState).toHaveBeenCalled();
      expect(questionnaireStore.getState().destroySourceQuestionnaire).toHaveBeenCalled();
    });

    it('should pass all parameters to buildForm', async () => {
      const mockBuildFormResult = { success: true };
      (buildForm as jest.Mock).mockResolvedValue(mockBuildFormResult);

      const terminologyServerUrl = 'https://terminology.example.com';
      const additionalVariables = { test: 'value' };

      await buildFormWrapper(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        true,
        terminologyServerUrl,
        additionalVariables
      );

      expect(buildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        true,
        terminologyServerUrl,
        additionalVariables
      );
    });

    it('should return the result from buildForm', async () => {
      const mockBuildFormResult = { success: true, formData: 'test' };
      (buildForm as jest.Mock).mockResolvedValue(mockBuildFormResult);

      const result = await buildFormWrapper(mockQuestionnaire);

      expect(result).toEqual(mockBuildFormResult);
    });
  });

  describe('destroyFormWrapper', () => {
    it('should reset extract debugger store and call destroyForm', () => {
      const mockDestroyFormResult = { destroyed: true };
      (destroyForm as jest.Mock).mockReturnValue(mockDestroyFormResult);

      const result = destroyFormWrapper();

      expect(extractDebuggerStore.getState).toHaveBeenCalled();
      expect(extractDebuggerStore.getState().resetStore).toHaveBeenCalled();
      expect(destroyForm).toHaveBeenCalled();
      expect(result).toEqual(mockDestroyFormResult);
    });
  });
});
