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
import useContextDisplayItems from '../hooks/useContextDisplayItems';

// Mock the utility function
const mockGetContextDisplays = jest.fn();

jest.mock('../utils/tabs', () => ({
  getContextDisplays: (...args: any[]) => mockGetContextDisplays(...args)
}));

describe('useContextDisplayItems', () => {
  // Test data
  const basicTopLevelItem: QuestionnaireItem = {
    linkId: 'basic-item',
    text: 'Basic Item',
    type: 'group'
  };

  const anotherTopLevelItem: QuestionnaireItem = {
    linkId: 'another-item',
    text: 'Another Item',
    type: 'group'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock return
    mockGetContextDisplays.mockReturnValue([]);
  });

  describe('basic functionality', () => {
    it('should process empty top level items', () => {
      const { result } = renderHook(() => useContextDisplayItems([]));

      expect(result.current.allContextDisplayItems).toEqual([]);
      expect(result.current.completedDisplayItemExists).toBe(false);
      expect(mockGetContextDisplays).not.toHaveBeenCalled();
    });

    it('should call getContextDisplays for each top level item', () => {
      const topLevelItems = [basicTopLevelItem, anotherTopLevelItem];
      
      renderHook(() => useContextDisplayItems(topLevelItems));

      expect(mockGetContextDisplays).toHaveBeenCalledTimes(2);
      expect(mockGetContextDisplays).toHaveBeenNthCalledWith(1, basicTopLevelItem);
      expect(mockGetContextDisplays).toHaveBeenNthCalledWith(2, anotherTopLevelItem);
    });

    it('should return all context display items from utility function', () => {
      const mockContextDisplays1 = [
        { text: 'Display 1' },
        { text: 'Display 2' }
      ];
      const mockContextDisplays2 = [
        { text: 'Display 3' }
      ];

      mockGetContextDisplays
        .mockReturnValueOnce(mockContextDisplays1)
        .mockReturnValueOnce(mockContextDisplays2);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem, anotherTopLevelItem]));

      expect(result.current.allContextDisplayItems).toEqual([
        mockContextDisplays1,
        mockContextDisplays2
      ]);
    });
  });

  describe('completedDisplayItemExists detection', () => {
    it('should detect when no Complete items exist', () => {
      const mockContextDisplays = [
        { text: 'Progress' },
        { text: 'In Progress' },
        { text: 'Started' }
      ];

      mockGetContextDisplays.mockReturnValue(mockContextDisplays);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      expect(result.current.completedDisplayItemExists).toBe(false);
    });

    it('should detect when Complete item exists', () => {
      const mockContextDisplays = [
        { text: 'Progress' },
        { text: 'Complete' },
        { text: 'Started' }
      ];

      mockGetContextDisplays.mockReturnValue(mockContextDisplays);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      expect(result.current.completedDisplayItemExists).toBe(true);
    });

    it('should detect Complete item across multiple top level items', () => {
      const mockContextDisplays1 = [
        { text: 'Progress' },
        { text: 'Started' }
      ];
      const mockContextDisplays2 = [
        { text: 'Complete' }
      ];

      mockGetContextDisplays
        .mockReturnValueOnce(mockContextDisplays1)
        .mockReturnValueOnce(mockContextDisplays2);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem, anotherTopLevelItem]));

      expect(result.current.completedDisplayItemExists).toBe(true);
    });

    it('should handle case-sensitive Complete detection', () => {
      const mockContextDisplays = [
        { text: 'complete' }, // lowercase
        { text: 'COMPLETE' }, // uppercase
        { text: 'Complete' }  // exact match
      ];

      mockGetContextDisplays.mockReturnValue(mockContextDisplays);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      expect(result.current.completedDisplayItemExists).toBe(true);
    });

    it('should not match partial Complete text', () => {
      const mockContextDisplays = [
        { text: 'Incomplete' },
        { text: 'Completed Successfully' },
        { text: 'Complete Task' }
      ];

      mockGetContextDisplays.mockReturnValue(mockContextDisplays);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      // Should only match exact 'Complete' text
      expect(result.current.completedDisplayItemExists).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty context displays', () => {
      mockGetContextDisplays.mockReturnValue([]);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      expect(result.current.allContextDisplayItems).toEqual([[]]);
      expect(result.current.completedDisplayItemExists).toBe(false);
    });

    it('should handle context displays with missing text property', () => {
      const mockContextDisplays = [
        { text: 'Valid Item' },
        { id: 'no-text' }, // Missing text property
        { text: null }, // Null text
        { text: undefined } // Undefined text
      ];

      mockGetContextDisplays.mockReturnValue(mockContextDisplays);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      expect(result.current.allContextDisplayItems).toEqual([mockContextDisplays]);
      expect(result.current.completedDisplayItemExists).toBe(false);
    });

    it('should handle null/undefined items in context displays', () => {
      const mockContextDisplays = [
        null,
        { text: 'Valid Item' },
        undefined,
        { text: 'Complete' }
      ];

      mockGetContextDisplays.mockReturnValue(mockContextDisplays);

      // The hook should throw an error because it doesn't handle null items
      expect(() => {
        renderHook(() => useContextDisplayItems([basicTopLevelItem]));
      }).toThrow();
    });

    it('should handle getContextDisplays throwing error', () => {
      mockGetContextDisplays.mockImplementation(() => {
        throw new Error('getContextDisplays failed');
      });

      expect(() => {
        renderHook(() => useContextDisplayItems([basicTopLevelItem]));
      }).toThrow('getContextDisplays failed');
    });

    it('should handle null top level items', () => {
      const topLevelItems = [basicTopLevelItem, null as any, anotherTopLevelItem];
      
      mockGetContextDisplays.mockReturnValue([]);

      const { result } = renderHook(() => useContextDisplayItems(topLevelItems));

      expect(mockGetContextDisplays).toHaveBeenCalledTimes(3);
      expect(mockGetContextDisplays).toHaveBeenNthCalledWith(2, null);
    });
  });

  describe('memoization behavior', () => {
    it('should memoize results when top level items do not change', () => {
      const topLevelItems = [basicTopLevelItem];
      mockGetContextDisplays.mockReturnValue([{ text: 'Display Item' }]);

      const { result, rerender } = renderHook(
        ({ items }) => useContextDisplayItems(items),
        { initialProps: { items: topLevelItems } }
      );

      const firstResult = result.current;

      // Re-render with same items
      rerender({ items: topLevelItems });

      expect(result.current).toBe(firstResult); // Reference equality
      expect(mockGetContextDisplays).toHaveBeenCalledTimes(1); // Should not call again
    });

    it('should recompute when top level items change', () => {
      const initialItems = [basicTopLevelItem];
      const newItems = [anotherTopLevelItem];
      
      mockGetContextDisplays.mockReturnValue([{ text: 'Display Item' }]);

      const { result, rerender } = renderHook(
        ({ items }) => useContextDisplayItems(items),
        { initialProps: { items: initialItems } }
      );

      const firstResult = result.current;

      // Change items
      rerender({ items: newItems });

      expect(result.current).not.toBe(firstResult);
      expect(mockGetContextDisplays).toHaveBeenCalledTimes(2);
      expect(mockGetContextDisplays).toHaveBeenLastCalledWith(anotherTopLevelItem);
    });

    it('should recompute when array reference changes but content is same', () => {
      const item1 = { ...basicTopLevelItem };
      const item2 = { ...basicTopLevelItem }; // Same content, different reference
      
      mockGetContextDisplays.mockReturnValue([]);

      const { result, rerender } = renderHook(
        ({ items }) => useContextDisplayItems(items),
        { initialProps: { items: [item1] } }
      );

      const firstResult = result.current;

      // Different array reference
      rerender({ items: [item2] });

      expect(result.current).not.toBe(firstResult);
      expect(mockGetContextDisplays).toHaveBeenCalledTimes(2);
    });

    it('should handle deep array changes', () => {
      const initialItems = [basicTopLevelItem, anotherTopLevelItem];
      const newItems = [basicTopLevelItem]; // Removed one item
      
      mockGetContextDisplays.mockReturnValue([]);

      const { result, rerender } = renderHook(
        ({ items }) => useContextDisplayItems(items),
        { initialProps: { items: initialItems } }
      );

      expect(mockGetContextDisplays).toHaveBeenCalledTimes(2);

      rerender({ items: newItems });

      expect(mockGetContextDisplays).toHaveBeenCalledTimes(3); // +1 for new items
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed context displays with multiple Complete items', () => {
      const mockContextDisplays1 = [
        { text: 'Progress' },
        { text: 'Complete' }
      ];
      const mockContextDisplays2 = [
        { text: 'Complete' },
        { text: 'In Progress' }
      ];

      mockGetContextDisplays
        .mockReturnValueOnce(mockContextDisplays1)
        .mockReturnValueOnce(mockContextDisplays2);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem, anotherTopLevelItem]));

      expect(result.current.allContextDisplayItems).toEqual([
        mockContextDisplays1,
        mockContextDisplays2
      ]);
      expect(result.current.completedDisplayItemExists).toBe(true);
    });

    it('should handle large number of top level items', () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        linkId: `item-${i}`,
        text: `Item ${i}`,
        type: 'group' as const
      }));

      // Return Complete for item at index 50
      mockGetContextDisplays.mockImplementation((item) => {
        if (item.linkId === 'item-50') {
          return [{ text: 'Complete' }];
        }
        return [{ text: 'In Progress' }];
      });

      const { result } = renderHook(() => useContextDisplayItems(manyItems));

      expect(mockGetContextDisplays).toHaveBeenCalledTimes(100);
      expect(result.current.allContextDisplayItems).toHaveLength(100);
      expect(result.current.completedDisplayItemExists).toBe(true);
    });

    it('should handle nested context display structures', () => {
      const complexContextDisplays = [
        {
          text: 'Section 1',
          children: [
            { text: 'Subsection A' },
            { text: 'Complete' }
          ]
        },
        {
          text: 'Section 2',
          nested: {
            status: { text: 'In Progress' }
          }
        }
      ];

      mockGetContextDisplays.mockReturnValue(complexContextDisplays);

      const { result } = renderHook(() => useContextDisplayItems([basicTopLevelItem]));

      expect(result.current.allContextDisplayItems).toEqual([complexContextDisplays]);
      // Hook doesn't search nested structures, so 'Complete' in children won't be found
      expect(result.current.completedDisplayItemExists).toBe(false);
    });
  });

  describe('real-world usage scenarios', () => {
    it('should handle questionnaire form with progress tracking', () => {
      const formSections = [
        { linkId: 'personal-info', text: 'Personal Information', type: 'group' as const },
        { linkId: 'medical-history', text: 'Medical History', type: 'group' as const },
        { linkId: 'preferences', text: 'Preferences', type: 'group' as const }
      ];

      mockGetContextDisplays
        .mockReturnValueOnce([{ text: 'Complete' }])      // Personal info complete
        .mockReturnValueOnce([{ text: 'In Progress' }])   // Medical history in progress
        .mockReturnValueOnce([{ text: 'Not Started' }]);  // Preferences not started

      const { result } = renderHook(() => useContextDisplayItems(formSections));

      expect(result.current.completedDisplayItemExists).toBe(true);
      expect(result.current.allContextDisplayItems).toHaveLength(3);
    });

    it('should handle multi-step wizard with completion status', () => {
      const wizardSteps = [
        { linkId: 'step-1', text: 'Basic Details', type: 'group' as const },
        { linkId: 'step-2', text: 'Advanced Settings', type: 'group' as const }
      ];

      mockGetContextDisplays
        .mockReturnValueOnce([
          { text: 'Step 1 of 3' },
          { text: 'Complete' }
        ])
        .mockReturnValueOnce([
          { text: 'Step 2 of 3' },
          { text: 'Current' }
        ]);

      const { result } = renderHook(() => useContextDisplayItems(wizardSteps));

      expect(result.current.completedDisplayItemExists).toBe(true);
    });

    it('should handle form with conditional sections', () => {
      const conditionalSections = [
        { linkId: 'always-shown', text: 'Always Shown', type: 'group' as const },
        { linkId: 'conditional', text: 'Conditional Section', type: 'group' as const }
      ];

      // Conditional section might not have context displays
      mockGetContextDisplays
        .mockReturnValueOnce([{ text: 'In Progress' }])
        .mockReturnValueOnce([]); // Empty for conditional section

      const { result } = renderHook(() => useContextDisplayItems(conditionalSections));

      expect(result.current.allContextDisplayItems).toEqual([
        [{ text: 'In Progress' }],
        []
      ]);
      expect(result.current.completedDisplayItemExists).toBe(false);
    });
  });

  describe('performance considerations', () => {
    it('should minimize re-computations with memoization', () => {
      const items = [basicTopLevelItem];
      mockGetContextDisplays.mockReturnValue([{ text: 'Test' }]);

      const { rerender } = renderHook(
        ({ items }) => useContextDisplayItems(items),
        { initialProps: { items } }
      );

      expect(mockGetContextDisplays).toHaveBeenCalledTimes(1);

      // Multiple re-renders with same items
      rerender({ items });
      rerender({ items });
      rerender({ items });

      // Should not call getContextDisplays again
      expect(mockGetContextDisplays).toHaveBeenCalledTimes(1);
    });

    it('should handle frequent array updates efficiently', () => {
      const baseItems = [basicTopLevelItem];
      mockGetContextDisplays.mockReturnValue([]);

      const { rerender } = renderHook(
        ({ items }) => useContextDisplayItems(items),
        { initialProps: { items: baseItems } }
      );

      // Simulate frequent updates
      for (let i = 0; i < 5; i++) {
        const newItems = [...baseItems, { 
          linkId: `dynamic-${i}`, 
          text: `Dynamic ${i}`, 
          type: 'group' as const 
        }];
        rerender({ items: newItems });
      }

      // Should call for initial + 5 updates
      expect(mockGetContextDisplays).toHaveBeenCalledTimes(11); // 1 initial + (2*5) for each update
    });
  });
});
