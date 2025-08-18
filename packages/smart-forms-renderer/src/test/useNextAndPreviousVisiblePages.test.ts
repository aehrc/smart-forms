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
import useNextAndPreviousVisiblePages from '../hooks/useNextAndPreviousVisiblePages';
import type { Pages } from '../interfaces/page.interface';

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

// Mock page utility
const mockConstructPagesWithVisibility = jest.fn();
jest.mock('../utils/page', () => ({
  constructPagesWithVisibility: (...args: any[]) => mockConstructPagesWithVisibility(...args)
}));

describe('useNextAndPreviousVisiblePages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization and edge cases', () => {
    it('should return default values when currentPageIndex is undefined', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(undefined, pages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 0
      });
      expect(mockConstructPagesWithVisibility).not.toHaveBeenCalled();
    });

    it('should return default values when pages is undefined', () => {
      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(0, undefined)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 0
      });
      expect(mockConstructPagesWithVisibility).not.toHaveBeenCalled();
    });

    it('should return default values when both currentPageIndex and pages are undefined', () => {
      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(undefined, undefined)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 0
      });
      expect(mockConstructPagesWithVisibility).not.toHaveBeenCalled();
    });
  });

  describe('basic navigation functionality', () => {
    const mockPages: Pages = {
      'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
      'page-2': { pageIndex: 1, isComplete: false, isHidden: false },
      'page-3': { pageIndex: 2, isComplete: false, isHidden: false },
      'page-4': { pageIndex: 3, isComplete: false, isHidden: false }
    };

    it('should navigate from middle page with all pages visible', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true },
        { linkId: 'page-4', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 0,
        nextPageIndex: 2,
        numOfVisiblePages: 4
      });

      expect(mockConstructPagesWithVisibility).toHaveBeenCalledWith({
        pages: mockPages,
        enableWhenIsActivated: mockEnableWhenIsActivated,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });
    });

    it('should handle first page with no previous page', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(0, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: 1,
        numOfVisiblePages: 3
      });
    });

    it('should handle last page with no next page', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(2, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 1,
        nextPageIndex: null,
        numOfVisiblePages: 3
      });
    });

    it('should handle single visible page', () => {
      const singlePage: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(0, singlePage)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 1
      });
    });
  });

  describe('visibility-based navigation', () => {
    const mockPages: Pages = {
      'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
      'page-2': { pageIndex: 1, isComplete: false, isHidden: false },
      'page-3': { pageIndex: 2, isComplete: false, isHidden: false },
      'page-4': { pageIndex: 3, isComplete: false, isHidden: false },
      'page-5': { pageIndex: 4, isComplete: false, isHidden: false }
    };

    it('should skip invisible pages when finding previous page', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },   // index 0
        { linkId: 'page-2', isVisible: false },  // index 1 - hidden
        { linkId: 'page-3', isVisible: false },  // index 2 - hidden
        { linkId: 'page-4', isVisible: true },   // index 3 - current
        { linkId: 'page-5', isVisible: true }    // index 4
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(3, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 0, // Should skip hidden pages 1 and 2
        nextPageIndex: 4,
        numOfVisiblePages: 3
      });
    });

    it('should skip invisible pages when finding next page', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },   // index 0
        { linkId: 'page-2', isVisible: true },   // index 1 - current
        { linkId: 'page-3', isVisible: false },  // index 2 - hidden
        { linkId: 'page-4', isVisible: false },  // index 3 - hidden
        { linkId: 'page-5', isVisible: true }    // index 4
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 0,
        nextPageIndex: 4, // Should skip hidden pages 2 and 3
        numOfVisiblePages: 3
      });
    });

    it('should handle all pages hidden except current', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: false },  // index 0 - hidden
        { linkId: 'page-2', isVisible: true },   // index 1 - current (only visible)
        { linkId: 'page-3', isVisible: false },  // index 2 - hidden
        { linkId: 'page-4', isVisible: false }   // index 3 - hidden
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 1
      });
    });

    it('should handle all pages hidden', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: false },
        { linkId: 'page-2', isVisible: false },
        { linkId: 'page-3', isVisible: false }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 0
      });
    });
  });

  describe('complex visibility patterns', () => {
    const mockPages: Pages = {
      'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
      'page-2': { pageIndex: 1, isComplete: false, isHidden: false },
      'page-3': { pageIndex: 2, isComplete: false, isHidden: false },
      'page-4': { pageIndex: 3, isComplete: false, isHidden: false },
      'page-5': { pageIndex: 4, isComplete: false, isHidden: false },
      'page-6': { pageIndex: 5, isComplete: false, isHidden: false },
      'page-7': { pageIndex: 6, isComplete: false, isHidden: false }
    };

    it('should handle alternating visibility pattern', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },   // index 0
        { linkId: 'page-2', isVisible: false },  // index 1 - hidden
        { linkId: 'page-3', isVisible: true },   // index 2
        { linkId: 'page-4', isVisible: false },  // index 3 - hidden
        { linkId: 'page-5', isVisible: true },   // index 4 - current
        { linkId: 'page-6', isVisible: false },  // index 5 - hidden
        { linkId: 'page-7', isVisible: true }    // index 6
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(4, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 2,
        nextPageIndex: 6,
        numOfVisiblePages: 4
      });
    });

    it('should handle gaps at beginning and end', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: false },  // index 0 - hidden
        { linkId: 'page-2', isVisible: false },  // index 1 - hidden
        { linkId: 'page-3', isVisible: true },   // index 2 - current
        { linkId: 'page-4', isVisible: true },   // index 3
        { linkId: 'page-5', isVisible: false },  // index 4 - hidden
        { linkId: 'page-6', isVisible: false }   // index 5 - hidden
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(2, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null, // No visible pages before index 2
        nextPageIndex: 3,
        numOfVisiblePages: 2
      });
    });

    it('should handle consecutive hidden pages before current', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },   // index 0
        { linkId: 'page-2', isVisible: false },  // index 1 - hidden
        { linkId: 'page-3', isVisible: false },  // index 2 - hidden
        { linkId: 'page-4', isVisible: false },  // index 3 - hidden
        { linkId: 'page-5', isVisible: true },   // index 4 - current
        { linkId: 'page-6', isVisible: true }    // index 5
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(4, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 0,
        nextPageIndex: 5,
        numOfVisiblePages: 3
      });
    });

    it('should handle consecutive hidden pages after current', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },   // index 0
        { linkId: 'page-2', isVisible: true },   // index 1 - current
        { linkId: 'page-3', isVisible: false },  // index 2 - hidden
        { linkId: 'page-4', isVisible: false },  // index 3 - hidden
        { linkId: 'page-5', isVisible: false },  // index 4 - hidden
        { linkId: 'page-6', isVisible: true }    // index 5
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 0,
        nextPageIndex: 5,
        numOfVisiblePages: 3
      });
    });
  });

  describe('boundary conditions', () => {
    it('should handle currentPageIndex beyond pages length', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(5, mockPages) // Index beyond array
      );

      expect(result.current).toEqual({
        previousPageIndex: 4, // Reverse search from index 5: (5 - 0 - 1) = 4 
        nextPageIndex: null,  // No pages after index 5
        numOfVisiblePages: 2
      });
    });

    it('should handle negative currentPageIndex', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(-1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null, // No pages before negative index
        nextPageIndex: 0,        // First visible page
        numOfVisiblePages: 2
      });
    });

    it('should handle currentPageIndex of 0 with first page hidden', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false },
        'page-3': { pageIndex: 2, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: false }, // index 0 - hidden but current
        { linkId: 'page-2', isVisible: true },  // index 1
        { linkId: 'page-3', isVisible: true }   // index 2
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(0, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: 1,
        numOfVisiblePages: 2
      });
    });
  });

  describe('enable when integration', () => {
    const mockPages: Pages = {
      'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
      'page-2': { pageIndex: 1, isComplete: false, isHidden: false },
      'page-3': { pageIndex: 2, isComplete: false, isHidden: false }
    };

    it('should pass enable when parameters to constructPagesWithVisibility', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(mockConstructPagesWithVisibility).toHaveBeenCalledWith({
        pages: mockPages,
        enableWhenIsActivated: mockEnableWhenIsActivated,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });
    });

    it('should call constructPagesWithVisibility only once per render', () => {
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { rerender } = renderHook(
        ({ pageIndex, pages }) => useNextAndPreviousVisiblePages(pageIndex, pages),
        { initialProps: { pageIndex: 0, pages: mockPages } }
      );

      expect(mockConstructPagesWithVisibility).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender({ pageIndex: 0, pages: mockPages });
      expect(mockConstructPagesWithVisibility).toHaveBeenCalledTimes(2);

      // Rerender with different props
      rerender({ pageIndex: 1, pages: mockPages });
      expect(mockConstructPagesWithVisibility).toHaveBeenCalledTimes(3);
    });
  });

  describe('page completion and hidden states', () => {
    it('should handle pages with different completion states', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: true, isHidden: false },   // Completed
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false },  // Current, not completed
        'page-3': { pageIndex: 2, isComplete: false, isHidden: false }   // Not completed
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 0,
        nextPageIndex: 2,
        numOfVisiblePages: 3
      });
    });

    it('should handle pages with different hidden states in input', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: true },   // Hidden in input
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false },  // Current
        'page-3': { pageIndex: 2, isComplete: false, isHidden: false }   // Not hidden
      };
      // Note: actual visibility determined by constructPagesWithVisibility, not input isHidden
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: false }, // May be hidden due to enableWhen logic
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null, // page-1 is not visible
        nextPageIndex: 2,
        numOfVisiblePages: 2
      });
    });
  });

  describe('empty and minimal page sets', () => {
    it('should handle empty pages object', () => {
      const emptyPages: Pages = {};
      const mockPagesWithVisibility: { linkId: string; isVisible: boolean }[] = [];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(0, emptyPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: null,
        nextPageIndex: null,
        numOfVisiblePages: 0
      });
    });

    it('should handle pages with non-sequential indices', () => {
      const mockPages: Pages = {
        'page-a': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-b': { pageIndex: 2, isComplete: false, isHidden: false }, // Gap in indices
        'page-c': { pageIndex: 5, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-a', isVisible: true },  // position 0
        { linkId: 'page-b', isVisible: true },  // position 1 - current
        { linkId: 'page-c', isVisible: true }   // position 2
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages) // Position 1 in the array
      );

      expect(result.current).toEqual({
        previousPageIndex: 0, // Position 0 in the array
        nextPageIndex: 2,     // Position 2 in the array
        numOfVisiblePages: 3
      });
    });
  });

  describe('performance and edge case scenarios', () => {
    it('should handle large number of pages efficiently', () => {
      const largePages: Pages = {};
      const mockPagesWithVisibility: { linkId: string; isVisible: boolean }[] = [];
      
      // Create 1000 pages
      for (let i = 0; i < 1000; i++) {
        largePages[`page-${i}`] = { pageIndex: i, isComplete: false, isHidden: false };
        mockPagesWithVisibility.push({ linkId: `page-${i}`, isVisible: i % 2 === 0 }); // Every other page visible
      }
      
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(500, largePages) // Middle page
      );

      expect(result.current).toEqual({
        previousPageIndex: 498, // Previous even number
        nextPageIndex: 502,     // Next even number  
        numOfVisiblePages: 500  // Half of 1000 pages
      });
    });

    it('should maintain consistent results across multiple calls', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false },
        'page-3': { pageIndex: 2, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: false },
        { linkId: 'page-3', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result: result1 } = renderHook(() => 
        useNextAndPreviousVisiblePages(2, mockPages)
      );
      const { result: result2 } = renderHook(() => 
        useNextAndPreviousVisiblePages(2, mockPages)
      );

      expect(result1.current).toEqual(result2.current);
      expect(result1.current).toEqual({
        previousPageIndex: 0,
        nextPageIndex: null,
        numOfVisiblePages: 2
      });
    });
  });

  describe('navigation workflow scenarios', () => {
    it('should handle sequential page navigation', () => {
      const mockPages: Pages = {
        'page-1': { pageIndex: 0, isComplete: true, isHidden: false },   
        'page-2': { pageIndex: 1, isComplete: true, isHidden: false },   
        'page-3': { pageIndex: 2, isComplete: false, isHidden: false },  // Current
        'page-4': { pageIndex: 3, isComplete: false, isHidden: false },
        'page-5': { pageIndex: 4, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true },
        { linkId: 'page-3', isVisible: true },
        { linkId: 'page-4', isVisible: true },
        { linkId: 'page-5', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(2, mockPages)
      );

      expect(result.current).toEqual({
        previousPageIndex: 1,
        nextPageIndex: 3,
        numOfVisiblePages: 5
      });
    });

    it('should handle page navigation with conditional visibility', () => {
      const mockPages: Pages = {
        'intro': { pageIndex: 0, isComplete: true, isHidden: false },
        'personal': { pageIndex: 1, isComplete: true, isHidden: false },
        'conditional': { pageIndex: 2, isComplete: false, isHidden: false }, // May be hidden by enableWhen
        'summary': { pageIndex: 3, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'intro', isVisible: true },
        { linkId: 'personal', isVisible: true },
        { linkId: 'conditional', isVisible: false }, // Hidden by enableWhen logic
        { linkId: 'summary', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(1, mockPages) // On personal page
      );

      expect(result.current).toEqual({
        previousPageIndex: 0,    // intro page
        nextPageIndex: 3,        // summary page (skipping conditional)
        numOfVisiblePages: 3
      });
    });

    it('should handle multi-step form completion tracking', () => {
      const mockPages: Pages = {
        'step1': { pageIndex: 0, isComplete: true, isHidden: false },
        'step2': { pageIndex: 1, isComplete: true, isHidden: false },
        'step3': { pageIndex: 2, isComplete: true, isHidden: false },
        'step4': { pageIndex: 3, isComplete: false, isHidden: false }, // Current incomplete
        'step5': { pageIndex: 4, isComplete: false, isHidden: false },
        'review': { pageIndex: 5, isComplete: false, isHidden: false }
      };
      const mockPagesWithVisibility = [
        { linkId: 'step1', isVisible: true },
        { linkId: 'step2', isVisible: true },
        { linkId: 'step3', isVisible: true },
        { linkId: 'step4', isVisible: true },
        { linkId: 'step5', isVisible: true },
        { linkId: 'review', isVisible: true }
      ];
      mockConstructPagesWithVisibility.mockReturnValue(mockPagesWithVisibility);

      const { result } = renderHook(() => 
        useNextAndPreviousVisiblePages(3, mockPages) // On step4
      );

      expect(result.current).toEqual({
        previousPageIndex: 2,   // step3
        nextPageIndex: 4,       // step5
        numOfVisiblePages: 6
      });
    });
  });
});
