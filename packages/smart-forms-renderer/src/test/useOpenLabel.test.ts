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

import { act, renderHook } from '@testing-library/react';
import type { QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import useOpenLabel from '../hooks/useOpenLabel';

// Mock the utility function
const mockGetOldOpenLabelAnswer = jest.fn();

jest.mock('../utils/openChoice', () => ({
  getOldOpenLabelAnswer: (...args: any[]) => mockGetOldOpenLabelAnswer(...args)
}));

describe('useOpenLabel', () => {
  // Test data
  const basicOptions: QuestionnaireItemAnswerOption[] = [
    { valueCoding: { code: 'option1', display: 'Option 1' } },
    { valueCoding: { code: 'option2', display: 'Option 2' } }
  ];

  const emptyOptions: QuestionnaireItemAnswerOption[] = [];

  const basicAnswers: QuestionnaireResponseItemAnswer[] = [{ valueCoding: { code: 'option1' } }];

  const emptyAnswers: QuestionnaireResponseItemAnswer[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOldOpenLabelAnswer.mockReturnValue(null);
  });

  describe('initialization with empty options', () => {
    it('should initialize with empty values when no options provided', () => {
      const { result } = renderHook(() => useOpenLabel(emptyOptions, emptyAnswers));

      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });

    it('should provide setter functions when no options provided', () => {
      const { result } = renderHook(() => useOpenLabel(emptyOptions, emptyAnswers));

      expect(typeof result.current.setOpenLabelValue).toBe('function');
      expect(typeof result.current.setOpenLabelChecked).toBe('function');
    });

    it('should not call getOldOpenLabelAnswer when no options provided', () => {
      renderHook(() => useOpenLabel(emptyOptions, basicAnswers));

      expect(mockGetOldOpenLabelAnswer).not.toHaveBeenCalled();
    });
  });

  describe('initialization with options but no old answer', () => {
    it('should initialize with empty values when no old answer found', () => {
      mockGetOldOpenLabelAnswer.mockReturnValue(null);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });

    it('should call getOldOpenLabelAnswer with correct parameters', () => {
      renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(basicAnswers, basicOptions);
    });

    it('should initialize with empty values when old answer has no valueString', () => {
      const answerWithoutString = { valueCoding: { code: 'test' } };
      mockGetOldOpenLabelAnswer.mockReturnValue(answerWithoutString);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });

    it('should initialize with empty values when old answer has empty valueString', () => {
      const answerWithEmptyString = { valueString: '' };
      mockGetOldOpenLabelAnswer.mockReturnValue(answerWithEmptyString);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });
  });

  describe('initialization with old answer', () => {
    it('should initialize with old answer value when found', () => {
      const oldAnswer = { valueString: 'Custom Answer' };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('Custom Answer');
      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should handle old answer with special characters', () => {
      const oldAnswer = { valueString: 'Special@#$%Answer!' };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('Special@#$%Answer!');
      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should handle old answer with whitespace', () => {
      const oldAnswer = { valueString: '  Whitespace Answer  ' };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('  Whitespace Answer  ');
      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should handle old answer with long text', () => {
      const longText = 'A'.repeat(1000);
      const oldAnswer = { valueString: longText };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe(longText);
      expect(result.current.openLabelChecked).toBe(true);
    });
  });

  describe('openLabelValue state management', () => {
    it('should update openLabelValue when setOpenLabelValue is called', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('');

      act(() => {
        result.current.setOpenLabelValue('New Value');
      });

      expect(result.current.openLabelValue).toBe('New Value');
    });

    it('should handle multiple value updates', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      act(() => {
        result.current.setOpenLabelValue('First Value');
      });
      expect(result.current.openLabelValue).toBe('First Value');

      act(() => {
        result.current.setOpenLabelValue('Second Value');
      });
      expect(result.current.openLabelValue).toBe('Second Value');

      act(() => {
        result.current.setOpenLabelValue('');
      });
      expect(result.current.openLabelValue).toBe('');
    });

    it('should handle functional updates for openLabelValue', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      act(() => {
        result.current.setOpenLabelValue('Initial');
      });

      act(() => {
        result.current.setOpenLabelValue((prev) => prev + ' Updated');
      });

      expect(result.current.openLabelValue).toBe('Initial Updated');
    });
  });

  describe('openLabelChecked state management', () => {
    it('should update openLabelChecked when setOpenLabelChecked is called', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelChecked).toBe(false);

      act(() => {
        result.current.setOpenLabelChecked(true);
      });

      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should toggle openLabelChecked multiple times', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      act(() => {
        result.current.setOpenLabelChecked(true);
      });
      expect(result.current.openLabelChecked).toBe(true);

      act(() => {
        result.current.setOpenLabelChecked(false);
      });
      expect(result.current.openLabelChecked).toBe(false);

      act(() => {
        result.current.setOpenLabelChecked(true);
      });
      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should handle functional updates for openLabelChecked', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      act(() => {
        result.current.setOpenLabelChecked((prev) => !prev);
      });
      expect(result.current.openLabelChecked).toBe(true);

      act(() => {
        result.current.setOpenLabelChecked((prev) => !prev);
      });
      expect(result.current.openLabelChecked).toBe(false);
    });
  });

  describe('independent state updates', () => {
    it('should update openLabelValue without affecting openLabelChecked', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      const originalChecked = result.current.openLabelChecked;

      act(() => {
        result.current.setOpenLabelValue('New Value');
      });

      expect(result.current.openLabelValue).toBe('New Value');
      expect(result.current.openLabelChecked).toBe(originalChecked);
    });

    it('should update openLabelChecked without affecting openLabelValue', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      const originalValue = result.current.openLabelValue;

      act(() => {
        result.current.setOpenLabelChecked(true);
      });

      expect(result.current.openLabelChecked).toBe(true);
      expect(result.current.openLabelValue).toBe(originalValue);
    });

    it('should handle simultaneous updates to both states', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      act(() => {
        result.current.setOpenLabelValue('Simultaneous Value');
        result.current.setOpenLabelChecked(true);
      });

      expect(result.current.openLabelValue).toBe('Simultaneous Value');
      expect(result.current.openLabelChecked).toBe(true);
    });
  });

  describe('different option configurations', () => {
    it('should handle single option', () => {
      const singleOption: QuestionnaireItemAnswerOption[] = [
        { valueCoding: { code: 'only-option', display: 'Only Option' } }
      ];

      const { result } = renderHook(() => useOpenLabel(singleOption, emptyAnswers));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(emptyAnswers, singleOption);
      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });

    it('should handle many options', () => {
      const manyOptions: QuestionnaireItemAnswerOption[] = Array.from({ length: 50 }, (_, i) => ({
        valueCoding: { code: `option-${i}`, display: `Option ${i}` }
      }));

      const { result } = renderHook(() => useOpenLabel(manyOptions, emptyAnswers));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(emptyAnswers, manyOptions);
      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });

    it('should handle options with complex structures', () => {
      const complexOptions: QuestionnaireItemAnswerOption[] = [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '123456',
            display: 'Complex Option',
            version: '2023'
          }
        }
      ];

      const { result } = renderHook(() => useOpenLabel(complexOptions, emptyAnswers));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(emptyAnswers, complexOptions);
      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });
  });

  describe('different answer configurations', () => {
    it('should handle single answer', () => {
      const singleAnswer: QuestionnaireResponseItemAnswer[] = [
        { valueCoding: { code: 'selected-option' } }
      ];

      renderHook(() => useOpenLabel(basicOptions, singleAnswer));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(singleAnswer, basicOptions);
    });

    it('should handle multiple answers', () => {
      const multipleAnswers: QuestionnaireResponseItemAnswer[] = [
        { valueCoding: { code: 'option1' } },
        { valueCoding: { code: 'option2' } },
        { valueString: 'Custom Answer' }
      ];

      renderHook(() => useOpenLabel(basicOptions, multipleAnswers));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(multipleAnswers, basicOptions);
    });

    it('should handle answers with mixed types', () => {
      const mixedAnswers: QuestionnaireResponseItemAnswer[] = [
        { valueCoding: { code: 'coded-answer' } },
        { valueString: 'String Answer' },
        { valueInteger: 42 },
        { valueBoolean: true }
      ];

      renderHook(() => useOpenLabel(basicOptions, mixedAnswers));

      expect(mockGetOldOpenLabelAnswer).toHaveBeenCalledWith(mixedAnswers, basicOptions);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined valueString in old answer', () => {
      const answerWithUndefinedString = { valueString: undefined };
      mockGetOldOpenLabelAnswer.mockReturnValue(answerWithUndefinedString);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);
    });
  });

  describe('real-world usage scenarios', () => {
    it('should simulate open choice selection flow', () => {
      const { result } = renderHook(() => useOpenLabel(basicOptions, emptyAnswers));

      // Initial state - no selection
      expect(result.current.openLabelValue).toBe('');
      expect(result.current.openLabelChecked).toBe(false);

      // User checks the open label option
      act(() => {
        result.current.setOpenLabelChecked(true);
      });

      // User types a custom value
      act(() => {
        result.current.setOpenLabelValue('Custom user input');
      });

      expect(result.current.openLabelValue).toBe('Custom user input');
      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should simulate editing existing open label', () => {
      const oldAnswer = { valueString: 'Existing Custom Answer' };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      // Should initialize with existing value
      expect(result.current.openLabelValue).toBe('Existing Custom Answer');
      expect(result.current.openLabelChecked).toBe(true);

      // User modifies the value
      act(() => {
        result.current.setOpenLabelValue('Modified Answer');
      });

      expect(result.current.openLabelValue).toBe('Modified Answer');
      expect(result.current.openLabelChecked).toBe(true);
    });

    it('should simulate unchecking open label', () => {
      const oldAnswer = { valueString: 'Existing Answer' };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      // Starts checked with value
      expect(result.current.openLabelChecked).toBe(true);

      // User unchecks open label
      act(() => {
        result.current.setOpenLabelChecked(false);
      });

      expect(result.current.openLabelChecked).toBe(false);
      expect(result.current.openLabelValue).toBe('Existing Answer'); // Value preserved
    });

    it('should simulate form reset', () => {
      const oldAnswer = { valueString: 'Original Answer' };
      mockGetOldOpenLabelAnswer.mockReturnValue(oldAnswer);

      const { result } = renderHook(() => useOpenLabel(basicOptions, basicAnswers));

      // User makes changes
      act(() => {
        result.current.setOpenLabelValue('Changed Answer');
        result.current.setOpenLabelChecked(false);
      });

      // Reset to original state
      act(() => {
        result.current.setOpenLabelValue('Original Answer');
        result.current.setOpenLabelChecked(true);
      });

      expect(result.current.openLabelValue).toBe('Original Answer');
      expect(result.current.openLabelChecked).toBe(true);
    });
  });
});
