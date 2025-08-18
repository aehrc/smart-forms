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
import useInitialiseRepeatGroups from '../hooks/useInitialiseRepeatGroups';

// Mock the repeatId utility functions
const mockGenerateNewRepeatId = jest.fn();
const mockGenerateExistingRepeatId = jest.fn();

jest.mock('../utils/repeatId', () => ({
  generateNewRepeatId: (...args: any[]) => mockGenerateNewRepeatId(...args),
  generateExistingRepeatId: (...args: any[]) => mockGenerateExistingRepeatId(...args)
}));

describe('useInitialiseRepeatGroups', () => {
  // Test data
  const mockLinkId = 'repeat-group-link';
  const mockQrItem1: QuestionnaireResponseItem = {
    linkId: 'group1',
    text: 'Repeat Group 1',
    item: [
      { linkId: 'field1', text: 'Field 1' }
    ]
  };
  const mockQrItem2: QuestionnaireResponseItem = {
    linkId: 'group2',
    text: 'Repeat Group 2',
    item: [
      { linkId: 'field2', text: 'Field 2' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateNewRepeatId.mockReturnValue('repeat-group-link-repeat-newABC');
    mockGenerateExistingRepeatId.mockImplementation((linkId: string, index: number) => 
      `${linkId}-repeat-${index.toString().padStart(6, '0')}`
    );
  });

  describe('empty qrItems array', () => {
    it('should return single group with new repeat ID when qrItems is empty', () => {
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, []));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'repeat-group-link-repeat-newABC',
        qrItem: null
      });

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
      expect(mockGenerateExistingRepeatId).not.toHaveBeenCalled();
    });

    it('should call generateNewRepeatId with correct linkId', () => {
      const customLinkId = 'custom-repeat-group';
      renderHook(() => useInitialiseRepeatGroups(customLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(customLinkId);
    });
  });

  describe('single qrItem', () => {
    it('should return single group with existing repeat ID when one qrItem provided', () => {
      const qrItems = [mockQrItem1];
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, qrItems));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'repeat-group-link-repeat-000000',
        qrItem: mockQrItem1
      });

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 0);
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should preserve all properties of the qrItem', () => {
      const complexQrItem: QuestionnaireResponseItem = {
        linkId: 'complex-group',
        text: 'Complex Repeat Group',
        answer: [{ valueString: 'group answer' }],
        item: [
          { 
            linkId: 'nested-field', 
            text: 'Nested Field',
            answer: [{ valueInteger: 42 }]
          }
        ]
      };

      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [complexQrItem]));

      expect(result.current[0].qrItem).toEqual(complexQrItem);
      expect(result.current[0].qrItem).toBe(complexQrItem); // Reference equality
    });
  });

  describe('multiple qrItems', () => {
    it('should return multiple groups with correct indices when multiple qrItems provided', () => {
      const qrItems = [mockQrItem1, mockQrItem2];
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, qrItems));

      expect(result.current).toHaveLength(2);
      
      expect(result.current[0]).toEqual({
        id: 'repeat-group-link-repeat-000000',
        qrItem: mockQrItem1
      });

      expect(result.current[1]).toEqual({
        id: 'repeat-group-link-repeat-000001',
        qrItem: mockQrItem2
      });

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 0);
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 1);
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should handle large number of qrItems with correct indexing', () => {
      const qrItems = Array.from({ length: 15 }, (_, i) => ({
        linkId: `group${i}`,
        text: `Repeat Group ${i}`,
        item: [{ linkId: `field${i}`, text: `Field ${i}` }]
      }));

      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, qrItems));

      expect(result.current).toHaveLength(15);
      
      // Check first, middle, and last items
      expect(result.current[0].id).toBe('repeat-group-link-repeat-000000');
      expect(result.current[7].id).toBe('repeat-group-link-repeat-000007');
      expect(result.current[14].id).toBe('repeat-group-link-repeat-000014');
      
      // Verify all items have correct qrItem reference
      result.current.forEach((group, index) => {
        expect(group.qrItem).toBe(qrItems[index]);
      });

      // Verify all generateExistingRepeatId calls
      for (let i = 0; i < 15; i++) {
        expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, i);
      }
    });
  });

  describe('memoization behavior', () => {
    it('should return same result object when inputs do not change', () => {
      const qrItems = [mockQrItem1];
      const { result, rerender } = renderHook(
        ({ linkId, items }) => useInitialiseRepeatGroups(linkId, items),
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
        ({ linkId, items }) => useInitialiseRepeatGroups(linkId, items),
        { initialProps: { linkId: mockLinkId, items: qrItems } }
      );

      const firstResult = result.current;

      // Change linkId
      rerender({ linkId: 'new-repeat-group', items: qrItems });

      expect(result.current).not.toBe(firstResult);
      expect(result.current[0].id).toBe('new-repeat-group-repeat-000000');
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith('new-repeat-group', 0);
    });

    it('should recompute when qrItems array changes', () => {
      const { result, rerender } = renderHook(
        ({ linkId, items }) => useInitialiseRepeatGroups(linkId, items),
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
        ({ linkId, items }) => useInitialiseRepeatGroups(linkId, items),
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
      const specialLinkId = 'repeat_group.with@special#chars-123';
      const { result } = renderHook(() => useInitialiseRepeatGroups(specialLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(specialLinkId);
      expect(result.current[0].id).toBe('repeat-group-link-repeat-newABC');
    });

    it('should handle empty linkId', () => {
      const { result } = renderHook(() => useInitialiseRepeatGroups('', []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith('');
      expect(result.current[0].id).toBe('repeat-group-link-repeat-newABC');
    });

    it('should handle linkId with UUID-like format', () => {
      const uuidLinkId = '550e8400-e29b-41d4-a716-446655440000';
      const { result } = renderHook(() => useInitialiseRepeatGroups(uuidLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(uuidLinkId);
    });
  });

  describe('qrItem edge cases', () => {
    it('should handle qrItem with null or undefined properties', () => {
      const qrItemWithNulls: QuestionnaireResponseItem = {
        linkId: 'test',
        text: undefined,
        answer: undefined,
        item: undefined
      };

      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [qrItemWithNulls]));

      expect(result.current[0].qrItem).toEqual(qrItemWithNulls);
    });

    it('should handle qrItem with only required properties', () => {
      const minimalQrItem: QuestionnaireResponseItem = {
        linkId: 'minimal-group'
      };

      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [minimalQrItem]));

      expect(result.current[0].qrItem).toEqual(minimalQrItem);
    });

    it('should handle qrItem with deeply nested groups', () => {
      const nestedQrItem: QuestionnaireResponseItem = {
        linkId: 'nested-group',
        item: [
          {
            linkId: 'nested-subgroup-1',
            item: [
              {
                linkId: 'deep-field-1',
                answer: [{ valueString: 'deep value 1' }]
              },
              {
                linkId: 'deep-field-2',
                answer: [{ valueInteger: 999 }]
              }
            ]
          }
        ]
      };

      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [nestedQrItem]));

      expect(result.current[0].qrItem).toEqual(nestedQrItem);
    });

    it('should handle qrItem with multiple answers', () => {
      const multiAnswerQrItem: QuestionnaireResponseItem = {
        linkId: 'multi-answer-group',
        answer: [
          { valueString: 'answer 1' },
          { valueString: 'answer 2' },
          { valueInteger: 123 }
        ]
      };

      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [multiAnswerQrItem]));

      expect(result.current[0].qrItem).toEqual(multiAnswerQrItem);
    });
  });

  describe('integration with repeatId utilities', () => {
    it('should call generateNewRepeatId exactly once for empty array', () => {
      renderHook(() => useInitialiseRepeatGroups(mockLinkId, []));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledTimes(1);
      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
    });

    it('should call generateExistingRepeatId for each qrItem with correct index', () => {
      const qrItems = [mockQrItem1, mockQrItem2];
      renderHook(() => useInitialiseRepeatGroups(mockLinkId, qrItems));

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledTimes(2);
      expect(mockGenerateExistingRepeatId).toHaveBeenNthCalledWith(1, mockLinkId, 0);
      expect(mockGenerateExistingRepeatId).toHaveBeenNthCalledWith(2, mockLinkId, 1);
    });

    it('should handle custom repeat ID formats from utility functions', () => {
      mockGenerateNewRepeatId.mockReturnValue('custom-new-group-id');
      mockGenerateExistingRepeatId.mockReturnValue('custom-existing-group-id');

      const { result: result1 } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, []));
      const { result: result2 } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [mockQrItem1]));

      expect(result1.current[0].id).toBe('custom-new-group-id');
      expect(result2.current[0].id).toBe('custom-existing-group-id');
    });
  });

  describe('return value structure', () => {
    it('should return array of objects with correct properties for empty input', () => {
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, []));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current[0]).toHaveProperty('id');
      expect(result.current[0]).toHaveProperty('qrItem');

      expect(typeof result.current[0].id).toBe('string');
      expect(result.current[0].qrItem).toBeNull();
    });

    it('should return array of objects with correct properties for non-empty input', () => {
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [mockQrItem1]));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current[0]).toHaveProperty('id');
      expect(result.current[0]).toHaveProperty('qrItem');

      expect(typeof result.current[0].id).toBe('string');
      expect(result.current[0].qrItem).toBe(mockQrItem1);
    });

    it('should not have isSelected property (unlike GroupTableRowModel)', () => {
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, []));

      expect(result.current[0]).not.toHaveProperty('isSelected');
    });
  });

  describe('comparison with useInitialiseGroupTableRows', () => {
    it('should return similar structure but without isSelected property', () => {
      const { result } = renderHook(() => useInitialiseRepeatGroups(mockLinkId, [mockQrItem1]));

      const group = result.current[0];
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('qrItem');
      expect(group).not.toHaveProperty('isSelected');
      
      expect(typeof group.id).toBe('string');
      expect(group.qrItem).toBe(mockQrItem1);
    });
  });
});
