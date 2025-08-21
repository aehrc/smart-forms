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
import useShowQuestionnaireResponseStoreProperty from '../useShowQuestionnaireResponseStoreProperty';

// Mock the questionnaire response store from smart-forms-renderer
jest.mock('@aehrc/smart-forms-renderer', () => ({
  useQuestionnaireResponseStore: {
    use: {
      key: jest.fn(),
      sourceResponse: jest.fn(),
      updatableResponse: jest.fn(),
      updatableResponseItems: jest.fn(),
      formChangesHistory: jest.fn(),
      invalidItems: jest.fn(),
      responseIsValid: jest.fn()
    }
  }
}));

import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';

describe('useShowQuestionnaireResponseStoreProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock return values
    const mockKey = 'test-key';
    const mockSourceResponse = { id: 'source-123' };
    const mockUpdatableResponse = { id: 'updatable-123' };
    const mockUpdatableResponseItems = { item1: 'value1' };
    const mockFormChangesHistory = [{ change: 'test' }];
    const mockInvalidItems = ['item1', 'item2'];
    const mockResponseIsValid = true;

    (useQuestionnaireResponseStore.use.key as jest.Mock).mockReturnValue(mockKey);
    (useQuestionnaireResponseStore.use.sourceResponse as jest.Mock).mockReturnValue(
      mockSourceResponse
    );
    (useQuestionnaireResponseStore.use.updatableResponse as jest.Mock).mockReturnValue(
      mockUpdatableResponse
    );
    (useQuestionnaireResponseStore.use.updatableResponseItems as jest.Mock).mockReturnValue(
      mockUpdatableResponseItems
    );
    (useQuestionnaireResponseStore.use.formChangesHistory as jest.Mock).mockReturnValue(
      mockFormChangesHistory
    );
    (useQuestionnaireResponseStore.use.invalidItems as jest.Mock).mockReturnValue(mockInvalidItems);
    (useQuestionnaireResponseStore.use.responseIsValid as jest.Mock).mockReturnValue(
      mockResponseIsValid
    );
  });

  it('returns key when selectedProperty is "key"', () => {
    const { result } = renderHook(() => useShowQuestionnaireResponseStoreProperty('key'));

    expect(result.current).toBe('test-key');
    expect(useQuestionnaireResponseStore.use.key).toHaveBeenCalled();
  });

  it('returns sourceResponse when selectedProperty is "sourceResponse"', () => {
    const { result } = renderHook(() =>
      useShowQuestionnaireResponseStoreProperty('sourceResponse')
    );

    expect(result.current).toEqual({ id: 'source-123' });
    expect(useQuestionnaireResponseStore.use.sourceResponse).toHaveBeenCalled();
  });

  it('returns updatableResponse when selectedProperty is "updatableResponse"', () => {
    const { result } = renderHook(() =>
      useShowQuestionnaireResponseStoreProperty('updatableResponse')
    );

    expect(result.current).toEqual({ id: 'updatable-123' });
    expect(useQuestionnaireResponseStore.use.updatableResponse).toHaveBeenCalled();
  });

  it('returns updatableResponseItems when selectedProperty is "updatableResponseItems"', () => {
    const { result } = renderHook(() =>
      useShowQuestionnaireResponseStoreProperty('updatableResponseItems')
    );

    expect(result.current).toEqual({ item1: 'value1' });
    expect(useQuestionnaireResponseStore.use.updatableResponseItems).toHaveBeenCalled();
  });

  it('returns formChangesHistory when selectedProperty is "formChangesHistory"', () => {
    const { result } = renderHook(() =>
      useShowQuestionnaireResponseStoreProperty('formChangesHistory')
    );

    expect(result.current).toEqual([{ change: 'test' }]);
    expect(useQuestionnaireResponseStore.use.formChangesHistory).toHaveBeenCalled();
  });

  it('returns invalidItems when selectedProperty is "invalidItems"', () => {
    const { result } = renderHook(() => useShowQuestionnaireResponseStoreProperty('invalidItems'));

    expect(result.current).toEqual(['item1', 'item2']);
    expect(useQuestionnaireResponseStore.use.invalidItems).toHaveBeenCalled();
  });

  it('returns responseIsValid when selectedProperty is "responseIsValid"', () => {
    const { result } = renderHook(() =>
      useShowQuestionnaireResponseStoreProperty('responseIsValid')
    );

    expect(result.current).toBe(true);
    expect(useQuestionnaireResponseStore.use.responseIsValid).toHaveBeenCalled();
  });

  it('returns null when selectedProperty is not valid', () => {
    const { result } = renderHook(() =>
      useShowQuestionnaireResponseStoreProperty('invalidProperty')
    );

    expect(result.current).toBeNull();
  });

  it('returns null when selectedProperty is empty string', () => {
    const { result } = renderHook(() => useShowQuestionnaireResponseStoreProperty(''));

    expect(result.current).toBeNull();
  });

  it('calls all store methods regardless of selected property', () => {
    renderHook(() => useShowQuestionnaireResponseStoreProperty('key'));

    expect(useQuestionnaireResponseStore.use.key).toHaveBeenCalled();
    expect(useQuestionnaireResponseStore.use.sourceResponse).toHaveBeenCalled();
    expect(useQuestionnaireResponseStore.use.updatableResponse).toHaveBeenCalled();
    expect(useQuestionnaireResponseStore.use.updatableResponseItems).toHaveBeenCalled();
    expect(useQuestionnaireResponseStore.use.formChangesHistory).toHaveBeenCalled();
    expect(useQuestionnaireResponseStore.use.invalidItems).toHaveBeenCalled();
    expect(useQuestionnaireResponseStore.use.responseIsValid).toHaveBeenCalled();
  });

  it('handles undefined values from store', () => {
    (useQuestionnaireResponseStore.use.key as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useShowQuestionnaireResponseStoreProperty('key'));

    expect(result.current).toBeUndefined();
  });
});
