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
import useRenderingExtensions from '../hooks/useRenderingExtensions';

// Mock the extension utility functions
const mockGetTextDisplayUnit = jest.fn();
const mockGetTextDisplayPrompt = jest.fn();
const mockGetTextDisplayInstructions = jest.fn();
const mockGetTextDisplayFlyover = jest.fn();
const mockGetQuantityUnit = jest.fn();

jest.mock('../utils/extensions', () => ({
  getTextDisplayUnit: (...args: any[]) => mockGetTextDisplayUnit(...args),
  getTextDisplayPrompt: (...args: any[]) => mockGetTextDisplayPrompt(...args),
  getTextDisplayInstructions: (...args: any[]) => mockGetTextDisplayInstructions(...args),
  getTextDisplayFlyover: (...args: any[]) => mockGetTextDisplayFlyover(...args),
  getQuantityUnit: (...args: any[]) => mockGetQuantityUnit(...args)
}));

// Mock structured data capture functions
const mockGetEntryFormat = jest.fn();

jest.mock('fhir-sdc-helpers', () => ({
  structuredDataCapture: {
    getEntryFormat: (...args: any[]) => mockGetEntryFormat(...args)
  }
}));

describe('useRenderingExtensions', () => {
  // Test data
  const basicQItem: QuestionnaireItem = {
    linkId: 'basic-item',
    text: 'Basic Item',
    type: 'string'
  };

  const fullQItem: QuestionnaireItem = {
    linkId: 'full-item',
    text: 'Full Item',
    type: 'string',
    readOnly: true,
    required: true
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock returns
    mockGetTextDisplayUnit.mockReturnValue('kg');
    mockGetTextDisplayPrompt.mockReturnValue('Enter value');
    mockGetTextDisplayInstructions.mockReturnValue('Please provide details');
    mockGetTextDisplayFlyover.mockReturnValue('Help text');
    mockGetQuantityUnit.mockReturnValue({ valueCoding: { code: 'kg', display: 'kilogram' } });
    mockGetEntryFormat.mockReturnValue('###.##');
  });

  describe('basic rendering extensions extraction', () => {
    it('should extract all rendering extensions from a basic item', () => {
      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current).toEqual({
        displayUnit: 'kg',
        displayPrompt: 'Enter value',
        displayInstructions: 'Please provide details',
        displayFlyover: 'Help text',
        readOnly: false,
        entryFormat: '###.##',
        required: false,
        quantityUnit: { valueCoding: { code: 'kg', display: 'kilogram' } }
      });
    });

    it('should call all extension utility functions with correct qItem', () => {
      renderHook(() => useRenderingExtensions(basicQItem));

      expect(mockGetTextDisplayUnit).toHaveBeenCalledWith(basicQItem);
      expect(mockGetTextDisplayPrompt).toHaveBeenCalledWith(basicQItem);
      expect(mockGetTextDisplayInstructions).toHaveBeenCalledWith(basicQItem);
      expect(mockGetTextDisplayFlyover).toHaveBeenCalledWith(basicQItem);
      expect(mockGetQuantityUnit).toHaveBeenCalledWith(basicQItem);
      expect(mockGetEntryFormat).toHaveBeenCalledWith(basicQItem);
    });

    it('should extract boolean flags from qItem properties', () => {
      const { result } = renderHook(() => useRenderingExtensions(fullQItem));

      expect(result.current.readOnly).toBe(true);
      expect(result.current.required).toBe(true);
    });
  });

  describe('boolean flag handling', () => {
    it('should handle readOnly as false when not set', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'no-readonly',
        text: 'Not ReadOnly',
        type: 'string'
      };

      const { result } = renderHook(() => useRenderingExtensions(qItem));

      expect(result.current.readOnly).toBe(false);
    });

    it('should handle readOnly as false when explicitly false', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'explicitly-false',
        text: 'Explicitly False',
        type: 'string',
        readOnly: false
      };

      const { result } = renderHook(() => useRenderingExtensions(qItem));

      expect(result.current.readOnly).toBe(false);
    });

    it('should handle required as false when not set', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'not-required',
        text: 'Not Required',
        type: 'string'
      };

      const { result } = renderHook(() => useRenderingExtensions(qItem));

      expect(result.current.required).toBe(false);
    });

    it('should handle required as false when explicitly false', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'explicitly-not-required',
        text: 'Explicitly Not Required',
        type: 'string',
        required: false
      };

      const { result } = renderHook(() => useRenderingExtensions(qItem));

      expect(result.current.required).toBe(false);
    });
  });

  describe('extension function return variations', () => {
    it('should handle empty string returns from extension functions', () => {
      mockGetTextDisplayUnit.mockReturnValue('');
      mockGetTextDisplayPrompt.mockReturnValue('');
      mockGetTextDisplayInstructions.mockReturnValue('');

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.displayUnit).toBe('');
      expect(result.current.displayPrompt).toBe('');
      expect(result.current.displayInstructions).toBe('');
    });

    it('should handle null returns from extension functions', () => {
      mockGetQuantityUnit.mockReturnValue(null);
      mockGetEntryFormat.mockReturnValue(null);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.quantityUnit).toBeNull();
      expect(result.current.entryFormat).toBe('');
    });

    it('should handle undefined returns from extension functions', () => {
      mockGetTextDisplayUnit.mockReturnValue(undefined);
      mockGetEntryFormat.mockReturnValue(undefined);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.displayUnit).toBeUndefined();
      expect(result.current.entryFormat).toBe('');
    });

    it('should handle complex flyover content', () => {
      const complexFlyover = { type: 'div', children: ['Complex help'] };
      mockGetTextDisplayFlyover.mockReturnValue(complexFlyover);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.displayFlyover).toEqual(complexFlyover);
    });

    it('should handle array flyover content', () => {
      const arrayFlyover = ['Help item 1', 'Help item 2'];
      mockGetTextDisplayFlyover.mockReturnValue(arrayFlyover);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.displayFlyover).toEqual(arrayFlyover);
    });
  });

  describe('memoization behavior', () => {
    it('should return same result object when qItem does not change', () => {
      const { result, rerender } = renderHook(({ qItem }) => useRenderingExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      const firstResult = result.current;

      // Re-render with same qItem
      rerender({ qItem: basicQItem });

      expect(result.current).toBe(firstResult); // Reference equality
    });

    it('should recompute when qItem changes', () => {
      const { result, rerender } = renderHook(({ qItem }) => useRenderingExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      const firstResult = result.current;

      // Change qItem
      rerender({ qItem: fullQItem });

      expect(result.current).not.toBe(firstResult);
      expect(result.current.readOnly).toBe(true);
      expect(result.current.required).toBe(true);
    });

    it('should call extension functions only once for same qItem', () => {
      const { rerender } = renderHook(({ qItem }) => useRenderingExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      expect(mockGetTextDisplayUnit).toHaveBeenCalledTimes(1);

      // Re-render with same qItem
      rerender({ qItem: basicQItem });

      // Should not call again due to memoization
      expect(mockGetTextDisplayUnit).toHaveBeenCalledTimes(1);
    });

    it('should call extension functions again when qItem changes', () => {
      const { rerender } = renderHook(({ qItem }) => useRenderingExtensions(qItem), {
        initialProps: { qItem: basicQItem }
      });

      expect(mockGetTextDisplayUnit).toHaveBeenCalledTimes(1);

      // Change qItem
      rerender({ qItem: fullQItem });

      // Should call again
      expect(mockGetTextDisplayUnit).toHaveBeenCalledTimes(2);
      expect(mockGetTextDisplayUnit).toHaveBeenLastCalledWith(fullQItem);
    });
  });

  describe('complex qItem structures', () => {
    it('should handle qItem with extensions', () => {
      const qItemWithExtensions: QuestionnaireItem = {
        linkId: 'with-extensions',
        text: 'Item with Extensions',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
            valueCodeableConcept: { text: 'instructions' }
          }
        ]
      };

      const { result } = renderHook(() => useRenderingExtensions(qItemWithExtensions));

      expect(mockGetTextDisplayInstructions).toHaveBeenCalledWith(qItemWithExtensions);
      expect(result.current).toHaveProperty('displayInstructions');
    });

    it('should handle qItem with answer options', () => {
      const qItemWithAnswers: QuestionnaireItem = {
        linkId: 'with-answers',
        text: 'Item with Answers',
        type: 'choice',
        answerOption: [
          { valueCoding: { code: 'option1', display: 'Option 1' } },
          { valueCoding: { code: 'option2', display: 'Option 2' } }
        ]
      };

      const { result } = renderHook(() => useRenderingExtensions(qItemWithAnswers));

      expect(mockGetQuantityUnit).toHaveBeenCalledWith(qItemWithAnswers);
      expect(result.current).toHaveProperty('quantityUnit');
    });

    it('should handle nested qItem structures', () => {
      const nestedQItem: QuestionnaireItem = {
        linkId: 'nested',
        text: 'Nested Item',
        type: 'group',
        item: [
          { linkId: 'child1', text: 'Child 1', type: 'string' },
          { linkId: 'child2', text: 'Child 2', type: 'string' }
        ]
      };

      const { result } = renderHook(() => useRenderingExtensions(nestedQItem));

      expect(result.current).toHaveProperty('displayUnit');
      expect(result.current).toHaveProperty('readOnly', false);
      expect(result.current).toHaveProperty('required', false);
    });
  });

  describe('entry format handling', () => {
    it('should use entry format from SDC when available', () => {
      mockGetEntryFormat.mockReturnValue('DD/MM/YYYY');

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.entryFormat).toBe('DD/MM/YYYY');
    });

    it('should use empty string when entry format is null', () => {
      mockGetEntryFormat.mockReturnValue(null);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.entryFormat).toBe('');
    });

    it('should use empty string when entry format is undefined', () => {
      mockGetEntryFormat.mockReturnValue(undefined);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.entryFormat).toBe('');
    });
  });

  describe('quantity unit handling', () => {
    it('should handle complex quantity unit objects', () => {
      const complexUnit = {
        valueCoding: {
          system: 'http://unitsofmeasure.org',
          code: 'kg',
          display: 'kilogram'
        },
        valueString: 'Weight in kilograms'
      };
      mockGetQuantityUnit.mockReturnValue(complexUnit);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.quantityUnit).toEqual(complexUnit);
    });

    it('should handle null quantity unit', () => {
      mockGetQuantityUnit.mockReturnValue(null);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.quantityUnit).toBeNull();
    });

    it('should handle undefined quantity unit', () => {
      mockGetQuantityUnit.mockReturnValue(undefined);

      const { result } = renderHook(() => useRenderingExtensions(basicQItem));

      expect(result.current.quantityUnit).toBeUndefined();
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical text input item', () => {
      mockGetTextDisplayPrompt.mockReturnValue('Enter your name');
      mockGetTextDisplayInstructions.mockReturnValue('Full legal name');
      mockGetEntryFormat.mockReturnValue('');
      mockGetQuantityUnit.mockReturnValue(null);

      const textItem: QuestionnaireItem = {
        linkId: 'patient-name',
        text: 'Patient Name',
        type: 'string',
        required: true
      };

      const { result } = renderHook(() => useRenderingExtensions(textItem));

      expect(result.current).toEqual({
        displayUnit: 'kg', // From mock
        displayPrompt: 'Enter your name',
        displayInstructions: 'Full legal name',
        displayFlyover: 'Help text', // From mock
        readOnly: false,
        entryFormat: '',
        required: true,
        quantityUnit: null
      });
    });

    it('should handle quantity item with units', () => {
      const quantityUnit = {
        valueCoding: { code: 'cm', display: 'centimeters' }
      };
      mockGetQuantityUnit.mockReturnValue(quantityUnit);
      mockGetTextDisplayUnit.mockReturnValue('cm');

      const quantityItem: QuestionnaireItem = {
        linkId: 'height',
        text: 'Height',
        type: 'quantity'
      };

      const { result } = renderHook(() => useRenderingExtensions(quantityItem));

      expect(result.current.displayUnit).toBe('cm');
      expect(result.current.quantityUnit).toEqual(quantityUnit);
    });

    it('should handle readonly calculated field', () => {
      mockGetTextDisplayInstructions.mockReturnValue('This value is calculated automatically');

      const calculatedItem: QuestionnaireItem = {
        linkId: 'bmi',
        text: 'BMI',
        type: 'decimal',
        readOnly: true
      };

      const { result } = renderHook(() => useRenderingExtensions(calculatedItem));

      expect(result.current.readOnly).toBe(true);
      expect(result.current.displayInstructions).toBe('This value is calculated automatically');
    });
  });

  describe('edge cases', () => {
    it('should handle qItem with minimal properties', () => {
      const minimalItem: QuestionnaireItem = {
        linkId: 'minimal',
        type: 'string'
      };

      const { result } = renderHook(() => useRenderingExtensions(minimalItem));

      expect(result.current.readOnly).toBe(false);
      expect(result.current.required).toBe(false);
      expect(typeof result.current.displayUnit).toBe('string');
    });

    it('should handle qItem with null text', () => {
      const nullTextItem: QuestionnaireItem = {
        linkId: 'null-text',
        text: undefined,
        type: 'string'
      };

      const { result } = renderHook(() => useRenderingExtensions(nullTextItem));

      expect(result.current).toHaveProperty('displayUnit');
      expect(result.current).toHaveProperty('readOnly');
    });

    it('should handle qItem with special characters in linkId', () => {
      const specialItem: QuestionnaireItem = {
        linkId: 'item-with@special#chars!',
        text: 'Special Item',
        type: 'string'
      };

      const { result } = renderHook(() => useRenderingExtensions(specialItem));

      expect(mockGetTextDisplayUnit).toHaveBeenCalledWith(specialItem);
      expect(result.current).toHaveProperty('displayUnit');
    });
  });
});
