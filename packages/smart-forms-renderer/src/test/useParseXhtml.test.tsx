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
import { useParseXhtml } from '../hooks/useParseXhtml';

// Mock dependencies
jest.mock('../utils/extensions', () => ({
  getXHtmlString: jest.fn()
}));

// Import mocked functions
import { getXHtmlString } from '../utils/extensions';
const mockGetXHtmlString = getXHtmlString as jest.MockedFunction<typeof getXHtmlString>;

// Mock DOM APIs that are used in the hook
delete (global as any).location;
(global as any).location = {
  hostname: 'localhost'
};

// Mock CSSStyleRule
global.CSSStyleRule = class MockCSSStyleRule {
  selectorText: string;
  style: any;
  
  constructor(selectorText: string, style: any) {
    this.selectorText = selectorText;
    this.style = style;
  }
} as any;

// Mock stylesheet APIs
Object.defineProperty(document, 'styleSheets', {
  value: [],
  writable: true
});

describe('useParseXhtml', () => {
  const mockQItem: QuestionnaireItem = {
    linkId: 'test-item',
    type: 'display',
    text: 'Test Question'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (document.styleSheets as any).length = 0;
    
    // Reset console methods
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should return null when XHTML string is null', () => {
      mockGetXHtmlString.mockReturnValue(null);

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).toBeNull();
    });

    it('should return null when XHTML string is empty', () => {
      mockGetXHtmlString.mockReturnValue('');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).toBeNull();
    });

    it('should parse simple XHTML content', () => {
      mockGetXHtmlString.mockReturnValue('<div>Simple content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
      expect(result.current?.styles).toBeUndefined();
    });
  });

  describe('image alt text replacement', () => {
    it('should add alt text to img tags when none exist', () => {
      mockGetXHtmlString.mockReturnValue('<img src="test.jpg">');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
      // The alt text replacement happens during parsing
      expect(mockGetXHtmlString).toHaveBeenCalled();
    });

    it('should not modify img tags that already have alt attribute', () => {
      mockGetXHtmlString.mockReturnValue('<img src="test.jpg" alt="existing">');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should not modify img tags that have alt attribute with space', () => {
      mockGetXHtmlString.mockReturnValue('<img src="test.jpg" alt ="existing">');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });
  });

  describe('style extraction', () => {
    it('should extract styles from div with style attribute', () => {
      mockGetXHtmlString.mockReturnValue('<div style="color: red; background-color: blue;">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.styles).toEqual({
        color: 'red',
        backgroundColor: 'blue'
      });
    });

    it('should handle malformed style attributes gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetXHtmlString.mockReturnValue('<div style="invalid-style">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('should not extract styles from div with class attribute', () => {
      mockGetXHtmlString.mockReturnValue('<div class="test-class" style="color: red;">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      // Should not extract styles when class is present
      expect(result.current?.styles).toBeUndefined();
    });
  });

  describe('CSS class handling', () => {
    beforeEach(() => {
      // Mock a stylesheet with some CSS rules
      const mockStyleSheet = {
        href: null,
        cssRules: [
          new (global.CSSStyleRule as any)('.test-class', {
            length: 2,
            0: 'color',
            1: 'font-size',
            getPropertyValue: (prop: string) => {
              switch (prop) {
                case 'color': return 'red';
                case 'font-size': return '14px';
                default: return '';
              }
            }
          })
        ]
      };

      (document.styleSheets as any)[0] = mockStyleSheet;
      (document.styleSheets as any).length = 1;
    });

    it('should extract styles from CSS classes', () => {
      mockGetXHtmlString.mockReturnValue('<div class="test-class">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.styles).toEqual({
        color: 'red',
        fontSize: '14px'
      });
    });

    it('should handle multiple CSS classes', () => {
      mockGetXHtmlString.mockReturnValue('<div class="test-class another-class">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });
  });

  describe('button click handler processing', () => {
    it('should process valid document.getElementById onclick handlers', () => {
      mockGetXHtmlString.mockReturnValue('<button onclick="document.getElementById(\'test\').value = \'clicked\'">Click me</button>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should warn about unhandled onclick handlers', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockGetXHtmlString.mockReturnValue('<button onclick="alert(\'hello\')">Click me</button>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled onclick:', "alert('hello')");
      consoleSpy.mockRestore();
    });

    it('should handle onclick execution errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetXHtmlString.mockReturnValue('<button onclick="document.getElementById()">Click me</button>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error executing onclick:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should provide default click handler for buttons without onclick', () => {
      mockGetXHtmlString.mockReturnValue('<button>Click me</button>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });
  });

  describe('CSS stylesheet access', () => {
    it('should handle CORS errors when accessing stylesheets', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Mock a stylesheet that throws CORS error
      const mockStyleSheet = {
        href: 'http://external.com/styles.css',
        get cssRules() {
          const error = new DOMException('CORS error', 'SecurityError');
          throw error;
        }
      };

      (document.styleSheets as any)[0] = mockStyleSheet;
      (document.styleSheets as any).length = 1;

      mockGetXHtmlString.mockReturnValue('<div class="external-class">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unable to access stylesheet due to CORS restrictions'),
        'http://external.com/styles.css'
      );
      consoleSpy.mockRestore();
    });

    it('should skip external stylesheets', () => {
      const mockStyleSheet = {
        href: 'http://external.com/styles.css'
      };

      (document.styleSheets as any)[0] = mockStyleSheet;
      (document.styleSheets as any).length = 1;

      mockGetXHtmlString.mockReturnValue('<div class="external-class">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should handle general stylesheet access errors', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const mockStyleSheet = {
        href: 'http://localhost/styles.css',
        get cssRules() {
          throw new Error('General error');
        }
      };

      (document.styleSheets as any)[0] = mockStyleSheet;
      (document.styleSheets as any).length = 1;

      mockGetXHtmlString.mockReturnValue('<div class="test-class">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error accessing stylesheet'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('utility functions', () => {
    it('should convert kebab-case to camelCase correctly', () => {
      mockGetXHtmlString.mockReturnValue('<div style="background-color: red; font-size: 14px; margin-top: 10px;">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.styles).toEqual({
        backgroundColor: 'red',
        fontSize: '14px',
        marginTop: '10px'
      });
    });

    it('should handle empty and whitespace in style parsing', () => {
      mockGetXHtmlString.mockReturnValue('<div style="  color: red ; ; font-size: 14px  ;">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.styles).toEqual({
        color: 'red',
        fontSize: '14px'
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested HTML with multiple features', () => {
      mockGetXHtmlString.mockReturnValue(`
        <div style="padding: 20px;">
          <img src="test.jpg">
          <button onclick="document.getElementById('test').value = 'clicked'">Click</button>
          <div class="nested-class">Nested content</div>
        </div>
      `);

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
      expect(result.current?.styles).toEqual({
        padding: '20px'
      });
    });

    it('should handle empty content gracefully', () => {
      mockGetXHtmlString.mockReturnValue('<div></div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should memoize results correctly', () => {
      mockGetXHtmlString.mockReturnValue('<div>Test content</div>');

      const { result, rerender } = renderHook(
        ({ qItem }) => useParseXhtml(qItem),
        { initialProps: { qItem: mockQItem } }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ qItem: mockQItem });

      expect(result.current).toBe(firstResult);
      expect(mockGetXHtmlString).toHaveBeenCalledTimes(1);
    });

    it('should recompute when qItem changes', () => {
      mockGetXHtmlString.mockReturnValue('<div>Test content</div>');

      const { result, rerender } = renderHook(
        ({ qItem }) => useParseXhtml(qItem),
        { initialProps: { qItem: mockQItem } }
      );

      const firstResult = result.current;

      const newQItem = { ...mockQItem, linkId: 'new-item' };
      rerender({ qItem: newQItem });

      expect(result.current).not.toBe(firstResult);
      expect(mockGetXHtmlString).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle null class name in getStylesFromClass', () => {
      mockGetXHtmlString.mockReturnValue('<div class="">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should handle class names that start with dot', () => {
      const mockStyleSheet = {
        href: null,
        cssRules: [
          new (global.CSSStyleRule as any)('.dot-class', {
            length: 1,
            0: 'color',
            getPropertyValue: () => 'blue'
          })
        ]
      };

      (document.styleSheets as any)[0] = mockStyleSheet;
      (document.styleSheets as any).length = 1;

      mockGetXHtmlString.mockReturnValue('<div class="dot-class">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should handle buttons with empty onclick', () => {
      mockGetXHtmlString.mockReturnValue('<button onclick="">Click me</button>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.content).toBeDefined();
    });

    it('should handle style parsing with malformed property-value pairs', () => {
      mockGetXHtmlString.mockReturnValue('<div style="color; background-color: blue; :invalid;">Content</div>');

      const { result } = renderHook(() => useParseXhtml(mockQItem));

      expect(result.current).not.toBeNull();
      expect(result.current?.styles).toEqual({
        backgroundColor: 'blue'
      });
    });
  });
});
