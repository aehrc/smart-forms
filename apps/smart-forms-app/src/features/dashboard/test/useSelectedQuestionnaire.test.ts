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
import { useContext } from 'react';
import useSelectedQuestionnaire from '../hooks/useSelectedQuestionnaire';

// Mock React context
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}));

const mockUseContext = useContext as jest.MockedFunction<typeof useContext>;

describe('useSelectedQuestionnaire', () => {
  const mockSetSelectedQuestionnaire = jest.fn();
  const mockSetExistingResponses = jest.fn();

  const mockContextValue = {
    selectedQuestionnaire: null,
    existingResponses: [],
    setSelectedQuestionnaire: mockSetSelectedQuestionnaire,
    setExistingResponses: mockSetExistingResponses
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseContext.mockReturnValue(mockContextValue);
  });

  it('returns context values and functions', () => {
    const { result } = renderHook(() => useSelectedQuestionnaire());

    expect(result.current.selectedQuestionnaire).toBe(null);
    expect(result.current.existingResponses).toEqual([]);
    expect(result.current.setSelectedQuestionnaire).toBe(mockSetSelectedQuestionnaire);
    expect(result.current.setExistingResponses).toBe(mockSetExistingResponses);
    expect(typeof result.current.clearSelectedQuestionnaire).toBe('function');
  });

  it('returns questionnaire when one is selected', () => {
    const mockQuestionnaire = { resourceType: 'Questionnaire', id: 'test-q' };
    mockUseContext.mockReturnValue({
      ...mockContextValue,
      selectedQuestionnaire: mockQuestionnaire
    });

    const { result } = renderHook(() => useSelectedQuestionnaire());

    expect(result.current.selectedQuestionnaire).toEqual(mockQuestionnaire);
  });

  it('returns existing responses when they exist', () => {
    const mockResponses = [
      { resourceType: 'QuestionnaireResponse', id: 'response-1' },
      { resourceType: 'QuestionnaireResponse', id: 'response-2' }
    ];
    mockUseContext.mockReturnValue({
      ...mockContextValue,
      existingResponses: mockResponses
    });

    const { result } = renderHook(() => useSelectedQuestionnaire());

    expect(result.current.existingResponses).toEqual(mockResponses);
  });

  it('clearSelectedQuestionnaire calls setters with correct values', () => {
    const { result } = renderHook(() => useSelectedQuestionnaire());

    result.current.clearSelectedQuestionnaire();

    expect(mockSetSelectedQuestionnaire).toHaveBeenCalledWith(null);
    expect(mockSetExistingResponses).toHaveBeenCalledWith([]);
    expect(mockSetSelectedQuestionnaire).toHaveBeenCalledTimes(1);
    expect(mockSetExistingResponses).toHaveBeenCalledTimes(1);
  });
});
