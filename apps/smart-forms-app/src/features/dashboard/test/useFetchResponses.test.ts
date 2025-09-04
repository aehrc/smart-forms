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
import useFetchResponses from '../hooks/useFetchResponses.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import React from 'react';

// Mock the dashboard utilities
jest.mock('../utils/dashboard.ts', () => ({
  constructBundle: jest.fn(),
  filterResponses: jest.fn(),
  getClientBundlePromise: jest.fn()
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

interface SmartClientData {
  smartClient: unknown;
  patient: unknown;
}

interface UseSelectedQuestionnaireReturn {
  existingResponses: unknown;
}

const mockDashboardUtils = jest.requireMock('../utils/dashboard.ts') as {
  constructBundle: jest.MockedFunction<(resources: unknown[]) => Bundle>;
  filterResponses: jest.MockedFunction<(bundle: Bundle | undefined) => QuestionnaireResponse[]>;
  getClientBundlePromise: jest.MockedFunction<(client: unknown, url: string) => Promise<Bundle>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseSmartClient = (jest.requireMock('../../../hooks/useSmartClient.ts') as any)
  .default as jest.MockedFunction<() => SmartClientData>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseSelectedQuestionnaire = (
  jest.requireMock('../hooks/useSelectedQuestionnaire.ts') as any
).default as jest.MockedFunction<() => UseSelectedQuestionnaireReturn>;

const { constructBundle, filterResponses, getClientBundlePromise } = mockDashboardUtils;

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

const mockExistingResponsesBundle: Bundle = {
  resourceType: 'Bundle',
  id: 'existing-bundle',
  type: 'collection',
  entry: [{ resource: mockQuestionnaireResponse1 }]
};

const mockSmartClient = {
  state: { serverUrl: 'https://example.com/fhir' }
};

const mockSmartClientData = {
  smartClient: mockSmartClient,
  patient: { id: 'patient-1' }
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

describe('useFetchResponses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getClientBundlePromise.mockResolvedValue(mockBundle);
    filterResponses.mockReturnValue([mockQuestionnaireResponse1, mockQuestionnaireResponse2]);
    constructBundle.mockReturnValue(mockExistingResponsesBundle);
    mockUseSmartClient.mockReturnValue(mockSmartClientData);
    mockUseSelectedQuestionnaire.mockReturnValue({ existingResponses: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state correctly when no smart client is available', () => {
    mockUseSmartClient.mockReturnValue({ smartClient: null, patient: null });
    jest.clearAllMocks();
    filterResponses.mockReturnValue([]);

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    expect(result.current.responses).toEqual([]);
    expect(result.current.fetchStatus).toBe('pending');
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(typeof result.current.refetchResponses).toBe('function');
  });

  it('fetches responses successfully for regular FHIR server', async () => {
    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=100&_sort=-authored&patient=patient-1&questionnaire=http://example.com/questionnaire-1'
    );
    expect(filterResponses).toHaveBeenCalledWith(mockBundle);
    expect(result.current.responses).toEqual([
      mockQuestionnaireResponse1,
      mockQuestionnaireResponse2
    ]);
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isFetching).toBe(false);
  });

  it('fetches responses successfully for Smart Health IT server', async () => {
    const smartHealthClient = {
      state: { serverUrl: 'https://launch.smarthealthit.org/v/r4/fhir' }
    };
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      smartClient: smartHealthClient
    });

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      smartHealthClient,
      '/QuestionnaireResponse?_count=100&_sort=-authored&patient=patient-1&questionnaire=Questionnaire/questionnaire-1-SMARTcopy'
    );
  });

  it('handles questionnaire without URL for regular server', async () => {
    const questionnaireWithoutUrl: Questionnaire = {
      ...mockQuestionnaire,
      url: undefined
    };

    const { result } = renderHook(() => useFetchResponses(questionnaireWithoutUrl), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=100&_sort=-authored&patient=patient-1&'
    );
  });

  it('handles questionnaire without ID for Smart Health IT server', async () => {
    const smartHealthClient = {
      state: { serverUrl: 'https://launch.smarthealthit.org/v/r4/fhir' }
    };
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      smartClient: smartHealthClient
    });

    const questionnaireWithoutId: Questionnaire = {
      ...mockQuestionnaire,
      id: undefined
    };

    const { result } = renderHook(() => useFetchResponses(questionnaireWithoutId), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      smartHealthClient,
      '/QuestionnaireResponse?_count=100&_sort=-authored&patient=patient-1&'
    );
  });

  it('handles patient without ID correctly', async () => {
    mockUseSmartClient.mockReturnValue({
      ...mockSmartClientData,
      patient: { id: undefined }
    });

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=100&_sort=-authored&patient=undefined&questionnaire=http://example.com/questionnaire-1'
    );
  });

  it('handles null questionnaire correctly', async () => {
    const { result } = renderHook(() => useFetchResponses(null), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getClientBundlePromise).toHaveBeenCalledWith(
      mockSmartClient,
      '/QuestionnaireResponse?_count=100&_sort=-authored&patient=patient-1&'
    );
  });

  it('uses existing responses when available', async () => {
    const existingResponses = [mockQuestionnaireResponse1];
    mockUseSelectedQuestionnaire.mockReturnValue({ existingResponses });
    filterResponses.mockReturnValue([mockQuestionnaireResponse1]);

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(constructBundle).toHaveBeenCalledWith(existingResponses);
    expect(filterResponses).toHaveBeenCalledWith(mockExistingResponsesBundle);
    expect(result.current.responses).toEqual([mockQuestionnaireResponse1]);
  });

  it('uses fetched bundle when no existing responses', async () => {
    mockUseSelectedQuestionnaire.mockReturnValue({ existingResponses: [] });

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(filterResponses).toHaveBeenCalledWith(mockBundle);
    expect(result.current.responses).toEqual([
      mockQuestionnaireResponse1,
      mockQuestionnaireResponse2
    ]);
  });

  it('handles fetch errors correctly', async () => {
    const mockError = new Error('Fetch failed');
    getClientBundlePromise.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('error');
    });

    expect(result.current.fetchError).toBe(mockError);
    expect(result.current.isFetching).toBe(false);
  });

  it('calls refetchResponses correctly', async () => {
    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
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
    filterResponses.mockReturnValue([]);

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(result.current.responses).toEqual([]);
  });

  it('updates responses when questionnaire changes', async () => {
    const { result, rerender } = renderHook(
      ({ questionnaire }) => useFetchResponses(questionnaire),
      {
        wrapper: createWrapper(),
        initialProps: { questionnaire: mockQuestionnaire }
      }
    );

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    // Change questionnaire
    const newQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'questionnaire-2',
      url: 'http://example.com/questionnaire-2',
      title: 'Test Questionnaire 2',
      status: 'active'
    };

    // Clear previous calls and set up new response
    jest.clearAllMocks();
    getClientBundlePromise.mockResolvedValue(mockBundle);
    filterResponses.mockReturnValue([]);

    // Rerender with different questionnaire
    rerender({ questionnaire: newQuestionnaire });

    await waitFor(() => {
      expect(getClientBundlePromise).toHaveBeenCalledWith(
        mockSmartClient,
        '/QuestionnaireResponse?_count=100&_sort=-authored&patient=patient-1&questionnaire=http://example.com/questionnaire-2'
      );
    });
  });

  it('updates responses when existing responses change', async () => {
    const { result, rerender } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    // Change existing responses
    const newExistingResponses = [mockQuestionnaireResponse2];
    mockUseSelectedQuestionnaire.mockReturnValue({ existingResponses: newExistingResponses });
    filterResponses.mockReturnValue([mockQuestionnaireResponse2]);

    // Rerender to trigger update
    rerender();

    await waitFor(() => {
      expect(constructBundle).toHaveBeenCalledWith(newExistingResponses);
      expect(result.current.responses).toEqual([mockQuestionnaireResponse2]);
    });
  });

  it('switches between bundle sources based on existing responses', async () => {
    // Initially no existing responses
    mockUseSelectedQuestionnaire.mockReturnValue({ existingResponses: [] });
    filterResponses.mockReturnValue([mockQuestionnaireResponse1, mockQuestionnaireResponse2]);

    const { result, rerender } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    // Should use fetched bundle
    expect(filterResponses).toHaveBeenCalledWith(mockBundle);
    expect(result.current.responses).toEqual([
      mockQuestionnaireResponse1,
      mockQuestionnaireResponse2
    ]);

    // Add existing responses
    mockUseSelectedQuestionnaire.mockReturnValue({
      existingResponses: [mockQuestionnaireResponse1]
    });
    filterResponses.mockReturnValue([mockQuestionnaireResponse1]);

    rerender();

    await waitFor(() => {
      // Should now use existing responses bundle
      expect(filterResponses).toHaveBeenCalledWith(mockExistingResponsesBundle);
      expect(result.current.responses).toEqual([mockQuestionnaireResponse1]);
    });
  });

  it('handles undefined bundle correctly', async () => {
    const emptyBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset'
    };
    getClientBundlePromise.mockResolvedValue(emptyBundle);
    filterResponses.mockReturnValue([]);

    const { result } = renderHook(() => useFetchResponses(mockQuestionnaire), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(filterResponses).toHaveBeenCalledWith(emptyBundle);
    expect(result.current.responses).toEqual([]);
  });
});
