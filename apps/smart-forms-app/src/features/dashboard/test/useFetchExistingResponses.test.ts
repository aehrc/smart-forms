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

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import useFetchExistingResponses from '../hooks/useFetchExistingResponses.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import React from 'react';

// Mock the dashboard utilities
jest.mock('../utils/dashboard.ts', () => ({
  getClientBundlePromise: jest.fn(),
  getResponsesFromBundle: jest.fn()
}));

// Mock the SmartClient hook
jest.mock('../../../hooks/useSmartClient.ts', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the useSelectedQuestionnaire hook
jest.mock('../hooks/useSelectedQuestionnaire.ts', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock globals
jest.mock('../../../globals.ts', () => ({
  NUM_OF_EXISTING_RESPONSES_TO_FETCH: 5
}));

interface SmartClientData {
  smartClient: unknown;
  patient: unknown;
  launchQuestionnaire: unknown;
}

interface UseSelectedQuestionnaireReturn {
  selectedQuestionnaire: unknown;
}

const mockDashboardUtils = jest.requireMock('../utils/dashboard.ts') as {
  getClientBundlePromise: jest.MockedFunction<(client: unknown, url: string) => Promise<Bundle>>;
  getResponsesFromBundle: jest.MockedFunction<
    (bundle: Bundle | undefined) => QuestionnaireResponse[]
  >;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseSmartClient = (jest.requireMock('../../../hooks/useSmartClient.ts') as any)
  .default as jest.MockedFunction<() => SmartClientData>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseSelectedQuestionnaire = (
  jest.requireMock('../hooks/useSelectedQuestionnaire.ts') as any
).default as jest.MockedFunction<() => UseSelectedQuestionnaireReturn>;

const { getClientBundlePromise, getResponsesFromBundle } = mockDashboardUtils;

const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'questionnaire-1',
  url: 'http://example.com/questionnaire-1',
  title: 'Test Questionnaire 1',
  status: 'active',
  date: '2023-01-01'
};

const mockQuestionnaireResponse1: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'response-1',
  status: 'completed',
  questionnaire: 'http://example.com/questionnaire-1',
  subject: { reference: 'Patient/patient-1' },
  authored: '2023-01-01T10:00:00Z'
};

const mockQuestionnaireResponse2: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'response-2',
  status: 'in-progress',
  questionnaire: 'http://example.com/questionnaire-1',
  subject: { reference: 'Patient/patient-1' },
  authored: '2023-01-02T10:00:00Z'
};

const mockBundle: Bundle = {
  resourceType: 'Bundle',
  id: 'test-bundle',
  type: 'searchset',
  entry: [{ resource: mockQuestionnaireResponse1 }, { resource: mockQuestionnaireResponse2 }]
};

const mockSmartClient = {
  state: { serverUrl: 'https://example.com/fhir' }
};

const mockSmartClientData = {
  smartClient: mockSmartClient,
  patient: { id: 'patient-1' },
  launchQuestionnaire: null
};

// Create a wrapper component for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

describe('useFetchExistingResponses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getClientBundlePromise.mockResolvedValue(mockBundle);
    getResponsesFromBundle.mockReturnValue([
      mockQuestionnaireResponse1,
      mockQuestionnaireResponse2
    ]);
    mockUseSmartClient.mockReturnValue(mockSmartClientData);
    mockUseSelectedQuestionnaire.mockReturnValue({ selectedQuestionnaire: mockQuestionnaire });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state correctly when no questionnaire is selected', () => {
    mockUseSelectedQuestionnaire.mockReturnValue({ selectedQuestionnaire: null });
    // Clear mocks to ensure no data is returned
    jest.clearAllMocks();
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    expect(result.current.existingResponses).toEqual([]);
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetchResponses).toBe('function');
  });

  it('returns initial state correctly when no smart client is available', () => {
    mockUseSmartClient.mockReturnValue({
      smartClient: null,
      patient: null,
      launchQuestionnaire: null
    });
    // Clear mocks to ensure no data is returned
    jest.clearAllMocks();
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    expect(result.current.existingResponses).toEqual([]);
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetchResponses).toBe('function');
  });

  it('returns initial state correctly when no patient is available', () => {
    mockUseSmartClient.mockReturnValue({ ...mockSmartClientData, patient: null });
    // Clear mocks to ensure no data is returned
    jest.clearAllMocks();
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    expect(result.current.existingResponses).toEqual([]);
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetchResponses).toBe('function');
  });

  it('fetches existing responses successfully for regular FHIR server', async () => {
    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=5&_sort=-authored&questionnaire=http://example.com/questionnaire-1&patient=patient-1&'
    );
    expect(getResponsesFromBundle).toHaveBeenCalledWith(mockBundle);
    expect(result.current.existingResponses).toEqual([
      mockQuestionnaireResponse1,
      mockQuestionnaireResponse2
    ]);
    expect(result.current.fetchError).toBeNull();
  });

  it('fetches existing responses successfully for Smart Health IT server', async () => {
    const smartHealthClient = {
      state: { serverUrl: 'https://launch.smarthealthit.org/v/r4/fhir' }
    };
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      smartClient: smartHealthClient
    });

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      smartHealthClient,
      '/QuestionnaireResponse?_count=5&_sort=-authored&questionnaire=Questionnaire/questionnaire-1-SMARTcopy&patient=patient-1&'
    );
  });

  it('handles questionnaire with version correctly', async () => {
    const questionnaireWithVersion: Questionnaire = {
      ...mockQuestionnaire,
      version: '1.0.0'
    };
    mockUseSelectedQuestionnaire.mockReturnValue({
      selectedQuestionnaire: questionnaireWithVersion
    });

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=5&_sort=-authored&questionnaire=http://example.com/questionnaire-1|1.0.0&patient=patient-1&'
    );
  });

  it('handles questionnaire without URL correctly', async () => {
    const questionnaireWithoutUrl: Questionnaire = {
      ...mockQuestionnaire,
      url: undefined
    };
    mockUseSelectedQuestionnaire.mockReturnValue({
      selectedQuestionnaire: questionnaireWithoutUrl
    });
    // Clear mocks to ensure no data is returned
    jest.clearAllMocks();
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    expect(result.current.existingResponses).toEqual([]);
    expect(getClientBundlePromise).not.toHaveBeenCalled();
  });

  it('handles questionnaire without URL and version correctly', async () => {
    const questionnaireWithoutUrl: Questionnaire = {
      ...mockQuestionnaire,
      url: undefined,
      version: undefined
    };
    mockUseSelectedQuestionnaire.mockReturnValue({
      selectedQuestionnaire: questionnaireWithoutUrl
    });
    // Clear mocks to ensure no data is returned
    jest.clearAllMocks();
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    expect(result.current.existingResponses).toEqual([]);
    expect(getClientBundlePromise).not.toHaveBeenCalled();
  });

  it('handles patient without ID correctly', async () => {
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      patient: { id: undefined }
    });
    // Clear mocks to ensure no data is returned
    jest.clearAllMocks();
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    expect(result.current.existingResponses).toEqual([]);
    expect(getClientBundlePromise).not.toHaveBeenCalled();
  });

  it('uses launch questionnaire when no selected questionnaire', async () => {
    const launchQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'launch-questionnaire',
      url: 'http://example.com/launch-questionnaire',
      status: 'active'
    };

    mockUseSelectedQuestionnaire.mockReturnValue({ selectedQuestionnaire: null });
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      launchQuestionnaire
    });

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=5&_sort=-authored&questionnaire=http://example.com/launch-questionnaire&patient=patient-1&'
    );
  });

  it('handles fetch errors correctly', async () => {
    const mockError = new Error('Fetch failed');
    getClientBundlePromise.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchError).toBe(mockError);
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('calls refetchResponses correctly', async () => {
    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();
    getClientBundlePromise.mockResolvedValue(mockBundle);

    // Call refetch
    result.current.refetchResponses();

    await waitFor(() => {
      expect(getClientBundlePromise).toHaveBeenCalled();
    });
  });

  it('handles empty responses correctly', async () => {
    getResponsesFromBundle.mockReturnValue([]);

    const { result } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.existingResponses).toEqual([]);
  });

  it('updates responses when questionnaire changes', async () => {
    const { result, rerender } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    // Change questionnaire
    const newQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'questionnaire-2',
      url: 'http://example.com/questionnaire-2',
      title: 'Test Questionnaire 2',
      status: 'active'
    };
    mockUseSelectedQuestionnaire.mockReturnValue({ selectedQuestionnaire: newQuestionnaire });

    // Clear previous calls and set up new response
    jest.clearAllMocks();
    getClientBundlePromise.mockResolvedValue(mockBundle);
    getResponsesFromBundle.mockReturnValue([]);

    // Rerender to trigger query update
    rerender();

    await waitFor(() => {
      expect(getClientBundlePromise).toHaveBeenCalledWith(
        mockSmartClient,
        '/QuestionnaireResponse?_count=5&_sort=-authored&questionnaire=http://example.com/questionnaire-2&patient=patient-1&'
      );
    });
  });

  it('updates responses when patient changes', async () => {
    const { result, rerender } = renderHook(() => useFetchExistingResponses(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    // Change patient
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      patient: { id: 'patient-2' }
    });

    // Clear previous calls and set up new response
    jest.clearAllMocks();
    getClientBundlePromise.mockResolvedValue(mockBundle);
    getResponsesFromBundle.mockReturnValue([]);

    // Rerender to trigger query update
    rerender();

    await waitFor(() => {
      expect(getClientBundlePromise).toHaveBeenCalledWith(
        mockSmartClient,
        '/QuestionnaireResponse?_count=5&_sort=-authored&questionnaire=http://example.com/questionnaire-1&patient=patient-2&'
      );
    });
  });
});
