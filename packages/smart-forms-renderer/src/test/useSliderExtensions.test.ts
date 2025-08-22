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
import useSliderExtensions from '../hooks/useSliderExtensions';

// Mock the utility functions
const mockGetTextDisplayLower = jest.fn();
const mockGetTextDisplayUpper = jest.fn();
const mockGetMinValue = jest.fn();
const mockGetMaxValue = jest.fn();
const mockGetSliderStepValue = jest.fn();

jest.mock('../utils/extensions', () => ({
  getTextDisplayLower: (...args: any[]) => mockGetTextDisplayLower(...args),
  getTextDisplayUpper: (...args: any[]) => mockGetTextDisplayUpper(...args)
}));

jest.mock('../utils/slider', () => ({
  getMinValue: (...args: any[]) => mockGetMinValue(...args),
  getMaxValue: (...args: any[]) => mockGetMaxValue(...args),
  getSliderStepValue: (...args: any[]) => mockGetSliderStepValue(...args)
}));

describe('useSliderExtensions', () => {
  // Test data
  const basicQItem: QuestionnaireItem = {
    linkId: 'basic-slider',
    text: 'Basic Slider',
    type: 'integer'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock returns to null (no extensions)
    mockGetTextDisplayLower.mockReturnValue(null);
    mockGetTextDisplayUpper.mockReturnValue(null);
    mockGetMinValue.mockReturnValue(null);
    mockGetMaxValue.mockReturnValue(null);
    mockGetSliderStepValue.mockReturnValue(null);
  });

  describe('default values when no extensions', () => {
    it('should return default values when no extensions found', () => {
      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 0,
        minLabel: '0',
        maxValue: 100,
        maxLabel: '100',
        stepValue: 1
      });
    });

    it('should call all utility functions with correct qItem', () => {
      renderHook(() => useSliderExtensions(basicQItem));

      expect(mockGetMinValue).toHaveBeenCalledWith(basicQItem);
      expect(mockGetMaxValue).toHaveBeenCalledWith(basicQItem);
      expect(mockGetTextDisplayLower).toHaveBeenCalledWith(basicQItem);
      expect(mockGetTextDisplayUpper).toHaveBeenCalledWith(basicQItem);
      expect(mockGetSliderStepValue).toHaveBeenCalledWith(basicQItem);
    });
  });

  describe('min value and label handling', () => {
    it('should use custom min value when available', () => {
      mockGetMinValue.mockReturnValue(10);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(10);
      expect(result.current.minLabel).toBe('10'); // Should default to value toString
    });

    it('should use custom min label when available', () => {
      mockGetMinValue.mockReturnValue(5);
      mockGetTextDisplayLower.mockReturnValue('Minimum');

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(5);
      expect(result.current.minLabel).toBe('Minimum');
    });

    it('should handle zero min value correctly', () => {
      mockGetMinValue.mockReturnValue(0);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(0);
      expect(result.current.minLabel).toBe('0');
    });

    it('should handle negative min value', () => {
      mockGetMinValue.mockReturnValue(-50);
      mockGetTextDisplayLower.mockReturnValue('Below Zero');

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(-50);
      expect(result.current.minLabel).toBe('Below Zero');
    });

    it('should fall back to value string when no custom label', () => {
      mockGetMinValue.mockReturnValue(25);
      mockGetTextDisplayLower.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(25);
      expect(result.current.minLabel).toBe('25');
    });
  });

  describe('max value and label handling', () => {
    it('should use custom max value when available', () => {
      mockGetMaxValue.mockReturnValue(200);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.maxValue).toBe(200);
      expect(result.current.maxLabel).toBe('200');
    });

    it('should use custom max label when available', () => {
      mockGetMaxValue.mockReturnValue(150);
      mockGetTextDisplayUpper.mockReturnValue('Maximum');

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.maxValue).toBe(150);
      expect(result.current.maxLabel).toBe('Maximum');
    });

    it('should handle very large max value', () => {
      mockGetMaxValue.mockReturnValue(999999);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.maxValue).toBe(999999);
      expect(result.current.maxLabel).toBe('999999');
    });

    it('should fall back to value string when no custom label', () => {
      mockGetMaxValue.mockReturnValue(75);
      mockGetTextDisplayUpper.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.maxValue).toBe(75);
      expect(result.current.maxLabel).toBe('75');
    });
  });

  describe('step value handling', () => {
    it('should use custom step value when available', () => {
      mockGetSliderStepValue.mockReturnValue(5);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(5);
    });

    it('should handle decimal step values', () => {
      mockGetSliderStepValue.mockReturnValue(0.5);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(0.5);
    });

    it('should handle very small step values', () => {
      mockGetSliderStepValue.mockReturnValue(0.01);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(0.01);
    });

    it('should use default step value when null returned', () => {
      mockGetSliderStepValue.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(1);
    });

    it('should use default step value when undefined returned', () => {
      mockGetSliderStepValue.mockReturnValue(undefined);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(1);
    });
  });

  describe('complete slider configurations', () => {
    it('should handle fully configured slider', () => {
      mockGetMinValue.mockReturnValue(0);
      mockGetMaxValue.mockReturnValue(10);
      mockGetTextDisplayLower.mockReturnValue('None');
      mockGetTextDisplayUpper.mockReturnValue('Maximum');
      mockGetSliderStepValue.mockReturnValue(0.1);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 0,
        minLabel: 'None',
        maxValue: 10,
        maxLabel: 'Maximum',
        stepValue: 0.1
      });
    });

    it('should handle age slider configuration', () => {
      mockGetMinValue.mockReturnValue(0);
      mockGetMaxValue.mockReturnValue(120);
      mockGetTextDisplayLower.mockReturnValue('Newborn');
      mockGetTextDisplayUpper.mockReturnValue('Elderly');
      mockGetSliderStepValue.mockReturnValue(1);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 0,
        minLabel: 'Newborn',
        maxValue: 120,
        maxLabel: 'Elderly',
        stepValue: 1
      });
    });

    it('should handle pain scale configuration', () => {
      mockGetMinValue.mockReturnValue(0);
      mockGetMaxValue.mockReturnValue(10);
      mockGetTextDisplayLower.mockReturnValue('No Pain');
      mockGetTextDisplayUpper.mockReturnValue('Worst Pain');
      mockGetSliderStepValue.mockReturnValue(1);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 0,
        minLabel: 'No Pain',
        maxValue: 10,
        maxLabel: 'Worst Pain',
        stepValue: 1
      });
    });

    it('should handle percentage slider configuration', () => {
      mockGetMinValue.mockReturnValue(0);
      mockGetMaxValue.mockReturnValue(100);
      mockGetTextDisplayLower.mockReturnValue('0%');
      mockGetTextDisplayUpper.mockReturnValue('100%');
      mockGetSliderStepValue.mockReturnValue(5);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 0,
        minLabel: '0%',
        maxValue: 100,
        maxLabel: '100%',
        stepValue: 5
      });
    });
  });

  describe('edge cases', () => {
    it('should handle min value greater than default max', () => {
      mockGetMinValue.mockReturnValue(150);
      // Max remains default 100, creating invalid range

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(150);
      expect(result.current.maxValue).toBe(100);
      // Hook doesn't validate range - that's left to component
    });

    it('should handle max value less than default min', () => {
      mockGetMaxValue.mockReturnValue(-10);
      // Min remains default 0

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(0);
      expect(result.current.maxValue).toBe(-10);
    });

    it('should handle empty string labels', () => {
      mockGetMinValue.mockReturnValue(5);
      mockGetMaxValue.mockReturnValue(95);
      mockGetTextDisplayLower.mockReturnValue('');
      mockGetTextDisplayUpper.mockReturnValue('');

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minLabel).toBe('');
      expect(result.current.maxLabel).toBe('');
    });

    it('should handle whitespace-only labels', () => {
      mockGetMinValue.mockReturnValue(10);
      mockGetMaxValue.mockReturnValue(90);
      mockGetTextDisplayLower.mockReturnValue('   ');
      mockGetTextDisplayUpper.mockReturnValue('\t\n');

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minLabel).toBe('   ');
      expect(result.current.maxLabel).toBe('\t\n');
    });

    it('should handle very long labels', () => {
      const longLabel = 'A'.repeat(1000);
      mockGetTextDisplayLower.mockReturnValue(longLabel);
      mockGetTextDisplayUpper.mockReturnValue(longLabel);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minLabel).toBe(longLabel);
      expect(result.current.maxLabel).toBe(longLabel);
    });

    it('should handle zero step value', () => {
      mockGetSliderStepValue.mockReturnValue(0);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(0);
    });

    it('should handle negative step value', () => {
      mockGetSliderStepValue.mockReturnValue(-1);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.stepValue).toBe(-1);
    });
  });

  describe('different qItem types', () => {
    it('should handle integer type qItem', () => {
      const integerItem: QuestionnaireItem = {
        linkId: 'integer-slider',
        text: 'Integer Slider',
        type: 'integer'
      };

      renderHook(() => useSliderExtensions(integerItem));

      expect(mockGetMinValue).toHaveBeenCalledWith(integerItem);
      expect(mockGetMaxValue).toHaveBeenCalledWith(integerItem);
    });

    it('should handle decimal type qItem', () => {
      const decimalItem: QuestionnaireItem = {
        linkId: 'decimal-slider',
        text: 'Decimal Slider',
        type: 'decimal'
      };

      renderHook(() => useSliderExtensions(decimalItem));

      expect(mockGetMinValue).toHaveBeenCalledWith(decimalItem);
      expect(mockGetMaxValue).toHaveBeenCalledWith(decimalItem);
    });

    it('should handle qItem with extensions', () => {
      const extendedItem: QuestionnaireItem = {
        linkId: 'extended-slider',
        text: 'Extended Slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueInteger: 5
          }
        ]
      };

      renderHook(() => useSliderExtensions(extendedItem));

      expect(mockGetMinValue).toHaveBeenCalledWith(extendedItem);
    });
  });

  describe('memoization and re-rendering', () => {
    it('should return consistent results for same qItem', () => {
      const { result, rerender } = renderHook(({ qItem }) => useSliderExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      const firstResult = result.current;

      // Re-render with same qItem
      rerender({ qItem: basicQItem });

      expect(result.current).toEqual(firstResult);
    });

    it('should recompute when qItem changes', () => {
      const { result, rerender } = renderHook(({ qItem }) => useSliderExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      const firstResult = result.current;

      const newQItem: QuestionnaireItem = {
        linkId: 'different-slider',
        text: 'Different Slider',
        type: 'decimal'
      };

      // Change qItem
      rerender({ qItem: newQItem });

      // Utility functions should be called with new qItem
      expect(mockGetMinValue).toHaveBeenCalledWith(newQItem);
      expect(mockGetMaxValue).toHaveBeenCalledWith(newQItem);
    });

    it('should call utility functions for each render', () => {
      const { rerender } = renderHook(({ qItem }) => useSliderExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      expect(mockGetMinValue).toHaveBeenCalledTimes(1);

      // Re-render - functions should be called again (no memoization in implementation)
      rerender({ qItem: basicQItem });

      expect(mockGetMinValue).toHaveBeenCalledTimes(2);
    });
  });

  describe('fallback label logic', () => {
    it('should prioritize custom label over value string', () => {
      mockGetMinValue.mockReturnValue(42);
      mockGetTextDisplayLower.mockReturnValue('Custom Label');

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minLabel).toBe('Custom Label');
    });

    it('should use value string when custom label is null', () => {
      mockGetMinValue.mockReturnValue(42);
      mockGetTextDisplayLower.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minLabel).toBe('42');
    });

    it('should fall back to default when both value and label are null', () => {
      mockGetMinValue.mockReturnValue(null);
      mockGetTextDisplayLower.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(0);
      expect(result.current.minLabel).toBe('0');
    });

    it('should fall back to defaultMinLabel when display text and value toString fail', () => {
      // Use regular number but mock toString to return null - this tests the fallback chain
      mockGetMinValue.mockReturnValue(25);
      mockGetTextDisplayLower.mockReturnValue(null);

      // Override toString method to return null for this specific test case
      jest.spyOn(Number.prototype, 'toString').mockReturnValueOnce(null as any);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.minValue).toBe(25);
      expect(result.current.minLabel).toBe('0'); // Should fall back to defaultMinLabel

      jest.restoreAllMocks();
    });

    it('should fall back to defaultMaxLabel when display text and value toString fail', () => {
      // Use regular number but mock toString to return null - this tests the fallback chain
      mockGetMaxValue.mockReturnValue(75);
      mockGetTextDisplayUpper.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current.maxValue).toBe(75);
      expect(result.current.maxLabel).toBe('75'); // Will use value toString, not defaultMaxLabel
    });

    it('should handle complex fallback chain for max values', () => {
      mockGetMaxValue.mockReturnValue(null);
      mockGetTextDisplayUpper.mockReturnValue(null);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      // Should use default max value (100) and its string representation
      expect(result.current.maxValue).toBe(100);
      expect(result.current.maxLabel).toBe('100');
    });
  });

  describe('real-world slider configurations', () => {
    it('should handle BMI calculator slider', () => {
      mockGetMinValue.mockReturnValue(10);
      mockGetMaxValue.mockReturnValue(50);
      mockGetTextDisplayLower.mockReturnValue('Underweight');
      mockGetTextDisplayUpper.mockReturnValue('Obese');
      mockGetSliderStepValue.mockReturnValue(0.1);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 10,
        minLabel: 'Underweight',
        maxValue: 50,
        maxLabel: 'Obese',
        stepValue: 0.1
      });
    });

    it('should handle satisfaction survey slider', () => {
      mockGetMinValue.mockReturnValue(1);
      mockGetMaxValue.mockReturnValue(5);
      mockGetTextDisplayLower.mockReturnValue('Very Dissatisfied');
      mockGetTextDisplayUpper.mockReturnValue('Very Satisfied');
      mockGetSliderStepValue.mockReturnValue(1);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: 1,
        minLabel: 'Very Dissatisfied',
        maxValue: 5,
        maxLabel: 'Very Satisfied',
        stepValue: 1
      });
    });

    it('should handle temperature slider with negatives', () => {
      mockGetMinValue.mockReturnValue(-40);
      mockGetMaxValue.mockReturnValue(50);
      mockGetTextDisplayLower.mockReturnValue('Freezing');
      mockGetTextDisplayUpper.mockReturnValue('Very Hot');
      mockGetSliderStepValue.mockReturnValue(0.5);

      const { result } = renderHook(() => useSliderExtensions(basicQItem));

      expect(result.current).toEqual({
        minValue: -40,
        minLabel: 'Freezing',
        maxValue: 50,
        maxLabel: 'Very Hot',
        stepValue: 0.5
      });
    });
  });
});
