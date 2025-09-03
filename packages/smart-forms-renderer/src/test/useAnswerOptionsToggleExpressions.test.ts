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

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';
import useAnswerOptionsToggleExpressions, {
  generateCodingKey,
  generateOptionKey,
  hasMapChanged
} from '../hooks/useAnswerOptionsToggleExpressions';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';

// Mock the store
jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      answerOptionsToggleExpressions: () => mockAnswerOptionsToggleExpressions
    }
  }
}));

let mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {};

describe('hasMapChanged', () => {
  it('returns false when maps are equal', () => {
    const map1 = new Map([
      ['a', true],
      ['b', false]
    ]);
    const map2 = new Map([
      ['a', true],
      ['b', false]
    ]);

    expect(hasMapChanged(map1, map2)).toBe(false);
  });

  it('returns true when maps have different sizes', () => {
    const map1 = new Map([['a', true]]);
    const map2 = new Map([
      ['a', true],
      ['b', false]
    ]);

    expect(hasMapChanged(map1, map2)).toBe(true);
  });

  it('returns true when values differ for the same key', () => {
    const map1 = new Map([['a', true]]);
    const map2 = new Map([['a', false]]);

    expect(hasMapChanged(map1, map2)).toBe(true);
  });

  it('returns true when keys differ', () => {
    const map1 = new Map([['a', true]]);
    const map2 = new Map([['b', true]]);

    expect(hasMapChanged(map1, map2)).toBe(true);
  });

  it('returns false for two empty maps', () => {
    expect(hasMapChanged(new Map(), new Map())).toBe(false);
  });
});

describe('generateOptionKey', () => {
  it('generates key for valueCoding', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: {
        system: 'http://loinc.org',
        code: '1234-5',
        display: 'Example'
      }
    };

    expect(generateOptionKey(option)).toBe('coding:http://loinc.org-1234-5-Example');
  });

  it('uses placeholders when valueCoding fields are missing', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: {}
    };

    expect(generateOptionKey(option)).toBe('coding: - - ');
  });

  it('generates key for valueString', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueString: 'Option A'
    };

    expect(generateOptionKey(option)).toBe('string:Option A');
  });

  it('generates key for valueInteger', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueInteger: 42
    };

    expect(generateOptionKey(option)).toBe('integer:42');
  });

  it('returns empty string for unknown value types', () => {
    const option: QuestionnaireItemAnswerOption = {};

    expect(generateOptionKey(option)).toBe('');
  });
});

describe('generateCodingKey', () => {
  it('generates key from full Coding', () => {
    const coding: Coding = {
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Example display'
    };

    expect(generateCodingKey(coding)).toBe('coding:http://loinc.org-1234-5-Example display');
  });

  it('uses space placeholder when fields are missing', () => {
    const coding: Coding = {};
    expect(generateCodingKey(coding)).toBe('coding: - - ');
  });

  it('handles partially missing fields', () => {
    const coding: Coding = {
      system: 'http://snomed.info/sct'
    };
    expect(generateCodingKey(coding)).toBe('coding:http://snomed.info/sct- - ');
  });
});

describe('useAnswerOptionsToggleExpressions hook', () => {
  beforeEach(() => {
    mockAnswerOptionsToggleExpressions = {};
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('when no toggle expressions exist for linkId', () => {
    it('should return empty map and false updated status', () => {
      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(0);
      expect(result.current.answerOptionsToggleExpUpdated).toBe(false);
    });
  });

  describe('when toggle expressions exist for linkId', () => {
    it('should process single toggle expression with enabled options', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [
        { valueCoding: { system: 'http://test.com', code: 'A', display: 'Option A' } },
        { valueString: 'Option B' }
      ];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: true
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(2);
      expect(
        result.current.answerOptionsToggleExpressionsMap.get('coding:http://test.com-A-Option A')
      ).toBe(true);
      expect(result.current.answerOptionsToggleExpressionsMap.get('string:Option B')).toBe(true);
    });

    it('should process toggle expression with disabled options', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [
        { valueCoding: { system: 'http://test.com', code: 'A', display: 'Option A' } }
      ];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: false
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(1);
      expect(
        result.current.answerOptionsToggleExpressionsMap.get('coding:http://test.com-A-Option A')
      ).toBe(false);
    });

    it('should process toggle expression with undefined isEnabled (default to disabled)', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: undefined
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.get('string:Option A')).toBe(false);
    });

    it('should process multiple toggle expressions', () => {
      const mockOptions1: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];
      const mockOptions2: QuestionnaireItemAnswerOption[] = [{ valueInteger: 1 }];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression-1', language: 'text/fhirpath' },
            options: mockOptions1,
            isEnabled: true
          },
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression-2', language: 'text/fhirpath' },
            options: mockOptions2,
            isEnabled: false
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(2);
      expect(result.current.answerOptionsToggleExpressionsMap.get('string:Option A')).toBe(true);
      expect(result.current.answerOptionsToggleExpressionsMap.get('integer:1')).toBe(false);
    });

    it('should handle options with missing valueCoding fields', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [
        { valueCoding: {} } // Missing system, code, display
      ];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: true
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(1);
      expect(result.current.answerOptionsToggleExpressionsMap.get('coding: - - ')).toBe(true);
    });
  });

  describe('useEffect behavior and updated status', () => {
    it('should not set updated status when map is empty', () => {
      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpUpdated).toBe(false);

      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(result.current.answerOptionsToggleExpUpdated).toBe(false);
    });

    it('should set updated status to true and then false after timeout when map has content', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: true
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.answerOptionsToggleExpUpdated).toBe(false);
    });

    it('should trigger useEffect when map changes', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];

      // Start with no expressions
      const { result, rerender } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpUpdated).toBe(false);

      // Add expressions
      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: true
          }
        ]
      };

      rerender();

      expect(result.current.answerOptionsToggleExpUpdated).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.answerOptionsToggleExpUpdated).toBe(false);
    });

    it('should clean up timeout on unmount', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: true
          }
        ]
      };

      const { result, unmount } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpUpdated).toBe(true);

      // Unmount before timeout completes
      unmount();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should not cause any issues after unmount
    });
  });

  describe('map change detection', () => {
    it('should detect when options change from enabled to disabled', () => {
      const mockOptions: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];

      // Start with enabled
      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: true
          }
        ]
      };

      const { result, rerender } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.get('string:Option A')).toBe(true);

      // Change to disabled
      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: mockOptions,
            isEnabled: false
          }
        ]
      };

      rerender();

      expect(result.current.answerOptionsToggleExpressionsMap.get('string:Option A')).toBe(false);
      expect(result.current.answerOptionsToggleExpUpdated).toBe(true);
    });

    it('should detect when new options are added', () => {
      const initialOptions: QuestionnaireItemAnswerOption[] = [{ valueString: 'Option A' }];

      // Start with one option
      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: initialOptions,
            isEnabled: true
          }
        ]
      };

      const { result, rerender } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(1);

      // Add another option
      const expandedOptions: QuestionnaireItemAnswerOption[] = [
        { valueString: 'Option A' },
        { valueString: 'Option B' }
      ];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: expandedOptions,
            isEnabled: true
          }
        ]
      };

      rerender();

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(2);
      expect(result.current.answerOptionsToggleExpressionsMap.get('string:Option B')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty options array', () => {
      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: [],
            isEnabled: true
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(0);
    });

    it('should handle options with no valid value properties', () => {
      const invalidOptions: QuestionnaireItemAnswerOption[] = [
        {} // No value properties
      ];

      mockAnswerOptionsToggleExpressions = {
        'test-item': [
          {
            linkId: 'test-item',
            valueExpression: { expression: 'test-expression', language: 'text/fhirpath' },
            options: invalidOptions,
            isEnabled: true
          }
        ]
      };

      const { result } = renderHook(() => useAnswerOptionsToggleExpressions('test-item'));

      expect(result.current.answerOptionsToggleExpressionsMap.size).toBe(1);
      expect(result.current.answerOptionsToggleExpressionsMap.get('')).toBe(true);
    });

    it('should handle different linkIds correctly', () => {
      mockAnswerOptionsToggleExpressions = {
        'item-1': [
          {
            linkId: 'item-1',
            valueExpression: { expression: 'test-expression-1', language: 'text/fhirpath' },
            options: [{ valueString: 'Option A' }],
            isEnabled: true
          }
        ],
        'item-2': [
          {
            linkId: 'item-2',
            valueExpression: { expression: 'test-expression-2', language: 'text/fhirpath' },
            options: [{ valueString: 'Option B' }],
            isEnabled: false
          }
        ]
      };

      const { result: result1 } = renderHook(() => useAnswerOptionsToggleExpressions('item-1'));
      const { result: result2 } = renderHook(() => useAnswerOptionsToggleExpressions('item-2'));

      expect(result1.current.answerOptionsToggleExpressionsMap.get('string:Option A')).toBe(true);
      expect(result2.current.answerOptionsToggleExpressionsMap.get('string:Option B')).toBe(false);
    });
  });
});
