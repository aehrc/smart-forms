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

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { QuestionnaireItem, Coding, ValueSet } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import useDynamicValueSetEffect, {
  getUpdatableValueSetUrl
} from '../hooks/useDynamicValueSetEffect';

// Mock external dependencies
jest.mock('../utils/valueSet', () => ({
  getValueSetCodings: jest.fn(),
  getValueSetPromise: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/addDisplayToCodings', () => ({
  addDisplayToCodingArray: jest.fn()
}));

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressions,
      addCodingToCache: () => mockAddCodingToCache
    }
  }
}));

import { getValueSetCodings, getValueSetPromise } from '../utils/valueSet';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';

const mockGetValueSetCodings = getValueSetCodings as jest.MockedFunction<typeof getValueSetCodings>;
const mockGetValueSetPromise = getValueSetPromise as jest.MockedFunction<typeof getValueSetPromise>;
const mockAddDisplayToCodingArray = addDisplayToCodingArray as jest.MockedFunction<
  typeof addDisplayToCodingArray
>;
const mockAddCodingToCache = jest.fn();

let mockCalculatedExpressions: Record<string, CalculatedExpression[]> = {};

const processedValueSets: Record<string, ProcessedValueSet> = {
  'http://hl7.org/fhir/ValueSet/address-use': {
    initialValueSetUrl: 'http://hl7.org/fhir/ValueSet/address-use',
    updatableValueSetUrl: 'http://hl7.org/fhir/ValueSet/address-use',
    bindingParameters: [],
    isDynamic: false,
    linkIds: ['id-1']
  },
  'http://hl7.org/fhir/ValueSet/activity-definition-category': {
    initialValueSetUrl: 'http://hl7.org/fhir/ValueSet/activity-definition-category',
    updatableValueSetUrl: 'http://hl7.org/fhir/ValueSet/activity-definition-category',
    bindingParameters: [],
    isDynamic: false,
    linkIds: ['id-3']
  }
};

describe('getUpdatableValueSetUrl (real data)', () => {
  it('returns updatableValueSetUrl from calculatedExpressions for id-3', () => {
    const qItem: QuestionnaireItem = {
      type: 'choice',
      linkId: 'id-3',
      answerValueSet: 'http://hl7.org/fhir/ValueSet/activity-definition-category'
    };
    const calculatedExpressions: Record<string, CalculatedExpression[]> = {
      'id-3': [
        {
          expression:
            "iif(%resource.descendants().where(linkId = 'id-1').answer.first().value.code = 'home', 'http://hl7.org/fhir/ValueSet/action-type')",
          from: 'item._answerValueSet',
          value: 'http://hl7.org/fhir/ValueSet/action-type'
        }
      ]
    };

    const result = getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets);
    expect(result).toBe('http://hl7.org/fhir/ValueSet/action-type');
  });

  it('falls back to processedValueSets when no calculatedExpression exists (id-1)', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'id-1',
      type: 'choice',
      answerValueSet: 'http://hl7.org/fhir/ValueSet/address-use'
    };
    const calculatedExpressions: Record<string, CalculatedExpression[]> = {};

    const result = getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets);
    expect(result).toBe('http://hl7.org/fhir/ValueSet/address-use');
  });

  it('returns empty string if no expression and answerValueSet is unknown', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'id-4',
      type: 'choice',
      answerValueSet: 'https://nzhts.digital.health.nz/fhir/ValueSet/unknown'
    };
    const calculatedExpressions: Record<string, CalculatedExpression[]> = {};

    const result = getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets);
    expect(result).toBe('');
  });
});

describe('useDynamicValueSetEffect hook', () => {
  let mockOnSetCodings: jest.Mock;
  let mockOnSetDynamicCodingsUpdated: jest.Mock;
  let mockOnSetServerError: jest.Mock;
  let mockQItem: QuestionnaireItem;
  let mockProcessedValueSets: Record<string, ProcessedValueSet>;
  let mockCachedValueSetCodings: Record<string, Coding[]>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockCalculatedExpressions = {};
    mockOnSetCodings = jest.fn();
    mockOnSetDynamicCodingsUpdated = jest.fn();
    mockOnSetServerError = jest.fn();

    mockQItem = {
      linkId: 'test-item',
      type: 'choice',
      answerValueSet: 'http://test.com/ValueSet/test',
      _answerValueSet: {
        extension: []
      }
    };

    mockProcessedValueSets = {
      'http://test.com/ValueSet/test': {
        initialValueSetUrl: 'http://test.com/ValueSet/test',
        updatableValueSetUrl: 'http://test.com/ValueSet/test-updated',
        bindingParameters: [],
        isDynamic: true,
        linkIds: ['test-item']
      }
    };

    mockCachedValueSetCodings = {};
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('when conditions are not met', () => {
    it('should not run effect when answerValueSet is missing', () => {
      const qItemWithoutValueSet = { ...mockQItem, answerValueSet: undefined };

      renderHook(() =>
        useDynamicValueSetEffect(
          qItemWithoutValueSet,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
      expect(mockOnSetCodings).not.toHaveBeenCalled();
    });

    it('should not run effect when _answerValueSet is missing', () => {
      const qItemWithout_AnswerValueSet = { ...mockQItem, _answerValueSet: undefined };

      renderHook(() =>
        useDynamicValueSetEffect(
          qItemWithout_AnswerValueSet,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
      expect(mockOnSetCodings).not.toHaveBeenCalled();
    });

    it('should not run effect when updatableValueSetUrl is empty', () => {
      const emptyProcessedValueSets = {
        'http://test.com/ValueSet/test': {
          ...mockProcessedValueSets['http://test.com/ValueSet/test'],
          updatableValueSetUrl: ''
        }
      };

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          emptyProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
      expect(mockOnSetCodings).not.toHaveBeenCalled();
    });
  });

  describe('when updatableValueSetUrl is the same as previous', () => {
    it('should skip execution on re-render with same URL', () => {
      const { rerender } = renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      // Mock promise for first render
      mockGetValueSetPromise.mockReturnValue(
        Promise.resolve({
          resourceType: 'ValueSet',
          id: 'test-valueset',
          status: 'active'
        } as ValueSet)
      );

      expect(mockGetValueSetPromise).toHaveBeenCalledTimes(1);

      // Clear mock and rerender with same data
      mockGetValueSetPromise.mockClear();
      rerender();

      // Should not call again
      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });
  });

  describe('when cached codings exist', () => {
    it('should use cached codings and trigger UI update', () => {
      const cachedCodings: Coding[] = [
        { system: 'http://test.com', code: 'TEST1', display: 'Test 1' },
        { system: 'http://test.com', code: 'TEST2', display: 'Test 2' }
      ];

      const cachedValueSetCodings = {
        'http://test.com/ValueSet/test-updated': cachedCodings
      };

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          cachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockOnSetCodings).toHaveBeenCalledWith(cachedCodings);
      expect(mockOnSetDynamicCodingsUpdated).toHaveBeenCalledWith(true);

      // Advance time to trigger timeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockOnSetDynamicCodingsUpdated).toHaveBeenCalledWith(false);
    });

    it('should not fetch from server when cached codings exist', () => {
      const cachedCodings: Coding[] = [
        { system: 'http://test.com', code: 'TEST1', display: 'Test 1' }
      ];

      const cachedValueSetCodings = {
        'http://test.com/ValueSet/test-updated': cachedCodings
      };

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          cachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });
  });

  describe('when fetching from server', () => {
    it('should handle successful fetch and processing', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
        status: 'active',
        compose: {
          include: [
            {
              system: 'http://test.com',
              concept: [
                { code: 'A', display: 'Option A' },
                { code: 'B', display: 'Option B' }
              ]
            }
          ]
        }
      };

      const initialCodings: Coding[] = [
        { system: 'http://test.com', code: 'A' },
        { system: 'http://test.com', code: 'B' }
      ];

      const codingsWithDisplay: Coding[] = [
        { system: 'http://test.com', code: 'A', display: 'Option A' },
        { system: 'http://test.com', code: 'B', display: 'Option B' }
      ];

      mockGetValueSetPromise.mockResolvedValue(mockValueSet);
      mockGetValueSetCodings.mockReturnValue(initialCodings);
      mockAddDisplayToCodingArray.mockResolvedValue(codingsWithDisplay);

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://test.com/ValueSet/test-updated',
        'http://terminology.server.com'
      );

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockOnSetCodings).toHaveBeenCalled();
      });

      expect(mockGetValueSetCodings).toHaveBeenCalledWith(mockValueSet);
      expect(mockAddDisplayToCodingArray).toHaveBeenCalledWith(
        initialCodings,
        'http://terminology.server.com'
      );
      expect(mockAddCodingToCache).toHaveBeenCalledWith(
        'http://test.com/ValueSet/test-updated',
        codingsWithDisplay
      );
      expect(mockOnSetCodings).toHaveBeenCalledWith(codingsWithDisplay);
      expect(mockOnSetDynamicCodingsUpdated).toHaveBeenCalledWith(true);
    });

    it('should handle empty codings result', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
        status: 'active'
      };

      mockGetValueSetPromise.mockResolvedValue(mockValueSet);
      mockGetValueSetCodings.mockReturnValue([]);
      mockAddDisplayToCodingArray.mockResolvedValue([]);

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      await waitFor(() => {
        expect(mockOnSetCodings).toHaveBeenCalledWith([]);
      });
      expect(mockOnSetDynamicCodingsUpdated).toHaveBeenCalledWith(true);
    });

    it('should handle addDisplayToCodingArray error', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
        status: 'active'
      };

      const initialCodings: Coding[] = [{ system: 'http://test.com', code: 'A' }];

      const addDisplayError = new Error('Failed to add display');

      mockGetValueSetPromise.mockResolvedValue(mockValueSet);
      mockGetValueSetCodings.mockReturnValue(initialCodings);
      mockAddDisplayToCodingArray.mockRejectedValue(addDisplayError);

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      await waitFor(() => {
        expect(mockOnSetServerError).toHaveBeenCalledWith(addDisplayError);
      });
    });

    it('should handle ValueSet promise rejection', async () => {
      const promiseError = new Error('Failed to fetch ValueSet');

      mockGetValueSetPromise.mockRejectedValue(promiseError);

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      await waitFor(() => {
        expect(mockOnSetServerError).toHaveBeenCalledWith(promiseError);
      });
    });

    it('should not fetch when getValueSetPromise returns null', () => {
      mockGetValueSetPromise.mockReturnValue(null as any);

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://test.com/ValueSet/test-updated',
        'http://terminology.server.com'
      );
      expect(mockOnSetCodings).not.toHaveBeenCalled();
      expect(mockOnSetServerError).not.toHaveBeenCalled();
    });
  });

  describe('with calculated expressions', () => {
    it('should use calculated expression value as updatableValueSetUrl', async () => {
      mockCalculatedExpressions = {
        'test-item': [
          {
            expression: 'some-expression',
            from: 'item._answerValueSet',
            value: 'http://calculated.com/ValueSet/dynamic'
          }
        ]
      };

      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'calculated-valueset',
        status: 'active'
      };

      mockGetValueSetPromise.mockResolvedValue(mockValueSet);
      mockGetValueSetCodings.mockReturnValue([]);
      mockAddDisplayToCodingArray.mockResolvedValue([]);

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://calculated.com/ValueSet/dynamic',
        'http://terminology.server.com'
      );
    });

    it('should handle changes in calculated expression value', () => {
      // Start with one calculated expression
      mockCalculatedExpressions = {
        'test-item': [
          {
            expression: 'some-expression',
            from: 'item._answerValueSet',
            value: 'http://calculated.com/ValueSet/v1'
          }
        ]
      };

      const { rerender } = renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://calculated.com/ValueSet/v1',
        'http://terminology.server.com'
      );

      // Change the calculated expression
      mockCalculatedExpressions = {
        'test-item': [
          {
            expression: 'some-expression',
            from: 'item._answerValueSet',
            value: 'http://calculated.com/ValueSet/v2'
          }
        ]
      };

      mockGetValueSetPromise.mockClear();
      rerender();

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://calculated.com/ValueSet/v2',
        'http://terminology.server.com'
      );
    });
  });

  describe('cleanup behavior', () => {
    it('should handle component unmount during async operation', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
        status: 'active'
      };

      let resolvePromise: (value: ValueSet) => void;
      const valueSetPromise = new Promise<ValueSet>((resolve) => {
        resolvePromise = resolve;
      });

      mockGetValueSetPromise.mockReturnValue(valueSetPromise);
      mockGetValueSetCodings.mockReturnValue([]);
      mockAddDisplayToCodingArray.mockResolvedValue([]);

      const { unmount } = renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      // Unmount before promise resolves
      unmount();

      // Resolve promise after unmount
      await act(async () => {
        resolvePromise!(mockValueSet);
      });

      // Wait for any async operations to complete
      await waitFor(() => {
        // Ensure async operations have settled
        expect(mockOnSetCodings).not.toHaveBeenCalled();
      });

      // Should not call callbacks after unmount
      expect(mockOnSetCodings).not.toHaveBeenCalled();
    });

    it('should clean up timeout on unmount during cached scenario', () => {
      const cachedCodings: Coding[] = [
        { system: 'http://test.com', code: 'TEST1', display: 'Test 1' }
      ];

      const cachedValueSetCodings = {
        'http://test.com/ValueSet/test-updated': cachedCodings
      };

      const { unmount } = renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          cachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockOnSetDynamicCodingsUpdated).toHaveBeenCalledWith(true);

      // Unmount before timeout
      unmount();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should not cause issues after unmount
    });
  });

  describe('edge cases', () => {
    it('should handle missing answerValueSet in qItem', () => {
      const qItemNoAnswerValueSet = { ...mockQItem, answerValueSet: undefined };

      renderHook(() =>
        useDynamicValueSetEffect(
          qItemNoAnswerValueSet,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });

    it('should handle calculated expression with empty string value', () => {
      mockCalculatedExpressions = {
        'test-item': [
          {
            expression: 'some-expression',
            from: 'item._answerValueSet',
            value: ''
          }
        ]
      };

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      // Should fallback to processedValueSets when calculated expression value is empty
      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://test.com/ValueSet/test-updated',
        'http://terminology.server.com'
      );
    });

    it('should handle calculated expression with non-string value', () => {
      mockCalculatedExpressions = {
        'test-item': [
          {
            expression: 'some-expression',
            from: 'item._answerValueSet',
            value: 123 // non-string value
          }
        ]
      };

      renderHook(() =>
        useDynamicValueSetEffect(
          mockQItem,
          'http://terminology.server.com',
          mockProcessedValueSets,
          mockCachedValueSetCodings,
          mockOnSetCodings,
          mockOnSetDynamicCodingsUpdated,
          mockOnSetServerError
        )
      );

      // Should fallback to processedValueSets
      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://test.com/ValueSet/test-updated',
        'http://terminology.server.com'
      );
    });
  });
});
