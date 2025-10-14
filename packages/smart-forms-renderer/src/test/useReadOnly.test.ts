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
import useReadOnly from '../hooks/useReadOnly';
import useRenderingExtensions from '../hooks/useRenderingExtensions';
import { useQuestionnaireStore } from '../stores';
import { useRendererConfigStore } from '../stores/rendererConfigStore';
import { isHiddenByEnableWhen } from '../utils/qItem';

// Mock setup with proper hoisting support

// Mock the dependent hook
jest.mock('../hooks/useRenderingExtensions', () => {
  return jest.fn();
});

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

jest.mock('../utils/qItem', () => ({
  isHiddenByEnableWhen: jest.fn()
}));

// Now safely assign the mocks after imports
const mockedUseRenderingExtensions = useRenderingExtensions as jest.MockedFunction<
  typeof useRenderingExtensions
>;
const mockedUseQuestionnaireStore = useQuestionnaireStore as any;
const mockeduseRendererConfigStore = useRendererConfigStore as any;
const mockedIsHiddenByEnableWhen = isHiddenByEnableWhen as jest.MockedFunction<
  typeof isHiddenByEnableWhen
>;

describe('useReadOnly', () => {
  // Test data
  const basicQItem: QuestionnaireItem = {
    linkId: 'basic-item',
    text: 'Basic Item',
    type: 'string'
  };

  const readOnlyQItem: QuestionnaireItem = {
    linkId: 'readonly-item',
    text: 'ReadOnly Item',
    type: 'string',
    readOnly: true
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock returns
    mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
    mockedUseQuestionnaireStore.use.enableWhenIsActivated.mockReturnValue({});
    mockedUseQuestionnaireStore.use.enableWhenItems.mockReturnValue({});
    mockedUseQuestionnaireStore.use.enableWhenExpressions.mockReturnValue({});
    mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(false);
    mockedIsHiddenByEnableWhen.mockReturnValue(false);
  });

  describe('basic readOnly logic', () => {
    it('should return false when item is not readOnly and parent is not readOnly', () => {
      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(false);
    });

    it('should return true when item has readOnly from rendering extensions', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: true } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });

    it('should call useRenderingExtensions with correct qItem', () => {
      renderHook(() => useReadOnly(basicQItem, false));

      expect(mockedUseRenderingExtensions).toHaveBeenCalledWith(basicQItem);
    });

    it('should access store functions correctly', () => {
      renderHook(() => useReadOnly(basicQItem, false));

      expect(mockedUseQuestionnaireStore.use.enableWhenIsActivated).toHaveBeenCalled();
      expect(mockedUseQuestionnaireStore.use.enableWhenItems).toHaveBeenCalled();
      expect(mockedUseQuestionnaireStore.use.enableWhenExpressions).toHaveBeenCalled();
      expect(mockeduseRendererConfigStore.use.enableWhenAsReadOnly).toHaveBeenCalled();
    });
  });

  describe('parent readOnly override', () => {
    it('should return true when parent is readOnly regardless of item settings', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, true));

      expect(result.current).toBe(true);
    });

    it('should return true when both parent and item are readOnly', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: true } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, true));

      expect(result.current).toBe(true);
    });

    it('should handle undefined parentIsReadOnly', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, undefined));

      expect(result.current).toBe(false);
    });

    it('should handle false parentIsReadOnly explicitly', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(false);
    });
  });

  describe('enableWhenAsReadOnly logic', () => {
    it('should set readOnly when enableWhenAsReadOnly is true and item is hidden', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });

    it('should not set readOnly when enableWhenAsReadOnly is true but item is not hidden', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedIsHiddenByEnableWhen.mockReturnValue(false);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(false);
    });

    it('should set readOnly when enableWhenAsReadOnly Set contains item type and item is hidden', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      const typeSet = new Set(['string', 'group']);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });

    it('should not set readOnly when enableWhenAsReadOnly Set does not contain item type', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      const typeSet = new Set(['group', 'choice']);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(false);
    });

    it('should not check isHiddenByEnableWhen when enableWhenAsReadOnly is false', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(false);

      renderHook(() => useReadOnly(basicQItem, false));

      expect(mockedIsHiddenByEnableWhen).not.toHaveBeenCalled();
    });

    it('should not override existing readOnly from rendering extensions', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: true } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedIsHiddenByEnableWhen.mockReturnValue(false);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });
  });

  describe('isHiddenByEnableWhen integration', () => {
    it('should call isHiddenByEnableWhen with correct parameters', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);

      const mockActivated = { item1: true };
      const mockItems = { item1: [] };
      const mockExpressions = { item1: [] };

      mockedUseQuestionnaireStore.use.enableWhenIsActivated.mockReturnValue(mockActivated);
      mockedUseQuestionnaireStore.use.enableWhenItems.mockReturnValue(mockItems);
      mockedUseQuestionnaireStore.use.enableWhenExpressions.mockReturnValue(mockExpressions);

      renderHook(() => useReadOnly(basicQItem, false));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: mockActivated,
        enableWhenItems: mockItems,
        enableWhenExpressions: mockExpressions,
        parentRepeatGroupIndex: undefined
      });
    });

    it('should pass parentRepeatGroupIndex when provided', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);

      const parentIndex = 2;
      renderHook(() => useReadOnly(basicQItem, false, parentIndex));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: parentIndex
      });
    });
  });

  describe('different qItem types', () => {
    it('should handle string type items', () => {
      const stringItem: QuestionnaireItem = {
        linkId: 'string-item',
        text: 'String Item',
        type: 'string'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      const typeSet = new Set(['string']);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(stringItem, false));

      expect(result.current).toBe(true);
    });

    it('should handle group type items', () => {
      const groupItem: QuestionnaireItem = {
        linkId: 'group-item',
        text: 'Group Item',
        type: 'group'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      const typeSet = new Set(['group']);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(groupItem, false));

      expect(result.current).toBe(true);
    });

    it('should handle choice type items', () => {
      const choiceItem: QuestionnaireItem = {
        linkId: 'choice-item',
        text: 'Choice Item',
        type: 'choice'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      const typeSet = new Set(['string']); // Does not include choice
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(choiceItem, false));

      expect(result.current).toBe(false);
    });
  });

  describe('priority and override logic', () => {
    it('should prioritize parent readOnly over all other settings', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, true));

      expect(result.current).toBe(true);
    });

    it('should use rendering extensions readOnly when parent is not readOnly', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: true } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(false);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });

    it('should use enableWhenAsReadOnly when rendering extensions is false and parent is false', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });

    it('should return false when all conditions are false', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(false);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested group items with repeat indices', () => {
      const nestedItem: QuestionnaireItem = {
        linkId: 'nested.group.item',
        text: 'Nested Group Item',
        type: 'group'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);

      const parentIndex = 3;
      renderHook(() => useReadOnly(nestedItem, false, parentIndex));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: nestedItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: parentIndex
      });
    });

    it('should handle multiple type Set with various types', () => {
      const multiTypeSet = new Set(['string', 'integer', 'decimal', 'boolean', 'choice']);
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(multiTypeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });

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

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedUseQuestionnaireStore.use.enableWhenIsActivated.mockReturnValue(complexActivated);
      mockedUseQuestionnaireStore.use.enableWhenItems.mockReturnValue(complexItems);
      mockedUseQuestionnaireStore.use.enableWhenExpressions.mockReturnValue(complexExpressions);

      renderHook(() => useReadOnly(basicQItem, false));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: complexActivated,
        enableWhenItems: complexItems,
        enableWhenExpressions: complexExpressions,
        parentRepeatGroupIndex: undefined
      });
    });
  });

  describe('edge cases', () => {
    it('should handle qItem without type property', () => {
      const noTypeItem = {
        linkId: 'no-type',
        text: 'No Type Item'
      } as QuestionnaireItem;

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      const typeSet = new Set(['string']);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(typeSet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(noTypeItem, false));

      // Should not match the set since type is undefined
      expect(result.current).toBe(false);
    });

    it('should handle empty enableWhenAsReadOnly Set', () => {
      const emptySet = new Set<string>();
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(emptySet);
      mockedIsHiddenByEnableWhen.mockReturnValue(true);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(false);
    });

    it('should handle null/undefined store returns', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedUseQuestionnaireStore.use.enableWhenIsActivated.mockReturnValue(null);
      mockedUseQuestionnaireStore.use.enableWhenItems.mockReturnValue(null);
      mockedUseQuestionnaireStore.use.enableWhenExpressions.mockReturnValue(null);

      renderHook(() => useReadOnly(basicQItem, false));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: null,
        enableWhenItems: null,
        enableWhenExpressions: null,
        parentRepeatGroupIndex: undefined
      });
    });

    it('should handle very large parentRepeatGroupIndex', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);

      const largeIndex = 999999;
      renderHook(() => useReadOnly(basicQItem, false, largeIndex));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: basicQItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: largeIndex
      });
    });

    it('should handle rendering extensions with additional properties', () => {
      mockedUseRenderingExtensions.mockReturnValue({
        readOnly: true,
        displayUnit: 'kg',
        displayPrompt: 'Enter value',
        required: false
      } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      expect(result.current).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle calculated field that should be readonly', () => {
      const calculatedItem: QuestionnaireItem = {
        linkId: 'bmi-calculated',
        text: 'BMI (calculated)',
        type: 'decimal'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: true } as any);

      const { result } = renderHook(() => useReadOnly(calculatedItem, false));

      expect(result.current).toBe(true);
    });

    it('should handle form in review mode where all fields are readonly', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);

      const { result } = renderHook(() => useReadOnly(basicQItem, true)); // Parent readonly

      expect(result.current).toBe(true);
    });

    it('should handle conditional fields shown as readonly instead of hidden', () => {
      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);
      mockedIsHiddenByEnableWhen.mockReturnValue(true); // Would be hidden normally

      const { result } = renderHook(() => useReadOnly(basicQItem, false));

      // Should be readonly instead of hidden
      expect(result.current).toBe(true);
    });

    it('should handle repeated group items in different states', () => {
      const repeatedItem: QuestionnaireItem = {
        linkId: 'medication-dose',
        text: 'Medication Dose',
        type: 'decimal'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: false } as any);
      mockeduseRendererConfigStore.use.enableWhenAsReadOnly.mockReturnValue(true);

      const groupIndex = 1; // Second medication
      renderHook(() => useReadOnly(repeatedItem, false, groupIndex));

      expect(mockedIsHiddenByEnableWhen).toHaveBeenCalledWith({
        linkId: repeatedItem.linkId,
        enableWhenIsActivated: {},
        enableWhenItems: {},
        enableWhenExpressions: {},
        parentRepeatGroupIndex: groupIndex
      });
    });

    it('should handle admin-only fields that users cannot edit', () => {
      const adminField: QuestionnaireItem = {
        linkId: 'admin-notes',
        text: 'Administrative Notes',
        type: 'text'
      };

      mockedUseRenderingExtensions.mockReturnValue({ readOnly: true } as any);

      const { result } = renderHook(() => useReadOnly(adminField, false));

      expect(result.current).toBe(true);
    });
  });

  describe('performance considerations', () => {
    it('should handle frequent re-renders efficiently', () => {
      const { rerender } = renderHook(
        ({ qItem, parentReadOnly, parentIndex }) => useReadOnly(qItem, parentReadOnly, parentIndex),
        { initialProps: { qItem: basicQItem, parentReadOnly: false, parentIndex: 0 } }
      );

      // Multiple re-renders with same props
      for (let i = 0; i < 5; i++) {
        rerender({ qItem: basicQItem, parentReadOnly: false, parentIndex: 0 });
      }

      expect(mockedUseRenderingExtensions).toHaveBeenCalledTimes(6);
    });

    it('should handle different qItems efficiently', () => {
      const { rerender } = renderHook(({ qItem }) => useReadOnly(qItem, false), {
        initialProps: { qItem: basicQItem }
      });

      // Switch between different qItems
      rerender({ qItem: readOnlyQItem });
      rerender({ qItem: basicQItem });

      expect(mockedUseRenderingExtensions).toHaveBeenCalledWith(basicQItem);
      expect(mockedUseRenderingExtensions).toHaveBeenCalledWith(readOnlyQItem);
    });
  });
});
