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

import type { Extension } from 'fhir/r4';
import { optionIsAnswerOptionsToggleExpressionOption } from '../utils/questionnaireStoreUtils/extractAnswerOptionsToggleExpressions';

describe('extractAnswerOptionsToggleExpressions - Phase 5', () => {
  describe('optionIsAnswerOptionsToggleExpressionOption', () => {
    it('should return true when extension has valueCoding', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueCoding: {
          system: 'http://example.com/codes',
          code: 'example-code',
          display: 'Example Code'
        }
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has valueString', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueString: 'example string value'
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has valueInteger', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueInteger: 42
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has multiple value types (valueCoding and valueString)', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueCoding: {
          system: 'http://example.com/codes',
          code: 'example-code'
        },
        valueString: 'example string'
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has multiple value types (valueCoding and valueInteger)', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueCoding: {
          system: 'http://example.com/codes',
          code: 'example-code'
        },
        valueInteger: 123
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has multiple value types (valueString and valueInteger)', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueString: 'example string',
        valueInteger: 456
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has all three value types', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueCoding: {
          system: 'http://example.com/codes',
          code: 'example-code'
        },
        valueString: 'example string',
        valueInteger: 789
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return false when extension has no value properties', () => {
      const extension: Extension = {
        url: 'http://example.com/option'
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(false);
    });

    it('should return false when extension has other value types but not the required ones', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueBoolean: true,
        valueDecimal: 3.14
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(false);
    });

    it('should return false when extension has valueDate but not required value types', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueDate: '2023-01-01'
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(false);
    });

    it('should return false when extension has valueReference but not required value types', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueReference: {
          reference: 'Patient/123'
        }
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(false);
    });

    it('should return true when extension has valueCoding with minimal properties', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueCoding: {
          code: 'minimal-code'
        }
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has empty valueString', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueString: ''
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has zero valueInteger', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueInteger: 0
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has negative valueInteger', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueInteger: -1
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should return true when extension has empty valueCoding object', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueCoding: {}
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });

    it('should handle complex extension with other properties', () => {
      const extension: Extension = {
        url: 'http://example.com/option',
        valueString: 'target value',
        extension: [
          {
            url: 'nested',
            valueBoolean: true
          }
        ]
      };

      const result = optionIsAnswerOptionsToggleExpressionOption(extension);

      expect(result).toBe(true);
    });
  });
});
