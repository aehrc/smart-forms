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

import type { Quantity, QuestionnaireItemAnswerOption } from 'fhir/r4';
import {
  quantityComparators,
  stringIsComparator,
  createQuantityItemAnswer
} from '../../utils/quantity';

// Mock the parseInputs module
jest.mock('../../utils/parseInputs', () => ({
  parseDecimalStringToFloat: jest.fn((value: string, precision: number) => {
    return parseFloat(parseFloat(value).toFixed(precision));
  })
}));

describe('quantity utilities', () => {
  describe('quantityComparators', () => {
    it('should contain all valid quantity comparators', () => {
      expect(quantityComparators).toEqual(['<', '<=', '>=', '>']);
    });

    it('should have exactly 4 comparators', () => {
      expect(quantityComparators).toHaveLength(4);
    });

    it('should be readonly array', () => {
      expect(Array.isArray(quantityComparators)).toBe(true);
    });
  });

  describe('stringIsComparator', () => {
    it('should return true for valid comparators', () => {
      expect(stringIsComparator('<')).toBe(true);
      expect(stringIsComparator('<=')).toBe(true);
      expect(stringIsComparator('>=')).toBe(true);
      expect(stringIsComparator('>')).toBe(true);
    });

    it('should return false for invalid comparators', () => {
      expect(stringIsComparator('=')).toBe(false);
      expect(stringIsComparator('!=')).toBe(false);
      expect(stringIsComparator('==')).toBe(false);
      expect(stringIsComparator('<>')).toBe(false);
      expect(stringIsComparator('invalid')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(stringIsComparator(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(stringIsComparator('')).toBe(false);
    });

    it('should return false for whitespace strings', () => {
      expect(stringIsComparator(' ')).toBe(false);
      expect(stringIsComparator('  <  ')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(stringIsComparator('LT')).toBe(false);
      expect(stringIsComparator('lt')).toBe(false);
      expect(stringIsComparator('Less')).toBe(false);
    });
  });

  describe('createQuantityItemAnswer', () => {
    const createMockUnit = (
      display?: string,
      system?: string,
      code?: string
    ): QuestionnaireItemAnswerOption => ({
      valueCoding: {
        display,
        system,
        code
      }
    });

    describe('with precision', () => {
      it('should create answer with parsed decimal value when precision is provided', () => {
        const result = createQuantityItemAnswer(
          2,
          '3.14159',
          '<',
          createMockUnit('kg', 'http://unitsofmeasure.org', 'kg'),
          'answer-1'
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: 'answer-1',
          valueQuantity: {
            value: 3.14, // Should be rounded to 2 decimal places by parseDecimalStringToFloat
            comparator: '<',
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        });
      });

      it('should handle zero precision', () => {
        const result = createQuantityItemAnswer(
          0,
          '3.14159',
          '>=',
          createMockUnit('items', 'http://unitsofmeasure.org', '1'),
          'answer-2'
        );

        expect(result[0].valueQuantity?.value).toBe(3.14159); // Zero precision is falsy, so uses parseFloat path
      });

      it('should handle high precision', () => {
        const result = createQuantityItemAnswer(
          5,
          '3.123456789',
          '<=',
          createMockUnit('mg', 'http://unitsofmeasure.org', 'mg'),
          'answer-3'
        );

        expect(result[0].valueQuantity?.value).toBe(3.12346); // Should be rounded to 5 decimal places
      });
    });

    describe('without precision', () => {
      it('should create answer with parseFloat value when precision is null', () => {
        const result = createQuantityItemAnswer(
          null,
          '42.7',
          '>',
          createMockUnit('cm', 'http://unitsofmeasure.org', 'cm'),
          'answer-4'
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: 'answer-4',
          valueQuantity: {
            value: 42.7,
            comparator: '>',
            unit: 'cm',
            system: 'http://unitsofmeasure.org',
            code: 'cm'
          }
        });
      });

      it('should handle integer strings correctly', () => {
        const result = createQuantityItemAnswer(
          null,
          '100',
          '<',
          createMockUnit('bpm', 'http://unitsofmeasure.org', '/min'),
          'answer-5'
        );

        expect(result[0].valueQuantity?.value).toBe(100);
      });
    });

    describe('comparator handling', () => {
      it('should use provided comparator', () => {
        const result = createQuantityItemAnswer(null, '10', '>=', null, undefined);
        expect(result[0].valueQuantity?.comparator).toBe('>=');
      });

      it('should set undefined when comparator is null', () => {
        const result = createQuantityItemAnswer(null, '10', null, null, undefined);
        expect(result[0].valueQuantity?.comparator).toBeUndefined();
      });
    });

    describe('unit handling', () => {
      it('should handle complete unit information', () => {
        const unit = createMockUnit('kilograms', 'http://unitsofmeasure.org', 'kg');
        const result = createQuantityItemAnswer(null, '10', null, unit, undefined);

        expect(result[0].valueQuantity?.unit).toBe('kilograms');
        expect(result[0].valueQuantity?.system).toBe('http://unitsofmeasure.org');
        expect(result[0].valueQuantity?.code).toBe('kg');
      });

      it('should handle partial unit information', () => {
        const unit = createMockUnit('kg', undefined, 'kg');
        const result = createQuantityItemAnswer(null, '10', null, unit, undefined);

        expect(result[0].valueQuantity?.unit).toBe('kg');
        expect(result[0].valueQuantity?.system).toBeUndefined();
        expect(result[0].valueQuantity?.code).toBe('kg');
      });

      it('should handle null unit', () => {
        const result = createQuantityItemAnswer(null, '10', null, null, undefined);

        expect(result[0].valueQuantity?.unit).toBeUndefined();
        expect(result[0].valueQuantity?.system).toBeUndefined();
        expect(result[0].valueQuantity?.code).toBeUndefined();
      });

      it('should handle unit with null valueCoding', () => {
        const unit: QuestionnaireItemAnswerOption = { valueCoding: null as any };
        const result = createQuantityItemAnswer(null, '10', null, unit, undefined);

        expect(result[0].valueQuantity?.unit).toBeUndefined();
        expect(result[0].valueQuantity?.system).toBeUndefined();
        expect(result[0].valueQuantity?.code).toBeUndefined();
      });
    });

    describe('answer key handling', () => {
      it('should set id when answerKey is provided', () => {
        const result = createQuantityItemAnswer(null, '10', null, null, 'my-answer-key');
        expect(result[0].id).toBe('my-answer-key');
      });

      it('should set undefined when answerKey is undefined', () => {
        const result = createQuantityItemAnswer(null, '10', null, null, undefined);
        expect(result[0].id).toBeUndefined();
      });

      it('should handle empty string answerKey', () => {
        const result = createQuantityItemAnswer(null, '10', null, null, '');
        expect(result[0].id).toBe('');
      });
    });

    describe('edge cases', () => {
      it('should handle zero values', () => {
        const result = createQuantityItemAnswer(null, '0', null, null, undefined);
        expect(result[0].valueQuantity?.value).toBe(0);
      });

      it('should handle negative values', () => {
        const result = createQuantityItemAnswer(null, '-5.5', null, null, undefined);
        expect(result[0].valueQuantity?.value).toBe(-5.5);
      });

      it('should handle very large numbers', () => {
        const result = createQuantityItemAnswer(null, '999999999.999', null, null, undefined);
        expect(result[0].valueQuantity?.value).toBe(999999999.999);
      });

      it('should handle scientific notation', () => {
        const result = createQuantityItemAnswer(null, '1e3', null, null, undefined);
        expect(result[0].valueQuantity?.value).toBe(1000);
      });

      it('should handle precision of 1', () => {
        const result = createQuantityItemAnswer(1, '3.789', null, null, undefined);
        expect(result[0].valueQuantity?.value).toBe(3.8); // Rounded to 1 decimal place
      });
    });

    describe('complex scenarios', () => {
      it('should create complete quantity answer with all parameters', () => {
        const unit = createMockUnit('milliliters per hour', 'http://unitsofmeasure.org', 'mL/h');

        const result = createQuantityItemAnswer(3, '125.6789', '<=', unit, 'infusion-rate');

        expect(result).toEqual([
          {
            id: 'infusion-rate',
            valueQuantity: {
              value: 125.679, // 3 decimal places
              comparator: '<=',
              unit: 'milliliters per hour',
              system: 'http://unitsofmeasure.org',
              code: 'mL/h'
            }
          }
        ]);
      });

      it('should always return an array with one element', () => {
        const result1 = createQuantityItemAnswer(null, '10', null, null, undefined);
        const result2 = createQuantityItemAnswer(2, '20.5', '>', null, 'test');

        expect(result1).toHaveLength(1);
        expect(result2).toHaveLength(1);
        expect(Array.isArray(result1)).toBe(true);
        expect(Array.isArray(result2)).toBe(true);
      });

      it('should handle all comparator types correctly', () => {
        const comparators: Quantity['comparator'][] = ['<', '<=', '>=', '>'];

        comparators.forEach((comparator, index) => {
          const result = createQuantityItemAnswer(
            null,
            `${index}`,
            comparator,
            null,
            `test-${index}`
          );
          expect(result[0].valueQuantity?.comparator).toBe(comparator);
        });
      });
    });
  });
});
