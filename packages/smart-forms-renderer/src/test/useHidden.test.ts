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
import type { QuestionnaireItem } from 'fhir/r4';
import useHidden from '../hooks/useHidden';

// Mock the store functions
jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      enableWhenIsActivated: jest.fn(),
      enableWhenItems: jest.fn(),
      enableWhenExpressions: jest.fn()
    }
  }
}));

jest.mock('../stores/rendererConfigStore', () => ({
  useRendererConfigStore: {
    use: {
      enableWhenAsReadOnly: jest.fn()
    }
  }
}));

// Mock utility functions
const mockIsHiddenByEnableWhen = jest.fn();
jest.mock('../utils/qItem', () => ({
  isHiddenByEnableWhen: (...args: any[]) => mockIsHiddenByEnableWhen(...args)
}));

// Mock SDC helpers
const mockGetHidden = jest.fn();
jest.mock('fhir-sdc-helpers', () => ({
  structuredDataCapture: {
    getHidden: (...args: any[]) => mockGetHidden(...args)
  }
}));

describe('useHidden', () => {
  // Test data
  const basicQItem: QuestionnaireItem = {
    linkId: 'basic-item',
    text: 'Basic Item',
    type: 'string'
  };

  const groupQItem: QuestionnaireItem = {
    linkId: 'group-item',
    text: 'Group Item',
    type: 'group'
  };

  // Helper function to get mock references
  const getMocks = () => {
    const { useQuestionnaireStore } = jest.requireMock('../stores');
    const { useRendererConfigStore } = jest.requireMock('../stores/rendererConfigStore');

    return {
      enableWhenIsActivated: useQuestionnaireStore.use.enableWhenIsActivated,
      enableWhenItems: useQuestionnaireStore.use.enableWhenItems,
      enableWhenExpressions: useQuestionnaireStore.use.enableWhenExpressions,
      enableWhenAsReadOnly: useRendererConfigStore.use.enableWhenAsReadOnly
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock returns
    const mocks = getMocks();
    mocks.enableWhenIsActivated.mockReturnValue({});
    mocks.enableWhenItems.mockReturnValue({});
    mocks.enableWhenExpressions.mockReturnValue({});
    mocks.enableWhenAsReadOnly.mockReturnValue(false);
    mockGetHidden.mockReturnValue(false);
    mockIsHiddenByEnableWhen.mockReturnValue(false);
  });

  describe('basic hidden detection', () => {
    it('should return false when item is not hidden', () => {
      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(false);
    });

    it('should call getHidden with correct qItem', () => {
      renderHook(() => useHidden(basicQItem));

      expect(mockGetHidden).toHaveBeenCalledWith(basicQItem);
    });

    it('should return true when item is hidden by SDC', () => {
      mockGetHidden.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });

    it('should access store functions correctly', () => {
      const mocks = getMocks();

      renderHook(() => useHidden(basicQItem));

      expect(mocks.enableWhenIsActivated).toHaveBeenCalled();
      expect(mocks.enableWhenItems).toHaveBeenCalled();
      expect(mocks.enableWhenExpressions).toHaveBeenCalled();
      expect(mocks.enableWhenAsReadOnly).toHaveBeenCalled();
    });
  });

  describe('enableWhen hidden detection', () => {
    it('should call isHiddenByEnableWhen with correct parameters', () => {
      const mockActivated = { item1: true };
      const mockItems = { item1: [] };
      const mockExpressions = { item1: [] };

      const mocks = getMocks();
      mocks.enableWhenIsActivated.mockReturnValue(mockActivated);
      mocks.enableWhenItems.mockReturnValue(mockItems);
      mocks.enableWhenExpressions.mockReturnValue(mockExpressions);

      renderHook(() => useHidden(basicQItem));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: mockActivated,
        enableWhenItems: mockItems,
        enableWhenExpressions: mockExpressions,
        parentRepeatGroupIndex: undefined
      });
    });

    it('should return true when hidden by enableWhen', () => {
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });

    it('should pass parentRepeatGroupIndex when provided', () => {
      const parentIndex = 2;
      renderHook(() => useHidden(basicQItem, parentIndex));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: parentIndex
      });
    });
  });

  describe('enableWhenAsReadOnly behavior', () => {
    it('should return false when enableWhenAsReadOnly is true', () => {
      getMocks().enableWhenAsReadOnly.mockReturnValue(true);
      mockIsHiddenByEnableWhen.mockReturnValue(true); // Would normally be hidden

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(false);
    });

    it('should return false when enableWhenAsReadOnly is Set containing item type', () => {
      const typeSet = new Set(['string', 'group']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(false);
    });

    it('should return hidden result when enableWhenAsReadOnly is Set not containing item type', () => {
      const typeSet = new Set(['group', 'choice']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });

    it('should return hidden result when enableWhenAsReadOnly is false', () => {
      getMocks().enableWhenAsReadOnly.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });
  });

  describe('priority of hidden checks', () => {
    it('should return true for SDC hidden regardless of enableWhen', () => {
      mockGetHidden.mockReturnValue(true);
      mockIsHiddenByEnableWhen.mockReturnValue(false);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });

    it('should return true for SDC hidden regardless of enableWhenAsReadOnly', () => {
      mockGetHidden.mockReturnValue(true);
      getMocks().enableWhenAsReadOnly.mockReturnValue(true);
      mockIsHiddenByEnableWhen.mockReturnValue(false);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });

    it('should check enableWhen only when SDC hidden is false', () => {
      mockGetHidden.mockReturnValue(false);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      renderHook(() => useHidden(basicQItem));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalled();
    });

    it('should not check enableWhen when SDC hidden is true', () => {
      mockGetHidden.mockReturnValue(true);

      renderHook(() => useHidden(basicQItem));

      expect(mockIsHiddenByEnableWhen).not.toHaveBeenCalled();
    });
  });

  describe('different qItem types', () => {
    it('should handle string type items', () => {
      const stringItem: QuestionnaireItem = {
        linkId: 'string-item',
        text: 'String Item',
        type: 'string'
      };

      const typeSet = new Set(['string']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(stringItem));

      expect(result.current).toBe(false);
    });

    it('should handle group type items', () => {
      const typeSet = new Set(['group']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(groupQItem));

      expect(result.current).toBe(false);
    });

    it('should handle choice type items', () => {
      const choiceItem: QuestionnaireItem = {
        linkId: 'choice-item',
        text: 'Choice Item',
        type: 'choice'
      };

      const typeSet = new Set(['choice']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(choiceItem));

      expect(result.current).toBe(false);
    });

    it('should handle integer type items', () => {
      const integerItem: QuestionnaireItem = {
        linkId: 'integer-item',
        text: 'Integer Item',
        type: 'integer'
      };

      const typeSet = new Set(['string']); // Does not include integer
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(integerItem));

      expect(result.current).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should handle complex enableWhen data structures', () => {
      const complexActivated = {
        item1: true,
        item2: false,
        'nested.item': true
      };
      const complexItems = {
        item1: [{ answer: { valueString: 'yes' } }],
        item2: []
      };
      const complexExpressions = {
        item1: [{ language: 'text/fhirpath', expression: '%age > 18' }]
      };

      getMocks().enableWhenIsActivated.mockReturnValue(complexActivated);
      getMocks().enableWhenItems.mockReturnValue(complexItems);
      getMocks().enableWhenExpressions.mockReturnValue(complexExpressions);

      renderHook(() => useHidden(basicQItem));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: complexActivated,
        enableWhenItems: complexItems,
        enableWhenExpressions: complexExpressions,
        parentRepeatGroupIndex: undefined
      });
    });

    it('should handle enableWhenAsReadOnly with multiple types', () => {
      const multiTypeSet = new Set(['string', 'integer', 'decimal', 'boolean']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(multiTypeSet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(false);
    });

    it('should handle nested group items with repeat indices', () => {
      const nestedItem: QuestionnaireItem = {
        linkId: 'nested.group.item',
        text: 'Nested Group Item',
        type: 'group'
      };

      const parentIndex = 3;
      renderHook(() => useHidden(nestedItem, parentIndex));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: nestedItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: parentIndex
      });
    });
  });

  describe('edge cases', () => {
    it('should handle qItem without type property', () => {
      const noTypeItem = {
        linkId: 'no-type',
        text: 'No Type Item'
      } as QuestionnaireItem;

      const typeSet = new Set(['string']);
      getMocks().enableWhenAsReadOnly.mockReturnValue(typeSet);

      const { result } = renderHook(() => useHidden(noTypeItem));

      // Should not match the set since type is undefined
      expect(result.current).toBe(false); // Falls back to enableWhen result
    });

    it('should handle empty enableWhenAsReadOnly Set', () => {
      const emptySet = new Set<string>();
      getMocks().enableWhenAsReadOnly.mockReturnValue(emptySet);
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(basicQItem));

      expect(result.current).toBe(true);
    });

    it('should handle null/undefined store returns', () => {
      getMocks().enableWhenIsActivated.mockReturnValue(null);
      getMocks().enableWhenItems.mockReturnValue(null);
      getMocks().enableWhenExpressions.mockReturnValue(null);

      renderHook(() => useHidden(basicQItem));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: null,
        enableWhenItems: null,
        enableWhenExpressions: null,
        parentRepeatGroupIndex: undefined
      });
    });

    it('should handle very large parentRepeatGroupIndex', () => {
      const largeIndex = 999999;
      renderHook(() => useHidden(basicQItem, largeIndex));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: largeIndex
      });
    });

    it('should handle negative parentRepeatGroupIndex', () => {
      const negativeIndex = -1;
      renderHook(() => useHidden(basicQItem, negativeIndex));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: negativeIndex
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle conditional section hiding', () => {
      const conditionalSection: QuestionnaireItem = {
        linkId: 'medical-history',
        text: 'Medical History',
        type: 'group'
      };

      // Simulate hidden based on "Do you have medical history?" = No
      mockIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(conditionalSection));

      expect(result.current).toBe(true);
    });

    it('should handle readonly display mode', () => {
      getMocks().enableWhenAsReadOnly.mockReturnValue(true);
      mockIsHiddenByEnableWhen.mockReturnValue(true); // Would be hidden normally

      const { result } = renderHook(() => useHidden(basicQItem));

      // Should show as readonly instead of hiding
      expect(result.current).toBe(false);
    });

    it('should handle form sections with admin visibility', () => {
      const adminSection: QuestionnaireItem = {
        linkId: 'admin-notes',
        text: 'Administrative Notes',
        type: 'text'
      };

      // Admin section hidden by extension
      mockGetHidden.mockReturnValue(true);

      const { result } = renderHook(() => useHidden(adminSection));

      expect(result.current).toBe(true);
    });

    it('should handle repeated group items', () => {
      const repeatedItem: QuestionnaireItem = {
        linkId: 'family-member',
        text: 'Family Member Details',
        type: 'group'
      };

      const groupIndex = 1; // Second instance
      renderHook(() => useHidden(repeatedItem, groupIndex));

      expect(mockIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: repeatedItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: groupIndex
      });
    });
  });

  describe('performance considerations', () => {
    it('should handle frequent re-renders efficiently', () => {
      const { rerender } = renderHook(({ qItem, parentIndex }) => useHidden(qItem, parentIndex), {
        initialProps: { qItem: basicQItem, parentIndex: 0 }
      });

      // Multiple re-renders with same props
      for (let i = 0; i < 10; i++) {
        rerender({ qItem: basicQItem, parentIndex: 0 });
      }

      // Store functions should be called for each render (initial + 10 re-renders)
      expect(getMocks().enableWhenIsActivated).toHaveBeenCalledTimes(11);
    });

    it('should handle different qItems efficiently', () => {
      const { rerender } = renderHook(({ qItem }) => useHidden(qItem), {
        initialProps: { qItem: basicQItem }
      });

      // Switch between different qItems
      rerender({ qItem: groupQItem });
      rerender({ qItem: basicQItem });

      expect(mockGetHidden).toHaveBeenCalledWith(basicQItem);
      expect(mockGetHidden).toHaveBeenCalledWith(groupQItem);
    });
  });
});
