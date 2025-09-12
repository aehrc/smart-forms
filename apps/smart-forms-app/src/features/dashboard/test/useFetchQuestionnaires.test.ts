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
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import useFetchQuestionnaires from '../hooks/useFetchQuestionnaires';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Bundle, Questionnaire } from 'fhir/r4';
import React from 'react';

// Mock the dashboard utilities
jest.mock('../utils/dashboard.ts', () => ({
  getFormsServerBundlePromise: jest.fn(),
  filterQuestionnaires: jest.fn()
}));

// Mock globals
jest.mock('../../../globals.ts', () => ({
  NUM_OF_QUESTIONNAIRES_TO_FETCH: 10
}));

const mockDashboardUtils = jest.requireMock('../utils/dashboard.ts') as {
  getFormsServerBundlePromise: jest.MockedFunction<
    (queryUrl: string, formsServerUrl: string) => Promise<Bundle>
  >;
  filterQuestionnaires: jest.MockedFunction<
    (bundle: Bundle | undefined, includeSubquestionnaires: boolean) => Questionnaire[]
  >;
};

const { getFormsServerBundlePromise, filterQuestionnaires } = mockDashboardUtils;

const mockQuestionnaire1: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'questionnaire-1',
  url: 'http://example.com/questionnaire-1',
  title: 'Test Questionnaire 1',
  status: 'active',
  date: '2023-01-01'
};

const mockQuestionnaire2: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'questionnaire-2',
  url: 'http://example.com/questionnaire-2',
  title: 'Test Questionnaire 2',
  status: 'active',
  date: '2023-01-02'
};

const mockBundle: Bundle = {
  resourceType: 'Bundle',
  id: 'test-bundle',
  type: 'searchset',
  entry: [{ resource: mockQuestionnaire1 }, { resource: mockQuestionnaire2 }]
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

describe('useFetchQuestionnaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFormsServerBundlePromise.mockResolvedValue(mockBundle);
    filterQuestionnaires.mockReturnValue([mockQuestionnaire1, mockQuestionnaire2]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state correctly', () => {
    // Don't set up any mock data for this test
    jest.clearAllMocks();
    filterQuestionnaires.mockReturnValue([]);

    const { result } = renderHook(() => useFetchQuestionnaires('test', 'different', false), {
      wrapper: createWrapper()
    });

    expect(result.current.questionnaires).toEqual([]);
    expect(result.current.fetchStatus).toBe('pending');
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isLoading).toBe(false); // Disabled queries don't show loading
    expect(result.current.isFetching).toBe(false); // Disabled queries don't fetch
    expect(typeof result.current.refetchQuestionnaires).toBe('function');
  });

  it('fetches questionnaires successfully when query is enabled', async () => {
    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', false), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getFormsServerBundlePromise).toHaveBeenCalledWith(
      '/Questionnaire?_count=10&_sort=-date&title:contains=test',
      'https://smartforms.csiro.au/api/fhir' // From FALLBACK_CONFIG in config.ts
    );
    expect(filterQuestionnaires).toHaveBeenCalledWith(mockBundle, false);
    expect(result.current.questionnaires).toEqual([mockQuestionnaire1, mockQuestionnaire2]);
    expect(result.current.fetchError).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it('constructs query URL without search input when debouncedInput is empty', async () => {
    const { result } = renderHook(() => useFetchQuestionnaires('', '', false), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getFormsServerBundlePromise).toHaveBeenCalledWith(
      '/Questionnaire?_count=10&_sort=-date&',
      'https://smartforms.csiro.au/api/fhir' // From FALLBACK_CONFIG in config.ts
    );
  });

  it('includes subquestionnaires when includeSubquestionnaires is true', async () => {
    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', true), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(filterQuestionnaires).toHaveBeenCalledWith(mockBundle, true);
  });

  it('does not fetch when debouncedInput does not match searchInput', () => {
    const { result } = renderHook(() => useFetchQuestionnaires('test', 'different', false), {
      wrapper: createWrapper()
    });

    expect(getFormsServerBundlePromise).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('pending');
  });

  it('respects minLengthToQuery when provided', () => {
    const { result } = renderHook(() => useFetchQuestionnaires('te', 'te', false, 3), {
      wrapper: createWrapper()
    });

    expect(getFormsServerBundlePromise).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('pending');
  });

  it('fetches when query meets minLengthToQuery requirement', async () => {
    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', false, 3), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(getFormsServerBundlePromise).toHaveBeenCalled();
  });

  it('handles fetch errors correctly', async () => {
    const mockError = new Error('Fetch failed');
    getFormsServerBundlePromise.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', false), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('error');
    });

    expect(result.current.fetchError).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it('calls refetchQuestionnaires correctly', async () => {
    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', false), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    // Clear previous calls
    jest.clearAllMocks();
    getFormsServerBundlePromise.mockResolvedValue(mockBundle);

    // Call refetch
    result.current.refetchQuestionnaires();

    await waitFor(() => {
      expect(getFormsServerBundlePromise).toHaveBeenCalled();
    });
  });

  it('updates questionnaires when bundle changes', async () => {
    const newQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'questionnaire-3',
      url: 'http://example.com/questionnaire-3',
      title: 'Test Questionnaire 3',
      status: 'active',
      date: '2023-01-03'
    };

    const { result, rerender } = renderHook(
      ({ includeSubquestionnaires }) =>
        useFetchQuestionnaires('test', 'test', includeSubquestionnaires),
      {
        wrapper: createWrapper(),
        initialProps: { includeSubquestionnaires: false }
      }
    );

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    // Change the filter result
    filterQuestionnaires.mockReturnValue([newQuestionnaire]);

    // Rerender with different includeSubquestionnaires
    rerender({ includeSubquestionnaires: true });

    await waitFor(() => {
      expect(result.current.questionnaires).toEqual([newQuestionnaire]);
    });
  });

  it('handles empty bundle correctly', async () => {
    const emptyBundle: Bundle = {
      resourceType: 'Bundle',
      id: 'empty-bundle',
      type: 'searchset',
      entry: []
    };

    getFormsServerBundlePromise.mockResolvedValue(emptyBundle);
    filterQuestionnaires.mockReturnValue([]);

    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', false), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(result.current.questionnaires).toEqual([]);
    expect(filterQuestionnaires).toHaveBeenCalledWith(emptyBundle, false);
  });

  it('handles undefined bundle correctly', async () => {
    const emptyBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset'
    };
    getFormsServerBundlePromise.mockResolvedValue(emptyBundle);
    filterQuestionnaires.mockReturnValue([]);

    const { result } = renderHook(() => useFetchQuestionnaires('test', 'test', false), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('success');
    });

    expect(result.current.questionnaires).toEqual([]);
    expect(filterQuestionnaires).toHaveBeenCalledWith(emptyBundle, false);
  });
});
