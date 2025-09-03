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
import type { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import useInitialiseRepeatAnswers from '../hooks/useInitialiseRepeatAnswers';

// Mock the repeatId utility functions
const mockGenerateNewRepeatId = jest.fn();
const mockGenerateExistingRepeatId = jest.fn();

jest.mock('../utils/repeatId', () => ({
  generateNewRepeatId: (...args: any[]) => mockGenerateNewRepeatId(...args),
  generateExistingRepeatId: (...args: any[]) => mockGenerateExistingRepeatId(...args)
}));

describe('useInitialiseRepeatAnswers', () => {
  // Test data
  const mockLinkId = 'repeat-answer-link';

  const mockAnswer1: QuestionnaireResponseItemAnswer = {
    valueString: 'Answer 1'
  };

  const mockAnswer2: QuestionnaireResponseItemAnswer = {
    valueInteger: 42
  };

  const mockAnswer3: QuestionnaireResponseItemAnswer = {
    valueCoding: {
      system: 'http://example.com',
      code: 'test-code',
      display: 'Test Code'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateNewRepeatId.mockReturnValue('repeat-answer-link-repeat-newXYZ');
    mockGenerateExistingRepeatId.mockImplementation(
      (linkId: string, index: number) => `${linkId}-repeat-${index.toString().padStart(6, '0')}`
    );
  });

  describe('null qrItem input', () => {
    it('should return single answer with new repeat ID when qrItem is null', () => {
      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, null));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'repeat-answer-link-repeat-newXYZ'
      });

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
      expect(mockGenerateExistingRepeatId).not.toHaveBeenCalled();
    });

    it('should call generateNewRepeatId with correct linkId', () => {
      const customLinkId = 'custom-answer-link';
      renderHook(() => useInitialiseRepeatAnswers(customLinkId, null));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(customLinkId);
    });
  });

  describe('qrItem without answers', () => {
    it('should return single answer with new repeat ID when qrItem has no answer property', () => {
      const qrItemWithoutAnswers: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item'
      };

      const { result } = renderHook(() =>
        useInitialiseRepeatAnswers(mockLinkId, qrItemWithoutAnswers)
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'repeat-answer-link-repeat-newXYZ'
      });

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
      expect(mockGenerateExistingRepeatId).not.toHaveBeenCalled();
    });

    it('should return empty array when qrItem has empty answer array', () => {
      const qrItemWithEmptyAnswers: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: []
      };

      const { result } = renderHook(() =>
        useInitialiseRepeatAnswers(mockLinkId, qrItemWithEmptyAnswers)
      );

      expect(result.current).toHaveLength(0);

      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
      expect(mockGenerateExistingRepeatId).not.toHaveBeenCalled();
    });

    it('should return single answer with new repeat ID when qrItem has undefined answer', () => {
      const qrItemWithUndefinedAnswers: QuestionnaireResponseItem = {
        linkId: 'test-item',
        text: 'Test Item',
        answer: undefined
      };

      const { result } = renderHook(() =>
        useInitialiseRepeatAnswers(mockLinkId, qrItemWithUndefinedAnswers)
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'repeat-answer-link-repeat-newXYZ'
      });

      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
    });
  });

  describe('single answer', () => {
    it('should return single answer with existing repeat ID when one answer provided', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        ...mockAnswer1,
        id: 'repeat-answer-link-repeat-000000'
      });

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 0);
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should preserve existing id if answer already has one', () => {
      const answerWithId: QuestionnaireResponseItemAnswer = {
        valueString: 'Answer with ID',
        id: 'existing-answer-id'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [answerWithId]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        valueString: 'Answer with ID',
        id: 'existing-answer-id'
      });

      expect(mockGenerateExistingRepeatId).not.toHaveBeenCalled();
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should preserve all properties of the answer', () => {
      const complexAnswer: QuestionnaireResponseItemAnswer = {
        valueString: 'Complex Answer',
        extension: [
          {
            url: 'http://example.com/extension',
            valueString: 'extension value'
          }
        ]
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [complexAnswer]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        ...complexAnswer,
        id: 'repeat-answer-link-repeat-000000'
      });
    });
  });

  describe('multiple answers', () => {
    it('should return multiple answers with correct indices when multiple answers provided', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1, mockAnswer2, mockAnswer3]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current).toHaveLength(3);

      expect(result.current[0]).toEqual({
        ...mockAnswer1,
        id: 'repeat-answer-link-repeat-000000'
      });

      expect(result.current[1]).toEqual({
        ...mockAnswer2,
        id: 'repeat-answer-link-repeat-000001'
      });

      expect(result.current[2]).toEqual({
        ...mockAnswer3,
        id: 'repeat-answer-link-repeat-000002'
      });

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 0);
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 1);
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 2);
      expect(mockGenerateNewRepeatId).not.toHaveBeenCalled();
    });

    it('should handle mix of answers with and without existing ids', () => {
      const answerWithId: QuestionnaireResponseItemAnswer = {
        valueString: 'Answer with ID',
        id: 'existing-id-1'
      };

      const answerWithoutId: QuestionnaireResponseItemAnswer = {
        valueInteger: 100
      };

      const anotherAnswerWithId: QuestionnaireResponseItemAnswer = {
        valueBoolean: true,
        id: 'existing-id-2'
      };

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [answerWithId, answerWithoutId, anotherAnswerWithId]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current).toHaveLength(3);

      expect(result.current[0]).toEqual({
        valueString: 'Answer with ID',
        id: 'existing-id-1'
      });

      expect(result.current[1]).toEqual({
        valueInteger: 100,
        id: 'repeat-answer-link-repeat-000001'
      });

      expect(result.current[2]).toEqual({
        valueBoolean: true,
        id: 'existing-id-2'
      });

      // Should only generate ID for the answer without one
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledTimes(1);
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, 1);
    });

    it('should handle large number of answers with correct indexing', () => {
      const answers = Array.from({ length: 20 }, (_, i) => ({
        valueString: `Answer ${i}`
      }));

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: answers
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current).toHaveLength(20);

      // Check first, middle, and last items
      expect(result.current[0]?.id).toBe('repeat-answer-link-repeat-000000');
      expect(result.current[10]?.id).toBe('repeat-answer-link-repeat-000010');
      expect(result.current[19]?.id).toBe('repeat-answer-link-repeat-000019');

      // Verify all items have correct content
      result.current.forEach((answer, index) => {
        expect(answer?.valueString).toBe(`Answer ${index}`);
      });

      // Verify all generateExistingRepeatId calls
      for (let i = 0; i < 20; i++) {
        expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith(mockLinkId, i);
      }
    });
  });

  describe('memoization behavior', () => {
    it('should return same result object when inputs do not change', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };

      const { result, rerender } = renderHook(
        ({ linkId, item }) => useInitialiseRepeatAnswers(linkId, item),
        { initialProps: { linkId: mockLinkId, item: qrItem } }
      );

      const firstResult = result.current;

      // Re-render with same props
      rerender({ linkId: mockLinkId, item: qrItem });

      expect(result.current).toBe(firstResult); // Reference equality
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledTimes(1); // Called only once
    });

    it('should recompute when linkId changes', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };

      const { result, rerender } = renderHook(
        ({ linkId, item }) => useInitialiseRepeatAnswers(linkId, item),
        { initialProps: { linkId: mockLinkId, item: qrItem } }
      );

      const firstResult = result.current;

      // Change linkId
      rerender({ linkId: 'new-answer-link', item: qrItem });

      expect(result.current).not.toBe(firstResult);
      expect(result.current[0]?.id).toBe('new-answer-link-repeat-000000');
      expect(mockGenerateExistingRepeatId).toHaveBeenCalledWith('new-answer-link', 0);
    });

    it('should recompute when qrItem changes', () => {
      const qrItem1: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };

      const qrItem2: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer2]
      };

      const { result, rerender } = renderHook(
        ({ linkId, item }) => useInitialiseRepeatAnswers(linkId, item),
        { initialProps: { linkId: mockLinkId, item: qrItem1 } }
      );

      const firstResult = result.current;

      // Change qrItem
      rerender({ linkId: mockLinkId, item: qrItem2 });

      expect(result.current).not.toBe(firstResult);
      expect(result.current[0]?.valueString).toBeUndefined();
      expect(result.current[0]?.valueInteger).toBe(42);
    });

    it('should recompute when switching from null to qrItem with answers', () => {
      const { result, rerender } = renderHook(
        ({ linkId, item }: { linkId: string; item: QuestionnaireResponseItem | null }) =>
          useInitialiseRepeatAnswers(linkId, item),
        { initialProps: { linkId: mockLinkId, item: null as QuestionnaireResponseItem | null } }
      );

      const firstResult = result.current;
      expect(firstResult[0]).toEqual({ id: 'repeat-answer-link-repeat-newXYZ' });

      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };

      // Change from null to qrItem with answers
      rerender({ linkId: mockLinkId, item: qrItem });

      expect(result.current).not.toBe(firstResult);
      expect(result.current[0]).toEqual({
        ...mockAnswer1,
        id: 'repeat-answer-link-repeat-000000'
      });
    });
  });

  describe('answer value types', () => {
    it('should handle string values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [{ valueString: 'test string' }]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueString: 'test string',
        id: 'repeat-answer-link-repeat-000000'
      });
    });

    it('should handle integer values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [{ valueInteger: 123 }]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueInteger: 123,
        id: 'repeat-answer-link-repeat-000000'
      });
    });

    it('should handle boolean values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [{ valueBoolean: false }]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueBoolean: false,
        id: 'repeat-answer-link-repeat-000000'
      });
    });

    it('should handle date values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [{ valueDate: '2024-01-01' }]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueDate: '2024-01-01',
        id: 'repeat-answer-link-repeat-000000'
      });
    });

    it('should handle decimal values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [{ valueDecimal: 3.14159 }]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueDecimal: 3.14159,
        id: 'repeat-answer-link-repeat-000000'
      });
    });

    it('should handle coding values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [
          {
            valueCoding: {
              system: 'http://snomed.info/sct',
              code: '12345',
              display: 'Test Condition'
            }
          }
        ]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '12345',
          display: 'Test Condition'
        },
        id: 'repeat-answer-link-repeat-000000'
      });
    });

    it('should handle quantity values', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [
          {
            valueQuantity: {
              value: 70,
              unit: 'kg',
              system: 'http://unitsofmeasure.org',
              code: 'kg'
            }
          }
        ]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result.current[0]).toEqual({
        valueQuantity: {
          value: 70,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        },
        id: 'repeat-answer-link-repeat-000000'
      });
    });
  });

  describe('integration with repeatId utilities', () => {
    it('should call generateNewRepeatId exactly once for null qrItem', () => {
      renderHook(() => useInitialiseRepeatAnswers(mockLinkId, null));

      expect(mockGenerateNewRepeatId).toHaveBeenCalledTimes(1);
      expect(mockGenerateNewRepeatId).toHaveBeenCalledWith(mockLinkId);
    });

    it('should call generateExistingRepeatId for each answer without existing id', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1, mockAnswer2]
      };

      renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(mockGenerateExistingRepeatId).toHaveBeenCalledTimes(2);
      expect(mockGenerateExistingRepeatId).toHaveBeenNthCalledWith(1, mockLinkId, 0);
      expect(mockGenerateExistingRepeatId).toHaveBeenNthCalledWith(2, mockLinkId, 1);
    });

    it('should handle custom repeat ID formats from utility functions', () => {
      mockGenerateNewRepeatId.mockReturnValue('custom-new-answer-id');
      mockGenerateExistingRepeatId.mockReturnValue('custom-existing-answer-id');

      const { result: result1 } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, null));
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };
      const { result: result2 } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(result1.current[0]?.id).toBe('custom-new-answer-id');
      expect(result2.current[0]?.id).toBe('custom-existing-answer-id');
    });
  });

  describe('return value structure', () => {
    it('should return array of answer objects with id property for null qrItem', () => {
      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, null));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current[0]).toHaveProperty('id');
      expect(typeof result.current[0]?.id).toBe('string');
      expect(Object.keys(result.current[0] || {})).toEqual(['id']);
    });

    it('should return array of answer objects with preserved properties and id', () => {
      const qrItem: QuestionnaireResponseItem = {
        linkId: 'test-item',
        answer: [mockAnswer1]
      };

      const { result } = renderHook(() => useInitialiseRepeatAnswers(mockLinkId, qrItem));

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current[0]).toHaveProperty('id');
      expect(result.current[0]).toHaveProperty('valueString');
      expect(typeof result.current[0]?.id).toBe('string');
      expect(result.current[0]?.valueString).toBe('Answer 1');
    });
  });
});
