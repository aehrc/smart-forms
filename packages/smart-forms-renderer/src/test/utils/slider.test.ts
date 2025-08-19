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

import type { QuestionnaireItem, Extension } from 'fhir/r4';
import {
  getSliderStepValue,
  getMinValue,
  getMaxValue,
  getSliderMarks
} from '../../utils/slider';

describe('slider utilities', () => {
  describe('getSliderStepValue', () => {
    it('should return step value when extension with valueInteger is present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
            valueInteger: 5
          }
        ]
      };

      expect(getSliderStepValue(qItem)).toBe(5);
    });

    it('should return null when extension is not present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer'
      };

      expect(getSliderStepValue(qItem)).toBeNull();
    });

    it('should return null when extensions array is empty', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: []
      };

      expect(getSliderStepValue(qItem)).toBeNull();
    });

    it('should return null when extension exists but has no valueInteger', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
            valueString: '5'
          }
        ]
      };

      expect(getSliderStepValue(qItem)).toBeNull();
    });

    it('should return null when extension exists but valueInteger is undefined', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
            valueInteger: undefined
          }
        ]
      };

      expect(getSliderStepValue(qItem)).toBeNull();
    });

    it('should find correct extension among multiple extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://other.extension.url',
            valueString: 'other'
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
            valueInteger: 10
          },
          {
            url: 'http://another.extension.url',
            valueBoolean: true
          }
        ]
      };

      expect(getSliderStepValue(qItem)).toBe(10);
    });

    it('should handle zero step value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
            valueInteger: 0
          }
        ]
      };

      expect(getSliderStepValue(qItem)).toBeNull(); // Zero is falsy, so returns null
    });

    it('should handle negative step value', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
            valueInteger: -1
          }
        ]
      };

      expect(getSliderStepValue(qItem)).toBe(-1);
    });
  });

  describe('getMinValue', () => {
    it('should return integer value when extension with valueInteger is present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueInteger: 10
          }
        ]
      };

      expect(getMinValue(qItem)).toBe(10);
    });

    it('should return decimal value when extension with valueDecimal is present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'decimal',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueDecimal: 5.5
          }
        ]
      };

      expect(getMinValue(qItem)).toBe(5.5);
    });

    it('should prefer valueInteger over valueDecimal when both are present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueInteger: 10,
            valueDecimal: 5.5
          }
        ]
      };

      expect(getMinValue(qItem)).toBe(10);
    });

    it('should return null when extension is not present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer'
      };

      expect(getMinValue(qItem)).toBeNull();
    });

    it('should return null when extension exists but has neither valueInteger nor valueDecimal', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueString: '10'
          }
        ]
      };

      expect(getMinValue(qItem)).toBeNull();
    });

    it('should handle negative values', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueInteger: -100
          }
        ]
      };

      expect(getMinValue(qItem)).toBe(-100);
    });

    it('should handle zero values', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueDecimal: 0
          }
        ]
      };

      expect(getMinValue(qItem)).toBeNull(); // Zero is falsy, so returns null
    });
  });

  describe('getMaxValue', () => {
    it('should return integer value when extension with valueInteger is present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
            valueInteger: 100
          }
        ]
      };

      expect(getMaxValue(qItem)).toBe(100);
    });

    it('should return decimal value when extension with valueDecimal is present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'decimal',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
            valueDecimal: 99.9
          }
        ]
      };

      expect(getMaxValue(qItem)).toBe(99.9);
    });

    it('should prefer valueInteger over valueDecimal when both are present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
            valueInteger: 100,
            valueDecimal: 99.9
          }
        ]
      };

      expect(getMaxValue(qItem)).toBe(100);
    });

    it('should return null when extension is not present', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer'
      };

      expect(getMaxValue(qItem)).toBeNull();
    });

    it('should find correct extension among multiple extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-slider',
        type: 'integer',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/minValue',
            valueInteger: 0
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
            valueInteger: 200
          }
        ]
      };

      expect(getMaxValue(qItem)).toBe(200);
    });
  });

  describe('getSliderMarks', () => {
    it('should return only min and max marks when number of steps exceeds 20', () => {
      const result = getSliderMarks(0, 100, 'min', 'max', 1);
      
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { value: 0, label: 'min' },
        { value: 100, label: 'max' }
      ]);
    });

    it('should use value.toString() as label when label is empty string', () => {
      const result = getSliderMarks(0, 100, '', '', 1);
      
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { value: 0, label: '0' },
        { value: 100, label: '100' }
      ]);
    });

    it('should return all step marks when number of steps is 20 or fewer', () => {
      const result = getSliderMarks(0, 10, 'start', 'end', 1);
      
      expect(result).toHaveLength(11); // 0,1,2,3,4,5,6,7,8,9,10
      expect(result[0]).toEqual({ value: 0, label: 0 });
      expect(result[5]).toEqual({ value: 5, label: 5 });
      expect(result[10]).toEqual({ value: 10, label: 10 });
    });

    it('should handle decimal step values correctly', () => {
      const result = getSliderMarks(0, 5, 'min', 'max', 0.5);
      
      expect(result).toHaveLength(11); // 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5
      expect(result[0]).toEqual({ value: 0, label: 0 });
      expect(result[1]).toEqual({ value: 0.5, label: 0.5 });
      expect(result[2]).toEqual({ value: 1, label: 1 });
    });

    it('should handle negative ranges', () => {
      const result = getSliderMarks(-5, 5, 'negative', 'positive', 2);
      
      expect(result).toHaveLength(6); // -5, -3, -1, 1, 3, 5
      expect(result[0]).toEqual({ value: -5, label: -5 });
      expect(result[5]).toEqual({ value: 5, label: 5 });
    });

    it('should handle single step (min equals max)', () => {
      const result = getSliderMarks(10, 10, 'same', 'same', 1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ value: 10, label: 10 });
    });

    it('should handle large step values', () => {
      const result = getSliderMarks(0, 100, 'start', 'end', 50);
      
      expect(result).toHaveLength(3); // 0, 50, 100
      expect(result).toEqual([
        { value: 0, label: 0 },
        { value: 50, label: 50 },
        { value: 100, label: 100 }
      ]);
    });

    it('should use Math.ceil for step calculation', () => {
      // Range of 21 with step 1 = 21 steps, which is > 20, so should return only min/max
      const result = getSliderMarks(0, 21, 'min', 'max', 1);
      
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { value: 0, label: 'min' },
        { value: 21, label: 'max' }
      ]);
    });

    it('should handle edge case where steps exactly equal 20', () => {
      const result = getSliderMarks(0, 20, 'start', 'end', 1);
      
      expect(result).toHaveLength(21); // 20 steps = 21 marks (0 to 20)
      expect(result[0]).toEqual({ value: 0, label: 0 });
      expect(result[20]).toEqual({ value: 20, label: 20 });
    });

    it('should handle fractional results from step division', () => {
      const result = getSliderMarks(0, 7, 'min', 'max', 2);
      
      // 7 / 2 = 3.5, Math.ceil(3.5) = 4 steps, which is <= 20
      expect(result).toHaveLength(5); // 0, 2, 4, 6, 8 (but 8 > 7, so actual: 0, 2, 4, 6)
    });

    describe('complex scenarios', () => {
      it('should handle very small step values', () => {
        const result = getSliderMarks(0, 2, 'min', 'max', 0.1);
        
        // 2 / 0.1 = 20 steps exactly, so should return all marks
        expect(result).toHaveLength(21);
        expect(result[0]).toEqual({ value: 0, label: 0 });
        expect(result[10]).toEqual({ value: 1, label: 1 });
        expect(result[20]).toEqual({ value: 2, label: 2 });
      });

      it('should handle very large ranges with appropriate steps', () => {
        const result = getSliderMarks(0, 1000, 'minimum', 'maximum', 100);
        
        expect(result).toHaveLength(11); // 0, 100, 200, ..., 1000
        expect(result[0]).toEqual({ value: 0, label: 0 });
        expect(result[10]).toEqual({ value: 1000, label: 1000 });
      });

      it('should handle mixed label scenarios', () => {
        const result = getSliderMarks(-10, 10, '', 'Maximum', 5);
        
        expect(result).toHaveLength(5); // -10, -5, 0, 5, 10
        // When > 20 steps logic applies, it should use toString for empty labels
        
        // Actually, this should be <= 20 steps: (10 - (-10)) / 5 = 4 steps
        expect(result[0]).toEqual({ value: -10, label: -10 });
        expect(result[4]).toEqual({ value: 10, label: 10 });
      });
    });

    describe('edge cases', () => {
      it('should handle zero step value gracefully', () => {
        // This would cause division by zero, but Math.ceil(Infinity) handling
        const result = getSliderMarks(0, 10, 'min', 'max', 0);
        
        // Should fallback to min/max only due to infinite steps
        expect(result).toHaveLength(2);
        expect(result).toEqual([
          { value: 0, label: 'min' },
          { value: 10, label: 'max' }
        ]);
      });

      it('should handle negative step values', () => {
        const result = getSliderMarks(0, 10, 'min', 'max', -1);
        
        // Negative step creates Math.ceil(-10) = -10, so empty array from Array.from
        expect(result).toHaveLength(0);
      });

      it('should handle very precise decimal calculations', () => {
        const result = getSliderMarks(0, 1, 'zero', 'one', 0.1);
        
        expect(result).toHaveLength(11); // 0, 0.1, 0.2, ..., 1.0
        expect(result[0]).toEqual({ value: 0, label: 0 });
        expect(result[10]).toEqual({ value: 1, label: 1 });
      });
    });
  });
});
