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
import { useFocusTabHeading } from '../hooks/useFocusTabHeading';

describe('useFocusTabHeading', () => {
  // Mock DOM elements
  let mockTabPanel: HTMLElement;
  let mockHeading: HTMLElement;

  beforeEach(() => {
    // Clear the DOM
    document.body.innerHTML = '';
    
    // Create mock elements
    mockTabPanel = document.createElement('div');
    mockTabPanel.id = 'test-tab-panel';
    
    mockHeading = document.createElement('h2');
    mockHeading.textContent = 'Test Heading';
    mockHeading.focus = jest.fn();
    
    // Mock querySelector to return our mock heading
    mockTabPanel.querySelector = jest.fn().mockReturnValue(mockHeading);
    
    // Mock getElementById to return our mock tab panel
    jest.spyOn(document, 'getElementById').mockReturnValue(mockTabPanel);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('basic functionality', () => {
    it('should return a function', () => {
      const { result } = renderHook(() => useFocusTabHeading());

      expect(typeof result.current).toBe('function');
    });

    it('should focus the first heading in the tab panel', () => {
      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(document.getElementById).toHaveBeenCalledWith('test-tab-panel');
      expect(mockTabPanel.querySelector).toHaveBeenCalledWith('h1, h2, h3, h4, h5, h6');
      expect(mockHeading.focus).toHaveBeenCalled();
    });

    it('should add tabindex=-1 if heading does not have tabindex', () => {
      mockHeading.hasAttribute = jest.fn().mockReturnValue(false);
      mockHeading.setAttribute = jest.fn();

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(mockHeading.hasAttribute).toHaveBeenCalledWith('tabindex');
      expect(mockHeading.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
      expect(mockHeading.focus).toHaveBeenCalled();
    });

    it('should not add tabindex if heading already has tabindex', () => {
      mockHeading.hasAttribute = jest.fn().mockReturnValue(true);
      mockHeading.setAttribute = jest.fn();

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(mockHeading.hasAttribute).toHaveBeenCalledWith('tabindex');
      expect(mockHeading.setAttribute).not.toHaveBeenCalled();
      expect(mockHeading.focus).toHaveBeenCalled();
    });
  });

  describe('edge cases - tab panel not found', () => {
    it('should handle non-existent tab panel gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);

      const { result } = renderHook(() => useFocusTabHeading());

      expect(() => {
        result.current('non-existent-panel');
      }).not.toThrow();

      expect(document.getElementById).toHaveBeenCalledWith('non-existent-panel');
      expect(mockTabPanel.querySelector).not.toHaveBeenCalled();
    });

    it('should handle empty tab panel ID', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);

      const { result } = renderHook(() => useFocusTabHeading());

      expect(() => {
        result.current('');
      }).not.toThrow();

      expect(document.getElementById).toHaveBeenCalledWith('');
    });

    it('should handle null tab panel ID', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);

      const { result } = renderHook(() => useFocusTabHeading());

      expect(() => {
        result.current(null as any);
      }).not.toThrow();

      expect(document.getElementById).toHaveBeenCalledWith(null);
    });
  });

  describe('edge cases - heading not found', () => {
    it('should handle tab panel with no headings gracefully', () => {
      mockTabPanel.querySelector = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useFocusTabHeading());

      expect(() => {
        result.current('test-tab-panel');
      }).not.toThrow();

      expect(mockTabPanel.querySelector).toHaveBeenCalledWith('h1, h2, h3, h4, h5, h6');
      expect(mockHeading.focus).not.toHaveBeenCalled();
    });

    it('should query for all heading levels correctly', () => {
      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(mockTabPanel.querySelector).toHaveBeenCalledWith('h1, h2, h3, h4, h5, h6');
    });
  });

  describe('different heading levels', () => {
    it('should handle h1 heading', () => {
      const h1Element = document.createElement('h1');
      h1Element.focus = jest.fn();
      h1Element.hasAttribute = jest.fn().mockReturnValue(false);
      h1Element.setAttribute = jest.fn();
      mockTabPanel.querySelector = jest.fn().mockReturnValue(h1Element);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(h1Element.focus).toHaveBeenCalled();
    });

    it('should handle h3 heading', () => {
      const h3Element = document.createElement('h3');
      h3Element.focus = jest.fn();
      h3Element.hasAttribute = jest.fn().mockReturnValue(false);
      h3Element.setAttribute = jest.fn();
      mockTabPanel.querySelector = jest.fn().mockReturnValue(h3Element);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(h3Element.focus).toHaveBeenCalled();
    });

    it('should handle h6 heading', () => {
      const h6Element = document.createElement('h6');
      h6Element.focus = jest.fn();
      h6Element.hasAttribute = jest.fn().mockReturnValue(false);
      h6Element.setAttribute = jest.fn();
      mockTabPanel.querySelector = jest.fn().mockReturnValue(h6Element);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(h6Element.focus).toHaveBeenCalled();
    });
  });

  describe('tabindex attribute handling', () => {
    it('should preserve existing tabindex value', () => {
      mockHeading.hasAttribute = jest.fn().mockReturnValue(true);
      mockHeading.setAttribute = jest.fn();
      mockHeading.getAttribute = jest.fn().mockReturnValue('0');

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(mockHeading.setAttribute).not.toHaveBeenCalled();
      expect(mockHeading.focus).toHaveBeenCalled();
    });

    it('should handle setAttribute throwing error gracefully', () => {
      mockHeading.hasAttribute = jest.fn().mockReturnValue(false);
      mockHeading.setAttribute = jest.fn().mockImplementation(() => {
        throw new Error('setAttribute failed');
      });

      const { result } = renderHook(() => useFocusTabHeading());

      expect(() => {
        result.current('test-tab-panel');
      }).toThrow('setAttribute failed');
    });

    it('should handle focus throwing error gracefully', () => {
      mockHeading.hasAttribute = jest.fn().mockReturnValue(true);
      mockHeading.focus = jest.fn().mockImplementation(() => {
        throw new Error('focus failed');
      });

      const { result } = renderHook(() => useFocusTabHeading());

      expect(() => {
        result.current('test-tab-panel');
      }).toThrow('focus failed');
    });
  });

  describe('callback stability', () => {
    it('should return the same function reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useFocusTabHeading());

      const firstFunction = result.current;

      rerender();

      expect(result.current).toBe(firstFunction);
    });

    it('should maintain functionality after re-renders', () => {
      const { result, rerender } = renderHook(() => useFocusTabHeading());

      rerender();
      rerender();

      result.current('test-tab-panel');

      expect(mockHeading.focus).toHaveBeenCalled();
    });
  });

  describe('real-world usage scenarios', () => {
    it('should handle tab navigation in a form', () => {
      // Simulate a form with tabs
      const formTabPanel = document.createElement('div');
      formTabPanel.id = 'form-tab-personal-info';
      
      const formHeading = document.createElement('h2');
      formHeading.textContent = 'Personal Information';
      formHeading.focus = jest.fn();
      formHeading.hasAttribute = jest.fn().mockReturnValue(false);
      formHeading.setAttribute = jest.fn();
      
      formTabPanel.querySelector = jest.fn().mockReturnValue(formHeading);
      jest.spyOn(document, 'getElementById').mockReturnValue(formTabPanel);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('form-tab-personal-info');

      expect(formHeading.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
      expect(formHeading.focus).toHaveBeenCalled();
    });

    it('should handle complex tab panel structure', () => {
      // Simulate complex nested structure
      const complexTabPanel = document.createElement('div');
      complexTabPanel.id = 'complex-tab';
      
      const nestedContainer = document.createElement('div');
      const targetHeading = document.createElement('h3');
      targetHeading.textContent = 'Section Title';
      targetHeading.focus = jest.fn();
      targetHeading.hasAttribute = jest.fn().mockReturnValue(false);
      targetHeading.setAttribute = jest.fn();
      
      nestedContainer.appendChild(targetHeading);
      complexTabPanel.appendChild(nestedContainer);
      
      // Mock querySelector to find the nested heading
      complexTabPanel.querySelector = jest.fn().mockReturnValue(targetHeading);
      jest.spyOn(document, 'getElementById').mockReturnValue(complexTabPanel);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('complex-tab');

      expect(targetHeading.focus).toHaveBeenCalled();
    });

    it('should handle multiple heading levels and focus the first one', () => {
      const multiHeadingPanel = document.createElement('div');
      multiHeadingPanel.id = 'multi-heading-tab';
      
      const firstHeading = document.createElement('h2');
      firstHeading.textContent = 'First Heading';
      firstHeading.focus = jest.fn();
      firstHeading.hasAttribute = jest.fn().mockReturnValue(false);
      firstHeading.setAttribute = jest.fn();
      
      // Mock querySelector to return the first heading
      multiHeadingPanel.querySelector = jest.fn().mockReturnValue(firstHeading);
      jest.spyOn(document, 'getElementById').mockReturnValue(multiHeadingPanel);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('multi-heading-tab');

      expect(firstHeading.focus).toHaveBeenCalled();
    });
  });

  describe('accessibility compliance', () => {
    it('should ensure heading is focusable for screen readers', () => {
      const accessibleHeading = document.createElement('h2');
      accessibleHeading.focus = jest.fn();
      accessibleHeading.hasAttribute = jest.fn().mockReturnValue(false);
      accessibleHeading.setAttribute = jest.fn();
      
      mockTabPanel.querySelector = jest.fn().mockReturnValue(accessibleHeading);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(accessibleHeading.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
      expect(accessibleHeading.focus).toHaveBeenCalled();
    });

    it('should work with headings that already have accessibility attributes', () => {
      const accessibleHeading = document.createElement('h2');
      accessibleHeading.setAttribute('aria-label', 'Section heading');
      accessibleHeading.setAttribute('role', 'heading');
      accessibleHeading.focus = jest.fn();
      accessibleHeading.hasAttribute = jest.fn().mockReturnValue(true);
      
      mockTabPanel.querySelector = jest.fn().mockReturnValue(accessibleHeading);

      const { result } = renderHook(() => useFocusTabHeading());

      result.current('test-tab-panel');

      expect(accessibleHeading.focus).toHaveBeenCalled();
    });
  });

  describe('performance considerations', () => {
    it('should handle frequent calls efficiently', () => {
      const { result } = renderHook(() => useFocusTabHeading());

      // Call multiple times
      for (let i = 0; i < 10; i++) {
        result.current('test-tab-panel');
      }

      expect(document.getElementById).toHaveBeenCalledTimes(10);
      expect(mockHeading.focus).toHaveBeenCalledTimes(10);
    });

    it('should handle rapid successive calls', () => {
      const { result } = renderHook(() => useFocusTabHeading());

      // Rapid calls
      result.current('test-tab-panel');
      result.current('test-tab-panel');
      result.current('test-tab-panel');

      expect(mockHeading.focus).toHaveBeenCalledTimes(3);
    });
  });
});
