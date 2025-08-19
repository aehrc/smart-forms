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
import type { QuestionnaireResponseItem } from 'fhir/r4';
import useInitialiseGroupTableRows from '../hooks/useInitialiseGroupTableRows';

// Mock the repeatId utility functions
const mockGenerateNewRepeatId = jest.fn();
const mockGenerateExistingRepeatId = jest.fn();

jest.mock('../utils/repeatId', () => ({
  generateNewRepeatId: (...args: any[]) => mockGenerateNewRepeatId(...args),
  generateExistingRepeatId: (...args: any[]) => mockGenerateExistingRepeatId(...args)
}));

describe('useInitialiseGroupTableRows', () => {
  // Test data
  const mockLinkId = 'test-link-id';
  const mockQrItem1: QuestionnaireResponseItem = {
    linkId: 'item1',
    text: 'Test Item 1'
  };
  const mockQrItem2: QuestionnaireResponseItem = {
    linkId: 'item2',
    text: 'Test Item 2'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateNewRepeatId.mockReturnValue('test-link-id-repeat-new123');
    mockGenerateExistingRepeatId.mockImplementation(
      (linkId: string, index: number) => `${linkId}-repeat-${index.toString().padStart(6, '0')}`
    );
  });

  describe('empty qrItems array', () => {
    it('should return single row with new repeat ID when qrItems is empty', () => {
      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, []));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'test-link-id-repeat-new123',
        qrItem: null,
        isSelected: true
      });

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
      expect(mockGenerateExistingRepeatId).not.toHaveBeenCalled();
    });

    it('should call generateNewRepeatId with correct linkId', () => {
      const customLinkId = 'custom-link-id';
      renderHook(() => useInitialiseGroupTableRows(customLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(customLinkId);
    });
  });

  describe('single qrItem', () => {
    it('should return single row with existing repeat ID when one qrItem provided', () => {
      const qrItems = [mockQrItem1];
      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, qrItems));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'test-link-id-repeat-000000',
        qrItem: mockQrItem1,
        isSelected: true
      });

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 0);
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should preserve all properties of the qrItem', () => {
      const complexQrItem: QuestionnaireResponseItem = {
        linkId: 'complex',
        text: 'Complex Item',
        answer: [{ valueString: 'test answer' }],
        item: [{ linkId: 'nested', text: 'Nested Item' }]
      };

      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, [complexQrItem]));

      expect(result.current[0].qrItem).toEqual(complexQrItem);
      expect(result.current[0].qrItem).toBe(complexQrItem); // Reference equality
    });
  });

  describe('multiple qrItems', () => {
    it('should return multiple rows with correct indices when multiple qrItems provided', () => {
      const qrItems = [mockQrItem1, mockQrItem2];
      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, qrItems));

      expect(result.current).toHaveLength(2);

      expect(result.current[0]).toEqual({
        id: 'test-link-id-repeat-000000',
        qrItem: mockQrItem1,
        isSelected: true
      });

      expect(result.current[1]).toEqual({
        id: 'test-link-id-repeat-000001',
        qrItem: mockQrItem2,
        isSelected: true
      });

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 0);
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 1);
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should handle large number of qrItems with correct indexing', () => {
      const qrItems = Array.from({ length: 10 }, (_, i) => ({
        linkId: `item${i}`,
        text: `Item ${i}`
      }));

      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, qrItems));

      expect(result.current).toHaveLength(10);

      // Check first and last items
      expect(result.current[0].id).toBe('test-link-id-repeat-000000');
      expect(result.current[9].id).toBe('test-link-id-repeat-000009');

      // Verify all items have isSelected: true
      result.current.forEach((row) => {
        expect(row.isSelected).toBe(true);
      });

      // Verify all generateExistingRepeatId calls
      for (let i = 0; i < 10; i++) {
        expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, i);
      }
    });
  });

  describe('memoization behavior', () => {
    it('should return same result object when inputs do not change', () => {
      const qrItems = [mockQrItem1];
      const { result, rerender } = renderHook(
        ({ linkId, items }) => useInitialiseGroupTableRows(linkId, items),
        { initialProps: { linkId: mockLinkId, items: qrItems } }
      );

      const firstResult = result.current;

      // Re-render with same props
      rerender({ linkId: mockLinkId, items: qrItems });

      expect(result.current).toBe(firstResult); // Reference equality
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledTimes(1); // Called only once
    });

    it('should recompute when linkId changes', () => {
      const qrItems = [mockQrItem1];
      const { result, rerender } = renderHook(
        ({ linkId, items }) => useInitialiseGroupTableRows(linkId, items),
        { initialProps: { linkId: mockLinkId, items: qrItems } }
      );

      const firstResult = result.current;

      // Change linkId
      rerender({ linkId: 'new-link-id', items: qrItems });

      expect(result.current).not.toBe(firstResult);
      expect(result.current[0].id).toBe('new-link-id-repeat-000000');
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith('new-link-id', 0);
    });

    it('should recompute when qrItems array changes', () => {
      const { result, rerender } = renderHook(
        ({ linkId, items }) => useInitialiseGroupTableRows(linkId, items),
        { initialProps: { linkId: mockLinkId, items: [mockQrItem1] } }
      );

      const firstResult = result.current;

      // Change qrItems
      rerender({ linkId: mockLinkId, items: [mockQrItem1, mockQrItem2] });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toHaveLength(2);
    });

    it('should recompute when qrItems content changes', () => {
      const qrItems1 = [mockQrItem1];
      const qrItems2 = [mockQrItem2];

      const { result, rerender } = renderHook(
        ({ linkId, items }) => useInitialiseGroupTableRows(linkId, items),
        { initialProps: { linkId: mockLinkId, items: qrItems1 } }
      );

      const firstResult = result.current;

      // Change qrItems content
      rerender({ linkId: mockLinkId, items: qrItems2 });

      expect(result.current).not.toBe(firstResult);
      expect(result.current[0].qrItem).toBe(mockQrItem2);
    });
  });

  describe('linkId variations', () => {
    it('should handle linkId with special characters', () => {
      const specialLinkId = 'test-link_id.with@special#chars';
      const { result } = renderHook(() => useInitialiseGroupTableRows(specialLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(specialLinkId);
      expect(result.current[0].id).toBe('test-link-id-repeat-new123');
    });

    it('should handle empty linkId', () => {
      const { result } = renderHook(() => useInitialiseGroupTableRows('', []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith('');
      expect(result.current[0].id).toBe('test-link-id-repeat-new123');
    });

    it('should handle linkId with numbers', () => {
      const numericLinkId = 'item-123-test-456';
      const { result } = renderHook(() => useInitialiseGroupTableRows(numericLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(numericLinkId);
    });
  });

  describe('qrItem edge cases', () => {
    it('should handle qrItem with null properties', () => {
      const qrItemWithNulls: QuestionnaireResponseItem = {
        linkId: 'test',
        text: undefined,
        answer: undefined,
        item: undefined
      };

      const { result } = renderHook(() =>
        useInitialiseGroupTableRows(mockLinkId, [qrItemWithNulls])
      );

      expect(result.current[0].qrItem).toEqual(qrItemWithNulls);
    });

    it('should handle qrItem with only required properties', () => {
      const minimalQrItem: QuestionnaireResponseItem = {
        linkId: 'minimal'
      };

      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, [minimalQrItem]));

      expect(result.current[0].qrItem).toEqual(minimalQrItem);
    });

    it('should handle qrItem with deeply nested structure', () => {
      const nestedQrItem: QuestionnaireResponseItem = {
        linkId: 'nested',
        item: [
          {
            linkId: 'nested-1',
            item: [
              {
                linkId: 'nested-1-1',
                answer: [{ valueString: 'deep value' }]
              }
            ]
          }
        ]
      };

      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, [nestedQrItem]));

      expect(result.current[0].qrItem).toEqual(nestedQrItem);
    });
  });

  describe('integration with repeatId utilities', () => {
    it('should call generateNewRepeatId exactly once for empty array', () => {
      renderHook(() => useInitialiseGroupTableRows(mockLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledTimes(1);
      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
    });

    it('should call generateExistingRepeatId for each qrItem with correct index', () => {
      const qrItems = [mockQrItem1, mockQrItem2];
      renderHook(() => useInitialiseGroupTableRows(mockLinkId, qrItems));

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledTimes(2);
      expect(mockGenerateExistingRepeatId).toHaveBeenNthCalledWith(1, mockLinkId, 0);
      expect(mockGenerateExistingRepeatId).toHaveBeenNthCalledWith(2, mockLinkId, 1);
    });

    it('should handle custom repeat ID formats from utility functions', () => {
      mockGenerateNewRepeatId.mockReturnValue('custom-new-id-format');
      mockGenerateExistingRepeatId.mockReturnValue('custom-existing-id-format');

      const { result: result1 } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, []));
      const { result: result2 } = renderHook(() =>
        useInitialiseGroupTableRows(mockLinkId, [mockQrItem1])
      );

      expect(result1.current[0].id).toBe('custom-new-id-format');
      expect(result2.current[0].id).toBe('custom-existing-id-format');
    });
  });

  describe('return value structure', () => {
    it('should return array of objects with correct properties for empty input', () => {
      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, []));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current[0]).toHaveProperty('id');
      expect(result.current[0]).toHaveProperty('qrItem');
      expect(result.current[0]).toHaveProperty('isSelected');

      expect(typeof result.current[0].id).toBe('string');
      expect(result.current[0].qrItem).toBeNull();
      expect(result.current[0].isSelected).toBe(true);
    });

    it('should return array of objects with correct properties for non-empty input', () => {
      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, [mockQrItem1]));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current[0]).toHaveProperty('id');
      expect(result.current[0]).toHaveProperty('qrItem');
      expect(result.current[0]).toHaveProperty('isSelected');

      expect(typeof result.current[0].id).toBe('string');
      expect(result.current[0].qrItem).toBe(mockQrItem1);
      expect(result.current[0].isSelected).toBe(true);
    });

    it('should always set isSelected to true for all rows', () => {
      const qrItems = [mockQrItem1, mockQrItem2];
      const { result } = renderHook(() => useInitialiseGroupTableRows(mockLinkId, qrItems));

      result.current.forEach((row) => {
        expect(row.isSelected).toBe(true);
      });
    });
  });
});
