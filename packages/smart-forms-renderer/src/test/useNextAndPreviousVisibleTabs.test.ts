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
import useNextAndPreviousVisibleTabs from '../hooks/useNextAndPreviousVisibleTabs';
import type { Tabs } from '../interfaces/tab.interface';

// Mock questionnaire store
const mockEnableWhenIsActivated = false;
const mockEnableWhenItems = {};
const mockEnableWhenExpressions = {};

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      enableWhenIsActivated: () => mockEnableWhenIsActivated,
      enableWhenItems: () => mockEnableWhenItems,
      enableWhenExpressions: () => mockEnableWhenExpressions
    }
  }
}));

// Mock tabs utility
const mockConstructTabsWithVisibility = jest.fn();
jest.mock('../utils/tabs', () => ({
  constructTabsWithVisibility: (...args: any[]) => mockConstructTabsWithVisibility(...args)
}));

describe('useNextAndPreviousVisibleTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization and edge cases', () => {
    it('should return default values when currentTabIndex is undefined', () => {
      const tabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false }
      };

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(undefined, tabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 0
      });
      expect(mockConstructTabsWithVisibility).not.toHaveBeenCalled();
    });

    it('should return default values when tabs is undefined', () => {
      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(0, undefined)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 0
      });
      expect(mockConstructTabsWithVisibility).not.toHaveBeenCalled();
    });

    it('should return default values when both currentTabIndex and tabs are undefined', () => {
      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(undefined, undefined)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 0
      });
      expect(mockConstructTabsWithVisibility).not.toHaveBeenCalled();
    });
  });

  describe('basic navigation functionality', () => {
    const mockTabs: Tabs = {
      'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
      'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },
      'tab-3': { tabIndex: 2, isComplete: false, isHidden: false },
      'tab-4': { tabIndex: 3, isComplete: false, isHidden: false }
    };

    it('should navigate from middle tab with all tabs visible', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true },
        { linkId: 'tab-3', isVisible: true },
        { linkId: 'tab-4', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 0,
        nextTabIndex: 2,
        numOfVisibleTabs: 4
      });

      expect(mockConstructTabsWithVisibility).toHaveBeenCalledWith({
        tabs: mockTabs,
        enableWhenIsActivated: mockEnableWhenIsActivated,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });
    });

    it('should handle first tab with no previous tab', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true },
        { linkId: 'tab-3', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(0, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: 1,
        numOfVisibleTabs: 3
      });
    });

    it('should handle last tab with no next tab', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true },
        { linkId: 'tab-3', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(2, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 1,
        nextTabIndex: null,
        numOfVisibleTabs: 3
      });
    });

    it('should handle single visible tab', () => {
      const singleTab: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: false }
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(0, singleTab)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 1
      });
    });
  });

  describe('visibility-based navigation', () => {
    const mockTabs: Tabs = {
      'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
      'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },
      'tab-3': { tabIndex: 2, isComplete: false, isHidden: false },
      'tab-4': { tabIndex: 3, isComplete: false, isHidden: false },
      'tab-5': { tabIndex: 4, isComplete: false, isHidden: false }
    };

    it('should skip invisible tabs when finding previous tab', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },   // index 0
        { linkId: 'tab-2', isVisible: false },  // index 1 - hidden
        { linkId: 'tab-3', isVisible: false },  // index 2 - hidden
        { linkId: 'tab-4', isVisible: true },   // index 3 - current
        { linkId: 'tab-5', isVisible: true }    // index 4
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(3, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 0, // Should skip hidden tabs 1 and 2
        nextTabIndex: 4,
        numOfVisibleTabs: 3
      });
    });

    it('should skip invisible tabs when finding next tab', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },   // index 0
        { linkId: 'tab-2', isVisible: true },   // index 1 - current
        { linkId: 'tab-3', isVisible: false },  // index 2 - hidden
        { linkId: 'tab-4', isVisible: false },  // index 3 - hidden
        { linkId: 'tab-5', isVisible: true }    // index 4
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 0,
        nextTabIndex: 4, // Should skip hidden tabs 2 and 3
        numOfVisibleTabs: 3
      });
    });

    it('should handle all tabs hidden except current', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: false },  // index 0 - hidden
        { linkId: 'tab-2', isVisible: true },   // index 1 - current (only visible)
        { linkId: 'tab-3', isVisible: false },  // index 2 - hidden
        { linkId: 'tab-4', isVisible: false }   // index 3 - hidden
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 1
      });
    });

    it('should handle all tabs hidden', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: false },
        { linkId: 'tab-2', isVisible: false },
        { linkId: 'tab-3', isVisible: false }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 0
      });
    });
  });

  describe('complex visibility patterns', () => {
    const mockTabs: Tabs = {
      'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
      'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },
      'tab-3': { tabIndex: 2, isComplete: false, isHidden: false },
      'tab-4': { tabIndex: 3, isComplete: false, isHidden: false },
      'tab-5': { tabIndex: 4, isComplete: false, isHidden: false },
      'tab-6': { tabIndex: 5, isComplete: false, isHidden: false },
      'tab-7': { tabIndex: 6, isComplete: false, isHidden: false }
    };

    it('should handle alternating visibility pattern', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },   // index 0
        { linkId: 'tab-2', isVisible: false },  // index 1 - hidden
        { linkId: 'tab-3', isVisible: true },   // index 2
        { linkId: 'tab-4', isVisible: false },  // index 3 - hidden
        { linkId: 'tab-5', isVisible: true },   // index 4 - current
        { linkId: 'tab-6', isVisible: false },  // index 5 - hidden
        { linkId: 'tab-7', isVisible: true }    // index 6
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(4, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 2,
        nextTabIndex: 6,
        numOfVisibleTabs: 4
      });
    });

    it('should handle gaps at beginning and end', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: false },  // index 0 - hidden
        { linkId: 'tab-2', isVisible: false },  // index 1 - hidden
        { linkId: 'tab-3', isVisible: true },   // index 2 - current
        { linkId: 'tab-4', isVisible: true },   // index 3
        { linkId: 'tab-5', isVisible: false },  // index 4 - hidden
        { linkId: 'tab-6', isVisible: false }   // index 5 - hidden
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(2, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null, // No visible tabs before index 2
        nextTabIndex: 3,
        numOfVisibleTabs: 2
      });
    });

    it('should handle consecutive hidden tabs before current', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },   // index 0
        { linkId: 'tab-2', isVisible: false },  // index 1 - hidden
        { linkId: 'tab-3', isVisible: false },  // index 2 - hidden
        { linkId: 'tab-4', isVisible: false },  // index 3 - hidden
        { linkId: 'tab-5', isVisible: true },   // index 4 - current
        { linkId: 'tab-6', isVisible: true }    // index 5
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(4, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 0,
        nextTabIndex: 5,
        numOfVisibleTabs: 3
      });
    });

    it('should handle consecutive hidden tabs after current', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },   // index 0
        { linkId: 'tab-2', isVisible: true },   // index 1 - current
        { linkId: 'tab-3', isVisible: false },  // index 2 - hidden
        { linkId: 'tab-4', isVisible: false },  // index 3 - hidden
        { linkId: 'tab-5', isVisible: false },  // index 4 - hidden
        { linkId: 'tab-6', isVisible: true }    // index 5
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 0,
        nextTabIndex: 5,
        numOfVisibleTabs: 3
      });
    });
  });

  describe('boundary conditions', () => {
    it('should handle currentTabIndex beyond tabs length', () => {
      const mockTabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false }
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(5, mockTabs) // Index beyond array
      );

      expect(result.current).toEqual({
        previousTabIndex: 4, // Reverse search from index 5: (5 - 0 - 1) = 4 
        nextTabIndex: null,  // No tabs after index 5
        numOfVisibleTabs: 2
      });
    });

    it('should handle negative currentTabIndex', () => {
      const mockTabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false }
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(-1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null, // No tabs before negative index
        nextTabIndex: 0,        // First visible tab
        numOfVisibleTabs: 2
      });
    });

    it('should handle currentTabIndex of 0 with first tab hidden', () => {
      const mockTabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },
        'tab-3': { tabIndex: 2, isComplete: false, isHidden: false }
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: false }, // index 0 - hidden but current
        { linkId: 'tab-2', isVisible: true },  // index 1
        { linkId: 'tab-3', isVisible: true }   // index 2
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(0, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: 1,
        numOfVisibleTabs: 2
      });
    });
  });

  describe('enable when integration', () => {
    const mockTabs: Tabs = {
      'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
      'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },
      'tab-3': { tabIndex: 2, isComplete: false, isHidden: false }
    };

    it('should pass enable when parameters to constructTabsWithVisibility', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true },
        { linkId: 'tab-3', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(mockConstructTabsWithVisibility).toHaveBeenCalledWith({
        tabs: mockTabs,
        enableWhenIsActivated: mockEnableWhenIsActivated,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });
    });

    it('should call constructTabsWithVisibility only once per render', () => {
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { rerender } = renderHook(
        ({ tabIndex, tabs }) => useNextAndPreviousVisibleTabs(tabIndex, tabs),
        { initialProps: { tabIndex: 0, tabs: mockTabs } }
      );

      expect(mockConstructTabsWithVisibility).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender({ tabIndex: 0, tabs: mockTabs });
      expect(mockConstructTabsWithVisibility).toHaveBeenCalledTimes(2);

      // Rerender with different props
      rerender({ tabIndex: 1, tabs: mockTabs });
      expect(mockConstructTabsWithVisibility).toHaveBeenCalledTimes(3);
    });
  });

  describe('tab completion and hidden states', () => {
    it('should handle tabs with different completion states', () => {
      const mockTabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: true, isHidden: false },   // Completed
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },  // Current, not completed
        'tab-3': { tabIndex: 2, isComplete: false, isHidden: false }   // Not completed
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: true },
        { linkId: 'tab-3', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: 0,
        nextTabIndex: 2,
        numOfVisibleTabs: 3
      });
    });

    it('should handle tabs with different hidden states in input', () => {
      const mockTabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: true },   // Hidden in input
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },  // Current
        'tab-3': { tabIndex: 2, isComplete: false, isHidden: false }   // Not hidden
      };
      // Note: actual visibility determined by constructTabsWithVisibility, not input isHidden
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: false }, // May be hidden due to enableWhen logic
        { linkId: 'tab-2', isVisible: true },
        { linkId: 'tab-3', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null, // tab-1 is not visible
        nextTabIndex: 2,
        numOfVisibleTabs: 2
      });
    });
  });

  describe('empty and minimal tab sets', () => {
    it('should handle empty tabs object', () => {
      const emptyTabs: Tabs = {};
      const mockTabsWithVisibility: { linkId: string; isVisible: boolean }[] = [];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(0, emptyTabs)
      );

      expect(result.current).toEqual({
        previousTabIndex: null,
        nextTabIndex: null,
        numOfVisibleTabs: 0
      });
    });

    it('should handle tabs with non-sequential indices', () => {
      const mockTabs: Tabs = {
        'tab-a': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab-b': { tabIndex: 2, isComplete: false, isHidden: false }, // Gap in indices
        'tab-c': { tabIndex: 5, isComplete: false, isHidden: false }
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-a', isVisible: true },  // position 0
        { linkId: 'tab-b', isVisible: true },  // position 1 - current
        { linkId: 'tab-c', isVisible: true }   // position 2
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(1, mockTabs) // Position 1 in the array
      );

      expect(result.current).toEqual({
        previousTabIndex: 0, // Position 0 in the array
        nextTabIndex: 2,     // Position 2 in the array
        numOfVisibleTabs: 3
      });
    });
  });

  describe('performance and edge case scenarios', () => {
    it('should handle large number of tabs efficiently', () => {
      const largeTabs: Tabs = {};
      const mockTabsWithVisibility: { linkId: string; isVisible: boolean }[] = [];
      
      // Create 1000 tabs
      for (let i = 0; i < 1000; i++) {
        largeTabs[`tab-${i}`] = { tabIndex: i, isComplete: false, isHidden: false };
        mockTabsWithVisibility.push({ linkId: `tab-${i}`, isVisible: i % 2 === 0 }); // Every other tab visible
      }
      
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisibleTabs(500, largeTabs) // Middle tab
      );

      expect(result.current).toEqual({
        previousTabIndex: 498, // Previous even number
        nextTabIndex: 502,     // Next even number  
        numOfVisibleTabs: 500  // Half of 1000 tabs
      });
    });

    it('should maintain consistent results across multiple calls', () => {
      const mockTabs: Tabs = {
        'tab-1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab-2': { tabIndex: 1, isComplete: false, isHidden: false },
        'tab-3': { tabIndex: 2, isComplete: false, isHidden: false }
      };
      const mockTabsWithVisibility = [
        { linkId: 'tab-1', isVisible: true },
        { linkId: 'tab-2', isVisible: false },
        { linkId: 'tab-3', isVisible: true }
      ];
      mockConstructTabsWithVisibility.mockReturnValue(mockTabsWithVisibility);

      const { result: result1 } = renderHook(() => 
        useNextAndPreviousVisibleTabs(2, mockTabs)
      );
      const { result: result2 } = renderHook(() => 
        useNextAndPreviousVisibleTabs(2, mockTabs)
      );

      expect(result1.current).toEqual(result2.current);
      expect(result1.current).toEqual({
        previousTabIndex: 0,
        nextTabIndex: null,
        numOfVisibleTabs: 2
      });
    });
  });
});
