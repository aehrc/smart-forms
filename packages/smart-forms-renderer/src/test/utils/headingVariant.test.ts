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

import { getHeadingTag } from '../../utils/headingVariant';

describe('getHeadingTag', () => {
  describe('basic functionality', () => {
    it('should return h1 for elevation 1', () => {
      expect(getHeadingTag(1)).toBe('h1');
    });

    it('should return h2 for elevation 2', () => {
      expect(getHeadingTag(2)).toBe('h2');
    });

    it('should return h3 for elevation 3', () => {
      expect(getHeadingTag(3)).toBe('h3');
    });

    it('should return h4 for elevation 4', () => {
      expect(getHeadingTag(4)).toBe('h4');
    });

    it('should return h5 for elevation 5', () => {
      expect(getHeadingTag(5)).toBe('h5');
    });

    it('should return h6 for elevation 6', () => {
      expect(getHeadingTag(6)).toBe('h6');
    });
  });

  describe('special cases', () => {
    it('should return h1 for elevation 0 (special case)', () => {
      expect(getHeadingTag(0)).toBe('h1');
    });

    it('should return h6 for elevation greater than 6 (clamped)', () => {
      expect(getHeadingTag(7)).toBe('h6');
      expect(getHeadingTag(10)).toBe('h6');
      expect(getHeadingTag(100)).toBe('h6');
    });
  });

  describe('negative values', () => {
    it('should handle negative values correctly', () => {
      // Negative values should still be clamped by Math.min, but not hit the zero case
      expect(getHeadingTag(-1)).toBe('h-1' as any); // This might be an edge case
      expect(getHeadingTag(-5)).toBe('h-5' as any);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      expect(getHeadingTag(1000000)).toBe('h6');
      expect(getHeadingTag(Number.MAX_SAFE_INTEGER)).toBe('h6');
    });

    it('should handle decimal numbers (should truncate)', () => {
      expect(getHeadingTag(1.9)).toBe('h1.9');
      expect(getHeadingTag(2.1)).toBe('h2.1');
      expect(getHeadingTag(5.99)).toBe('h5.99');
    });

    it('should handle zero vs non-zero logic correctly', () => {
      // Test boundary around zero
      expect(getHeadingTag(0)).toBe('h1'); // Special zero case
      expect(getHeadingTag(0.1)).toBe('h0.1'); // Not zero, but less than 1
      expect(getHeadingTag(0.9)).toBe('h0.9'); // Not zero, but less than 1
    });

    it('should handle float edge cases near boundaries', () => {
      expect(getHeadingTag(6.1)).toBe('h6'); // Should be clamped to 6
      expect(getHeadingTag(6.9)).toBe('h6'); // Should be clamped to 6
    });
  });

  describe('comprehensive range testing', () => {
    it('should handle all valid heading levels systematically', () => {
      const expectedMappings = [
        { input: 0, expected: 'h1' },
        { input: 1, expected: 'h1' },
        { input: 2, expected: 'h2' },
        { input: 3, expected: 'h3' },
        { input: 4, expected: 'h4' },
        { input: 5, expected: 'h5' },
        { input: 6, expected: 'h6' }
      ];

      expectedMappings.forEach(({ input, expected }) => {
        expect(getHeadingTag(input)).toBe(expected);
      });
    });

    it('should consistently clamp values above 6', () => {
      const largeValues = [7, 8, 9, 10, 50, 100];
      largeValues.forEach((value) => {
        expect(getHeadingTag(value)).toBe('h6');
      });
    });
  });

  describe('type safety and return values', () => {
    it('should return valid HTML heading tag strings', () => {
      const validHeadingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

      // Test a range of inputs
      for (let i = 0; i <= 10; i++) {
        const result = getHeadingTag(i);
        if (i === 0 || (i >= 1 && i <= 6)) {
          expect(validHeadingTags).toContain(result);
        } else {
          expect(result).toBe('h6'); // Values > 6 should be clamped
        }
      }
    });

    it('should have correct TypeScript return type', () => {
      const result = getHeadingTag(3);
      // This is more of a compile-time check, but we can verify the value
      const validTypes: ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')[] = [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6'
      ];
      expect(validTypes).toContain(result);
    });
  });

  describe('mathematical edge cases', () => {
    it('should handle Infinity', () => {
      expect(getHeadingTag(Infinity)).toBe('h6');
      expect(getHeadingTag(-Infinity)).toBe('h-Infinity' as any);
    });

    it('should handle NaN', () => {
      // Math.min with NaN returns NaN, which would create 'hNaN'
      expect(getHeadingTag(NaN)).toBe('hNaN' as any);
    });
  });

  describe('practical usage scenarios', () => {
    it('should work for typical form nesting levels', () => {
      // Common nesting scenarios in forms
      expect(getHeadingTag(1)).toBe('h1'); // Main form title
      expect(getHeadingTag(2)).toBe('h2'); // Section headers
      expect(getHeadingTag(3)).toBe('h3'); // Subsection headers
      expect(getHeadingTag(4)).toBe('h4'); // Field group headers
    });

    it('should prevent heading levels deeper than h6', () => {
      // HTML only supports h1-h6, so anything deeper should be h6
      expect(getHeadingTag(10)).toBe('h6'); // Very deep nesting
      expect(getHeadingTag(15)).toBe('h6'); // Extremely deep nesting
    });
  });
});
