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
import useDisplayCqfAndCalculatedExpression from '../hooks/useDisplayCqfAndCalculatedExpression';

// Mock the store
const mockCalculatedExpressions = jest.fn();

jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      calculatedExpressions: () => mockCalculatedExpressions()
    }
  }
}));

describe('useDisplayCqfAndCalculatedExpression', () => {
  // Test data
  const basicQItem: QuestionnaireItem = {
    linkId: 'basic-item',
    text: 'Basic Item',
    type: 'string'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default empty calculated expressions
    mockCalculatedExpressions.mockReturnValue({});
  });

  describe('basic functionality (item._text)', () => {
    it('should return null when no calculated expressions exist', () => {
      mockCalculatedExpressions.mockReturnValue({});

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should return null when calculated expressions exist but not for the given item', () => {
      mockCalculatedExpressions.mockReturnValue({
        'other-item': [{ from: 'item._text', value: 'Other text' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should access calculated expressions from store', () => {
      renderHook(() => useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text'));

      expect(mockCalculatedExpressions).toHaveBeenCalled();
    });
  });

  describe('basic functionality (item._text.aria-label)', () => {
    it('should return null when no calculated expressions exist', () => {
      mockCalculatedExpressions.mockReturnValue({});

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text.aria-label')
      );

      expect(result.current).toBeNull();
    });

    it('should return null when calculated expressions exist but not for the given item', () => {
      mockCalculatedExpressions.mockReturnValue({
        'other-item': [{ from: 'item._text.aria-label', value: 'Other label' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text.aria-label')
      );

      expect(result.current).toBeNull();
    });

    it('should access calculated expressions from store', () => {
      renderHook(() => useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text.aria-label'));

      expect(mockCalculatedExpressions).toHaveBeenCalled();
    });
  });

  describe('expression finding logic', () => {
    it('should find expression with from field "item._text"', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [
          { from: 'item.value', value: 'Wrong expression' },
          { from: 'item._text', value: 'Correct expression' },
          { from: 'item.other', value: 'Another wrong expression' }
        ]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('Correct expression');
    });

    it('should return null when no expression has from field "item._text"', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [
          { from: 'item.value', value: 'Value expression' },
          { from: 'item.other', value: 'Other expression' }
        ]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should use the first matching expression when multiple exist', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [
          { from: 'item.value', value: 'First non-matching' },
          { from: 'item._text', value: 'First matching' },
          { from: 'item._text', value: 'Second matching' }
        ]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('First matching');
    });
  });

  describe('string value handling', () => {
    it('should return string value as-is', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 'Simple string value' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('Simple string value');
    });

    it('should handle empty string value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: '' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('');
    });

    it('should handle string with special characters', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 'Text with special chars: @#$%^&*()' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('Text with special chars: @#$%^&*()');
    });

    it('should handle multi-line string', () => {
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: multiLineText }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe(multiLineText);
    });
  });

  describe('number value handling', () => {
    it('should convert integer to string', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 42 }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('42');
    });

    it('should convert decimal to string', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 3.14159 }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('3.14159');
    });

    it('should convert zero to string', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 0 }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('0');
    });

    it('should convert negative number to string', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: -123 }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('-123');
    });

    it('should handle very large numbers', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 999999999999999 }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('999999999999999');
    });
  });

  describe('null value handling', () => {
    it('should return empty string for null value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: null }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('');
    });
  });

  describe('non-primitive value handling', () => {
    it('should return null for object value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: { complex: 'object' } }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should return null for array value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: ['array', 'value'] }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should return null for boolean value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: true }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should return null for undefined value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: undefined }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle missing expressions array', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': null
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should handle empty expressions array', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': []
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should handle expression without from field', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ value: 'Missing from field' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should handle expression without value field', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });

    it('should handle malformed expression object', () => {
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [null, { from: 'item._text', value: 'Valid expression' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('Valid expression');
    });
  });

  describe('different qItem linkIds', () => {
    it('should work with different linkId patterns', () => {
      const complexLinkIdItem: QuestionnaireItem = {
        linkId: 'complex.nested.linkId',
        text: 'Complex LinkId',
        type: 'string'
      };

      mockCalculatedExpressions.mockReturnValue({
        'complex.nested.linkId': [{ from: 'item._text', value: 'Complex linkId value' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(complexLinkIdItem, 'item._text')
      );

      expect(result.current).toBe('Complex linkId value');
    });

    it('should handle special characters in linkId', () => {
      const specialLinkIdItem: QuestionnaireItem = {
        linkId: 'item-with@special#chars',
        text: 'Special LinkId',
        type: 'string'
      };

      mockCalculatedExpressions.mockReturnValue({
        'item-with@special#chars': [{ from: 'item._text', value: 'Special chars work' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(specialLinkIdItem, 'item._text')
      );

      expect(result.current).toBe('Special chars work');
    });

    it('should handle numeric linkId', () => {
      const numericLinkIdItem: QuestionnaireItem = {
        linkId: '12345',
        text: 'Numeric LinkId',
        type: 'string'
      };

      mockCalculatedExpressions.mockReturnValue({
        '12345': [{ from: 'item._text', value: 'Numeric linkId value' }]
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(numericLinkIdItem, 'item._text')
      );

      expect(result.current).toBe('Numeric linkId value');
    });
  });

  describe('store integration', () => {
    it('should react to store changes', () => {
      // Initial store state
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 'Initial value' }]
      });

      const { result, rerender } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('Initial value');

      // Update store state
      mockCalculatedExpressions.mockReturnValue({
        'basic-item': [{ from: 'item._text', value: 'Updated value' }]
      });

      rerender();

      expect(result.current).toBe('Updated value');
    });

    it('should handle store returning null/undefined', () => {
      mockCalculatedExpressions.mockReturnValue(null);

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull();
    });
  });

  describe('real-world scenarios', () => {
    it('should handle calculated field display text', () => {
      mockCalculatedExpressions.mockReturnValue({
        'calculated-bmi': [
          { from: 'item.value', value: 24.5 },
          { from: 'item._text', value: 'Your BMI is calculated as: 24.5' }
        ]
      });

      const bmiItem: QuestionnaireItem = {
        linkId: 'calculated-bmi',
        text: 'BMI',
        type: 'decimal'
      };

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(bmiItem, 'item._text')
      );

      expect(result.current).toBe('Your BMI is calculated as: 24.5');
    });

    it('should handle dynamic text based on calculation', () => {
      mockCalculatedExpressions.mockReturnValue({
        'risk-assessment': [
          { from: 'item._text', value: 'Based on your responses, your risk level is: HIGH' }
        ]
      });

      const riskItem: QuestionnaireItem = {
        linkId: 'risk-assessment',
        text: 'Risk Assessment',
        type: 'string'
      };

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(riskItem, 'item._text')
      );

      expect(result.current).toBe('Based on your responses, your risk level is: HIGH');
    });

    it('should handle conditional display text', () => {
      mockCalculatedExpressions.mockReturnValue({
        'conditional-message': [
          { from: 'item._text', value: null } // Condition not met
        ]
      });

      const conditionalItem: QuestionnaireItem = {
        linkId: 'conditional-message',
        text: 'Conditional Message',
        type: 'string'
      };

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(conditionalItem, 'item._text')
      );

      expect(result.current).toBe(''); // null becomes empty string
    });

    it('should handle score display with numeric value', () => {
      mockCalculatedExpressions.mockReturnValue({
        'total-score': [{ from: 'item._text', value: 85 }]
      });

      const scoreItem: QuestionnaireItem = {
        linkId: 'total-score',
        text: 'Total Score',
        type: 'integer'
      };

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(scoreItem, 'item._text')
      );

      expect(result.current).toBe('85');
    });
  });

  describe('type consistency', () => {
    it('should always return string or null', () => {
      const testCases = [
        { value: 'string', expected: 'string' },
        { value: 42, expected: '42' },
        { value: 0, expected: '0' },
        { value: null, expected: '' },
        { value: {}, expected: null },
        { value: [], expected: null },
        { value: true, expected: null },
        { value: undefined, expected: null }
      ];

      testCases.forEach(({ value, expected }) => {
        mockCalculatedExpressions.mockReturnValue({
          'basic-item': [{ from: 'item._text', value }]
        });

        const { result } = renderHook(() =>
          useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
        );

        expect(result.current).toBe(expected);
      });
    });
  });

  describe('performance considerations', () => {
    it('should handle large calculated expressions object', () => {
      const largeExpressionsObject: Record<string, any[]> = {};

      // Create 1000 items
      for (let i = 0; i < 1000; i++) {
        largeExpressionsObject[`item-${i}`] = [{ from: 'item._text', value: `Value ${i}` }];
      }

      mockCalculatedExpressions.mockReturnValue(largeExpressionsObject);

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBeNull(); // basic-item not in large object
    });

    it('should handle expressions array with many items', () => {
      const manyExpressions = Array.from({ length: 100 }, (_, i) => ({
        from: i === 50 ? 'item._text' : 'other.field',
        value: `Expression ${i}`
      }));

      mockCalculatedExpressions.mockReturnValue({
        'basic-item': manyExpressions
      });

      const { result } = renderHook(() =>
        useDisplayCqfAndCalculatedExpression(basicQItem, 'item._text')
      );

      expect(result.current).toBe('Expression 50'); // First matching expression
    });
  });
});
