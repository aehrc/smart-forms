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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import type { Bundle, Patient } from 'fhir/r4';
import useFetchPatients from '../useFetchPatients';
import { fetchFhirResources } from '../../api/fetchFhirResources';

// Mock the API function
jest.mock('../../api/fetchFhirResources');
const mockFetchFhirResources = fetchFhirResources as jest.MockedFunction<typeof fetchFhirResources>;

// Mock globals
jest.mock('../../../../globals', () => ({
  NUM_OF_PATIENTS_TO_FETCH_PLAYGROUND: 100
}));

describe('useFetchPatients', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('returns empty patients array when no data is fetched', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: []
    };

    mockFetchFhirResources.mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toEqual([]);
    expect(result.current.fetchStatus).toBe('success');
    expect(result.current.fetchError).toBeNull();
  });

  it('returns patients when valid bundle is fetched', async () => {
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [
        {
          family: 'Smith',
          given: ['John']
        }
      ],
      gender: 'male'
    };

    const mockBundle: Bundle<Patient> = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: mockPatient
        }
      ]
    };

    mockFetchFhirResources.mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toEqual([mockPatient]);
    expect(result.current.fetchStatus).toBe('success');
    expect(result.current.fetchError).toBeNull();
  });

  it('returns empty array when bundle has no entries', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: []
    };

    mockFetchFhirResources.mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toEqual([]);
    expect(result.current.fetchStatus).toBe('success');
  });

  it('returns empty array when bundle entries have no resources', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: undefined }]
    };

    mockFetchFhirResources.mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toEqual([]);
    expect(result.current.fetchStatus).toBe('success');
  });

  it('returns empty array for non-patient bundle', async () => {
    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: {
            resourceType: 'Practitioner',
            id: 'practitioner-1'
          }
        }
      ]
    };

    mockFetchFhirResources.mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toEqual([]);
    expect(result.current.fetchStatus).toBe('success');
  });

  it('handles fetch error correctly', async () => {
    const error = new Error('Fetch failed');
    mockFetchFhirResources.mockRejectedValue(error);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('error');
    });

    expect(result.current.patients).toEqual([]);
    expect(result.current.fetchError).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('calls fetchFhirResources with correct parameters', async () => {
    mockFetchFhirResources.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: []
    });

    renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(mockFetchFhirResources).toHaveBeenCalledWith(
        'https://example.com/fhir',
        '/Patient?_count=100'
      );
    });
  });

  it('filters out null or undefined resources from entries', async () => {
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ family: 'Smith', given: ['John'] }],
      gender: 'male'
    };

    const mockBundle: Bundle<Patient> = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        { resource: mockPatient },
        { resource: undefined },
        { resource: null as unknown as Patient },
        { resource: mockPatient }
      ]
    };

    mockFetchFhirResources.mockResolvedValue(mockBundle);

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.patients).toEqual([mockPatient, mockPatient]);
  });

  it('shows loading state initially', () => {
    mockFetchFhirResources.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFetchPatients('https://example.com/fhir'), {
      wrapper: createWrapper
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.fetchStatus).toBe('pending');
    expect(result.current.patients).toEqual([]);
  });
});
