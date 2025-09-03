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

import {
  postQuestionnaireToSMARTHealthIT,
  saveProgress,
  saveQuestionnaireResponse
} from '../../../api/saveQr';
import type Client from 'fhirclient/lib/Client';
import type { Questionnaire, QuestionnaireResponse, Patient, Practitioner } from 'fhir/r4';

// Mock the dependencies
jest.mock('../../../api/client.ts');
jest.mock('../../../api/headers.ts', () => ({
  HEADERS: {
    'Content-Type': 'application/fhir+json;charset=utf-8'
  }
}));
jest.mock('@aehrc/smart-forms-renderer', () => ({
  removeEmptyAnswersFromResponse: jest.fn((questionnaire, response) => response)
}));
jest.mock('../../../features/preview/utils/preview.ts', () => ({
  qrToHTML: jest.fn(() => '<div>Mock HTML</div>')
}));
jest.mock('../../../utils/humanName.ts', () => ({
  constructName: jest.fn(() => 'Mock Name')
}));
jest.mock('dayjs', () =>
  jest.fn(() => ({
    format: jest.fn(() => '2025-08-20T14:32:27+10:00')
  }))
);

import { fetchQuestionnaireById } from '../../../api/client';

describe('postQuestionnaireToSMARTHealthIT', () => {
  let mockClient: jest.Mocked<Client>;
  let mockQuestionnaire: Questionnaire;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      request: jest.fn()
    } as unknown as jest.Mocked<Client>;

    mockQuestionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      id: 'test-questionnaire'
    };
  });

  it('does nothing if questionnaire already exists', async () => {
    (fetchQuestionnaireById as jest.Mock).mockResolvedValue(mockQuestionnaire);

    postQuestionnaireToSMARTHealthIT(mockClient, mockQuestionnaire);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockClient.request).not.toHaveBeenCalled();
  });

  it('uploads questionnaire if it does not exist', async () => {
    (fetchQuestionnaireById as jest.Mock).mockRejectedValue(new Error('Not found'));
    mockClient.request.mockResolvedValue({});

    postQuestionnaireToSMARTHealthIT(mockClient, mockQuestionnaire);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockClient.request).toHaveBeenCalledWith({
      url: 'Questionnaire/test-questionnaire',
      method: 'PUT',
      body: JSON.stringify(mockQuestionnaire),
      headers: {
        'Content-Type': 'application/fhir+json;charset=utf-8'
      }
    });
  });

  it('handles upload failure gracefully', async () => {
    (fetchQuestionnaireById as jest.Mock).mockRejectedValue(new Error('Not found'));
    mockClient.request.mockRejectedValue(new Error('Upload failed'));

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    postQuestionnaireToSMARTHealthIT(mockClient, mockQuestionnaire);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error: Failed to POST questionnaire to SMART Health IT'
    );
    consoleSpy.mockRestore();
  });
});

describe('saveProgress', () => {
  let mockClient: jest.Mocked<Client>;
  let mockQuestionnaireResponse: QuestionnaireResponse;
  let mockPatient: Patient;
  let mockUser: Practitioner;
  let mockQuestionnaire: Questionnaire;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      request: jest.fn(),
      state: {
        serverUrl: 'https://fhir.example.com'
      }
    } as unknown as jest.Mocked<Client>;

    mockQuestionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      id: 'test-questionnaire'
    };

    mockQuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      id: 'test-response'
    };

    mockPatient = {
      resourceType: 'Patient',
      id: 'test-patient'
    };

    mockUser = {
      resourceType: 'Practitioner',
      id: 'test-practitioner'
    };
  });

  it('saves progress successfully', async () => {
    const mockSavedResponse = { ...mockQuestionnaireResponse, id: 'saved-id' };
    mockClient.request.mockResolvedValue(mockSavedResponse);

    const result = await saveProgress(
      mockClient,
      mockPatient,
      mockUser,
      mockQuestionnaire,
      mockQuestionnaireResponse,
      'in-progress'
    );

    expect(result).toEqual(mockSavedResponse);
  });

  it('handles save failure', async () => {
    const error = new Error('Save failed');
    mockClient.request.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await saveProgress(
      mockClient,
      mockPatient,
      mockUser,
      mockQuestionnaire,
      mockQuestionnaireResponse,
      'in-progress'
    );

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('saveQuestionnaireResponse', () => {
  let mockClient: jest.Mocked<Client>;
  let mockQuestionnaire: Questionnaire;
  let mockQuestionnaireResponse: QuestionnaireResponse;
  let mockPatient: Patient;
  let mockUser: Practitioner;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      request: jest.fn(),
      state: {
        serverUrl: 'https://fhir.example.com'
      }
    } as unknown as jest.Mocked<Client>;

    mockQuestionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      id: 'test-questionnaire'
    };

    mockQuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'test-response'
    };

    mockPatient = {
      resourceType: 'Patient',
      id: 'test-patient'
    };

    mockUser = {
      resourceType: 'Practitioner',
      id: 'test-practitioner'
    };
  });

  it('saves questionnaire response successfully with POST for new response', async () => {
    const mockQuestionnaireResponseWithoutId = {
      resourceType: 'QuestionnaireResponse' as const,
      status: 'completed' as const
    };

    const mockSavedResponse = { ...mockQuestionnaireResponseWithoutId, id: 'saved-id' };
    mockClient.request.mockResolvedValue(mockSavedResponse);

    const result = await saveQuestionnaireResponse(
      mockClient,
      mockPatient,
      mockUser,
      mockQuestionnaire,
      mockQuestionnaireResponseWithoutId
    );

    expect(mockClient.request).toHaveBeenCalledWith({
      url: 'QuestionnaireResponse',
      method: 'POST',
      body: expect.stringContaining('"resourceType":"QuestionnaireResponse"'),
      headers: {
        'Content-Type': 'application/fhir+json;charset=utf-8',
        prefer: 'return=representation'
      }
    });
    expect(result).toEqual(mockSavedResponse);
  });

  it('saves questionnaire response successfully with PUT for existing response', async () => {
    const mockSavedResponse = { ...mockQuestionnaireResponse, id: 'saved-id' };
    mockClient.request.mockResolvedValue(mockSavedResponse);

    const result = await saveQuestionnaireResponse(
      mockClient,
      mockPatient,
      mockUser,
      mockQuestionnaire,
      mockQuestionnaireResponse
    );

    expect(mockClient.request).toHaveBeenCalledWith({
      url: 'QuestionnaireResponse/test-response',
      method: 'PUT',
      body: expect.stringContaining('"resourceType":"QuestionnaireResponse"'),
      headers: {
        'Content-Type': 'application/fhir+json;charset=utf-8',
        prefer: 'return=representation'
      }
    });
    expect(result).toEqual(mockSavedResponse);
  });

  it('handles save failure', async () => {
    const error = new Error('Save failed');
    mockClient.request.mockRejectedValue(error);

    await expect(
      saveQuestionnaireResponse(
        mockClient,
        mockPatient,
        mockUser,
        mockQuestionnaire,
        mockQuestionnaireResponse
      )
    ).rejects.toThrow('Save failed');
  });
});
