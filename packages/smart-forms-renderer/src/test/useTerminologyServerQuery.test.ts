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

import { renderHook } from '@testing-library/react';
import type { QuestionnaireItem, ValueSet, Coding } from 'fhir/r4';
import useTerminologyServerQuery from '../hooks/useTerminologyServerQuery';

// Mock stores
const mockProcessedValueSets: Record<string, any> = {};
const mockItemPreferredTerminologyServers: any[] = [];
const mockDefaultTerminologyServerUrl = 'http://terminology.hl7.org/fhir';

// Mock utility functions
const mockGetValueSetPromise = jest.fn();
const mockGetValueSetCodings = jest.fn();
const mockGetItemTerminologyServerToUse = jest.fn();

// Mock React Query
const mockUseQuery = jest.fn();

// Mock console
const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      processedValueSets: () => mockProcessedValueSets,
      itemPreferredTerminologyServers: () => mockItemPreferredTerminologyServers
    }
  },
  useTerminologyServerStore: {
    use: {
      url: () => mockDefaultTerminologyServerUrl
    }
  }
}));

jest.mock('../utils/valueSet', () => ({
  getValueSetPromise: (...args: any[]) => mockGetValueSetPromise(...args),
  getValueSetCodings: (...args: any[]) => mockGetValueSetCodings(...args)
}));

jest.mock('../utils/preferredTerminologyServer', () => ({
  getItemTerminologyServerToUse: (...args: any[]) => mockGetItemTerminologyServerToUse(...args)
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args)
}));

describe('useTerminologyServerQuery', () => {
  // Mock data
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'choice',
    answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-code'
  };

  const mockValueSet: ValueSet = {
    resourceType: 'ValueSet',
    id: 'condition-code',
    status: 'active',
    expansion: {
      timestamp: '2024-01-01T00:00:00Z',
      total: 2,
      contains: [
        {
          system: 'http://snomed.info/sct',
          code: '386661006',
          display: 'Fever'
        },
        {
          system: 'http://snomed.info/sct',
          code: '36971009',
          display: 'Sinusitis'
        }
      ]
    }
  };

  const mockCodings: Coding[] = [
    {
      system: 'http://snomed.info/sct',
      code: '386661006',
      display: 'Fever'
    },
    {
      system: 'http://snomed.info/sct',
      code: '36971009',
      display: 'Sinusitis'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGetItemTerminologyServerToUse.mockReturnValue('http://terminology.hl7.org/fhir');
    mockGetValueSetCodings.mockReturnValue(mockCodings);
    mockUseQuery.mockReturnValue({
      isFetching: false,
      error: null,
      data: null
    });

    // Clear mock objects
    Object.keys(mockProcessedValueSets).forEach((key) => delete mockProcessedValueSets[key]);
    mockItemPreferredTerminologyServers.length = 0;
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('initialization and basic behavior', () => {
    it('should return initial state with empty options and no feedback', () => {
      const { result } = renderHook(() => useTerminologyServerQuery(mockQItem, 10, '', ''));

      expect(result.current.options).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.feedback).toBeUndefined();
    });

    it('should not perform query when searchTerm is less than 2 characters', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'f', 'f'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=f&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: false // Should be disabled for < 2 characters
      });
    });

    it('should show feedback for 1 character (encouraging user to enter 2+ chars)', () => {
      const { result } = renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'f', 'f'));

      // Fixed: Now correctly shows feedback for 1 character input
      expect(result.current.feedback).toEqual({
        message: 'Enter at least 2 characters to search for results.',
        color: 'info'
      });
    });
  });

  describe('URL construction', () => {
    it('should construct URL with filter and count parameters', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=fever&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should handle answerValueSet with trailing ampersand', () => {
      const qItemWithAmpersand: QuestionnaireItem = {
        ...mockQItem,
        answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-code&'
      };

      renderHook(() => useTerminologyServerQuery(qItemWithAmpersand, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=fever&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should handle contained ValueSet (starting with #)', () => {
      const qItemContained: QuestionnaireItem = {
        ...mockQItem,
        answerValueSet: '#contained-valueset'
      };

      renderHook(() => useTerminologyServerQuery(qItemContained, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['expandValueSet', 'contained-valueset&filter=fever&count=10'],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should use updatableValueSetUrl from processed value sets', () => {
      mockProcessedValueSets['contained-valueset'] = {
        updatableValueSetUrl: 'http://updated.example.com/ValueSet/conditions'
      };

      const qItemContained: QuestionnaireItem = {
        ...mockQItem,
        answerValueSet: '#contained-valueset'
      };

      renderHook(() => useTerminologyServerQuery(qItemContained, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://updated.example.com/ValueSet/conditions&filter=fever&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should not perform query when answerValueSet is undefined', () => {
      const qItemNoValueSet: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
        // No answerValueSet
      };

      renderHook(() => useTerminologyServerQuery(qItemNoValueSet, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['expandValueSet', ''],
        queryFn: expect.any(Function),
        enabled: false // Should be disabled when answerValueSet is undefined
      });
    });
  });

  describe('terminology server selection', () => {
    it('should call getItemTerminologyServerToUse with correct parameters', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever'));

      expect(mockGetItemTerminologyServerToUse).toHaveBeenCalledWith(
        mockQItem,
        mockItemPreferredTerminologyServers,
        mockDefaultTerminologyServerUrl
      );
    });

    it('should use custom terminology server from getItemTerminologyServerToUse', () => {
      const customTerminologyServer = 'http://custom.terminology.server/fhir';
      mockGetItemTerminologyServerToUse.mockReturnValue(customTerminologyServer);

      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever'));

      const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
      queryFn();

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/condition-code&filter=fever&count=10',
        customTerminologyServer
      );
    });
  });

  describe('query states and data handling', () => {
    it('should return loading state when query is fetching', () => {
      mockUseQuery.mockReturnValue({
        isFetching: true,
        error: null,
        data: null
      });

      const { result } = renderHook(() =>
        useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever')
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.options).toEqual([]);
      expect(result.current.feedback).toBeUndefined();
    });

    it('should return options when data is available', () => {
      mockUseQuery.mockReturnValue({
        isFetching: false,
        error: null,
        data: mockValueSet
      });

      const { result } = renderHook(() =>
        useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever')
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.options).toEqual(mockCodings);
      expect(result.current.feedback).toBeUndefined();
      expect(mockGetValueSetCodings).toHaveBeenCalledWith(mockValueSet);
    });

    it('should handle ValueSet with no results (total = 0)', () => {
      const emptyValueSet: ValueSet = {
        ...mockValueSet,
        expansion: {
          timestamp: '2024-01-01T00:00:00Z',
          total: 0,
          contains: []
        }
      };

      mockUseQuery.mockReturnValue({
        isFetching: false,
        error: null,
        data: emptyValueSet
      });

      const { result } = renderHook(() =>
        useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever')
      );

      expect(result.current.options).toEqual([]);
      expect(result.current.feedback).toEqual({
        message: "We couldn't seem to find anything. Try searching for a different term.",
        color: 'warning'
      });
    });

    it('should handle ValueSet without expansion', () => {
      const noExpansionValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'condition-code',
        status: 'active'
        // No expansion property
      };

      mockUseQuery.mockReturnValue({
        isFetching: false,
        error: null,
        data: noExpansionValueSet
      });

      const { result } = renderHook(() =>
        useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever')
      );

      // When expansion is undefined, data.expansion?.total is undefined
      // undefined !== 0 is true, so getValueSetCodings is called
      expect(result.current.options).toEqual(mockCodings);
      expect(result.current.feedback).toBeUndefined();
      expect(mockGetValueSetCodings).toHaveBeenCalledWith(noExpansionValueSet);
    });
  });

  describe('error handling', () => {
    it('should handle query errors and show error feedback', () => {
      const mockError = new Error('Network error');
      mockUseQuery.mockReturnValue({
        isFetching: false,
        error: mockError,
        data: null
      });

      const { result } = renderHook(() =>
        useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever')
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.options).toEqual([]);
      expect(result.current.feedback).toEqual({
        message: 'An error occurred. Try again later or try searching for a different term.',
        color: 'error'
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Ontoserver query failed. Details below: \nError: Network error'
      );
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      mockUseQuery.mockReturnValue({
        isFetching: false,
        error: timeoutError,
        data: null
      });

      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever'));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Ontoserver query failed. Details below: \nError: Request timeout'
      );
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('should handle empty input clearing feedback', () => {
      const { result } = renderHook(() => useTerminologyServerQuery(mockQItem, 10, '', ''));

      expect(result.current.feedback).toBeUndefined();
    });

    it('should handle very large maxList values', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 9999, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=fever&count=9999'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should handle special characters in search term', () => {
      const specialSearchTerm = 'fever & cold';

      renderHook(() =>
        useTerminologyServerQuery(mockQItem, 10, specialSearchTerm, specialSearchTerm)
      );

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=fever & cold&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should handle empty processed value sets', () => {
      const qItemContained: QuestionnaireItem = {
        ...mockQItem,
        answerValueSet: '#non-existent-valueset'
      };

      renderHook(() => useTerminologyServerQuery(qItemContained, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['expandValueSet', 'non-existent-valueset&filter=fever&count=10'],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should handle processed value set without updatableValueSetUrl', () => {
      mockProcessedValueSets['contained-valueset'] = {
        // No updatableValueSetUrl property
        someOtherProperty: 'value'
      };

      const qItemContained: QuestionnaireItem = {
        ...mockQItem,
        answerValueSet: '#contained-valueset'
      };

      renderHook(() => useTerminologyServerQuery(qItemContained, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['expandValueSet', 'contained-valueset&filter=fever&count=10'],
        queryFn: expect.any(Function),
        enabled: true
      });
    });
  });

  describe('query key generation', () => {
    it('should generate unique query keys for different URLs', () => {
      const { rerender } = renderHook(
        ({ searchTerm }) => useTerminologyServerQuery(mockQItem, 10, searchTerm, searchTerm),
        { initialProps: { searchTerm: 'fever' } }
      );

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=fever&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });

      // Change search term
      rerender({ searchTerm: 'cold' });

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=cold&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should use query function correctly', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'fever', 'fever'));

      const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
      queryFn();

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/condition-code&filter=fever&count=10',
        'http://terminology.hl7.org/fhir'
      );
    });
  });

  describe('enabled condition logic', () => {
    it('should be enabled when searchTerm >= 2 chars and answerValueSet exists', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'fe', 'fe'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=fe&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: true
      });
    });

    it('should be disabled when searchTerm < 2 chars', () => {
      renderHook(() => useTerminologyServerQuery(mockQItem, 10, 'f', 'f'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: [
          'expandValueSet',
          'http://hl7.org/fhir/ValueSet/condition-code&filter=f&count=10'
        ],
        queryFn: expect.any(Function),
        enabled: false
      });
    });

    it('should be disabled when answerValueSet is undefined', () => {
      const qItemNoValueSet: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      renderHook(() => useTerminologyServerQuery(qItemNoValueSet, 10, 'fever', 'fever'));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['expandValueSet', ''],
        queryFn: expect.any(Function),
        enabled: false
      });
    });
  });
});
