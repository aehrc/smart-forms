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
import useShowQuestionnaireStoreProperty from '../useShowQuestionnaireStoreProperty';

// Mock the questionnaire store from smart-forms-renderer
jest.mock('@aehrc/smart-forms-renderer', () => ({
  useQuestionnaireStore: {
    use: {
      sourceQuestionnaire: jest.fn(),
      itemMap: jest.fn(),
      itemPreferredTerminologyServers: jest.fn(),
      tabs: jest.fn(),
      currentTabIndex: jest.fn(),
      pages: jest.fn(),
      currentPageIndex: jest.fn(),
      variables: jest.fn(),
      launchContexts: jest.fn(),
      targetConstraints: jest.fn(),
      targetConstraintLinkIds: jest.fn(),
      answerOptionsToggleExpressions: jest.fn(),
      enableWhenItems: jest.fn(),
      enableWhenLinkedQuestions: jest.fn(),
      enableWhenIsActivated: jest.fn(),
      enableWhenExpressions: jest.fn(),
      calculatedExpressions: jest.fn(),
      initialExpressions: jest.fn(),
      answerExpressions: jest.fn(),
      processedValueSets: jest.fn(),
      cachedValueSetCodings: jest.fn(),
      fhirPathContext: jest.fn(),
      fhirPathTerminologyCache: jest.fn(),
      populatedContext: jest.fn(),
      qItemOverrideComponents: jest.fn(),
      sdcUiOverrideComponents: jest.fn(),
      focusedLinkId: jest.fn(),
      readOnly: jest.fn()
    }
  }
}));

import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';

describe('useShowQuestionnaireStoreProperty', () => {
  const mockValues = {
    sourceQuestionnaire: { id: 'q-123', resourceType: 'Questionnaire' },
    itemMap: { 'item-1': 'value1' },
    itemPreferredTerminologyServers: { 'item-1': 'server1' },
    tabs: [{ title: 'Tab 1' }],
    currentTabIndex: 0,
    pages: [{ title: 'Page 1' }],
    currentPageIndex: 0,
    variables: { var1: 'value1' },
    launchContexts: { patient: 'patient-123' },
    targetConstraints: [{ constraint: 'test' }],
    targetConstraintLinkIds: ['link-1'],
    answerOptionsToggleExpressions: { toggle: 'expr' },
    enableWhenItems: { when: 'item' },
    enableWhenLinkedQuestions: { linked: 'question' },
    enableWhenIsActivated: true,
    enableWhenExpressions: { expr: 'enable' },
    calculatedExpressions: { calc: 'expr' },
    initialExpressions: { init: 'expr' },
    answerExpressions: { answer: 'expr' },
    processedValueSets: { vs: 'processed' },
    cachedValueSetCodings: { cache: 'coding' },
    fhirPathContext: { context: 'fhir' },
    fhirPathTerminologyCache: { term: 'cache' },
    populatedContext: { populated: 'context' },
    qItemOverrideComponents: { override: 'component' },
    sdcUiOverrideComponents: { ui: 'override' },
    focusedLinkId: 'focused-link',
    readOnly: false
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup all mock return values
    Object.entries(mockValues).forEach(([key, value]) => {
      (
        useQuestionnaireStore.use[key as keyof typeof useQuestionnaireStore.use] as jest.Mock
      ).mockReturnValue(value);
    });
  });

  // Test each property individually
  Object.keys(mockValues).forEach((property) => {
    it(`returns ${property} when selectedProperty is "${property}"`, () => {
      const { result } = renderHook(() => useShowQuestionnaireStoreProperty(property));

      expect(result.current).toEqual(mockValues[property as keyof typeof mockValues]);
      expect(
        useQuestionnaireStore.use[property as keyof typeof useQuestionnaireStore.use]
      ).toHaveBeenCalled();
    });
  });

  it('returns null when selectedProperty is not valid', () => {
    const { result } = renderHook(() => useShowQuestionnaireStoreProperty('invalidProperty'));

    expect(result.current).toBeNull();
  });

  it('returns null when selectedProperty is empty string', () => {
    const { result } = renderHook(() => useShowQuestionnaireStoreProperty(''));

    expect(result.current).toBeNull();
  });

  it('calls all store methods regardless of selected property', () => {
    renderHook(() => useShowQuestionnaireStoreProperty('sourceQuestionnaire'));

    // Verify all methods are called
    Object.keys(mockValues).forEach((key) => {
      expect(
        useQuestionnaireStore.use[key as keyof typeof useQuestionnaireStore.use]
      ).toHaveBeenCalled();
    });
  });

  it('handles undefined values from store', () => {
    (useQuestionnaireStore.use.sourceQuestionnaire as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useShowQuestionnaireStoreProperty('sourceQuestionnaire'));

    expect(result.current).toBeUndefined();
  });

  it('returns correct property when property is at the beginning of valueMap', () => {
    const { result } = renderHook(() => useShowQuestionnaireStoreProperty('sourceQuestionnaire'));

    expect(result.current).toEqual(mockValues.sourceQuestionnaire);
  });

  it('returns correct property when property is at the end of valueMap', () => {
    const { result } = renderHook(() => useShowQuestionnaireStoreProperty('readOnly'));

    expect(result.current).toEqual(mockValues.readOnly);
  });

  it('returns correct property when property is in the middle of valueMap', () => {
    const { result } = renderHook(() => useShowQuestionnaireStoreProperty('variables'));

    expect(result.current).toEqual(mockValues.variables);
  });
});
