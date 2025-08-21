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
import useShowExtractDebuggerStoreProperty from '../useShowExtractDebuggerStoreProperty';

// Mock the extract debugger store
jest.mock('../../stores/extractDebuggerStore', () => ({
  useExtractDebuggerStore: {
    use: {
      observationExtractResult: jest.fn(),
      templateExtractResult: jest.fn(),
      templateExtractDebugInfo: jest.fn(),
      templateExtractIssues: jest.fn()
    }
  }
}));

import { useExtractDebuggerStore } from '../../stores/extractDebuggerStore';

describe('useShowExtractDebuggerStoreProperty', () => {
  const mockObservationResult = { resourceType: 'Bundle', entry: [] };
  const mockTemplateResult = { resourceType: 'Bundle', entry: [] };
  const mockDebugInfo = { extractedItems: [] };
  const mockIssues = [{ severity: 'error', message: 'Test issue' }];

  beforeEach(() => {
    jest.clearAllMocks();

    (useExtractDebuggerStore.use.observationExtractResult as jest.Mock).mockReturnValue(
      mockObservationResult
    );
    (useExtractDebuggerStore.use.templateExtractResult as jest.Mock).mockReturnValue(
      mockTemplateResult
    );
    (useExtractDebuggerStore.use.templateExtractDebugInfo as jest.Mock).mockReturnValue(
      mockDebugInfo
    );
    (useExtractDebuggerStore.use.templateExtractIssues as jest.Mock).mockReturnValue(mockIssues);
  });

  it('returns observationExtractResult when selectedProperty is "observationExtractResult"', () => {
    const { result } = renderHook(() =>
      useShowExtractDebuggerStoreProperty('observationExtractResult')
    );

    expect(result.current).toEqual(mockObservationResult);
    expect(useExtractDebuggerStore.use.observationExtractResult).toHaveBeenCalled();
  });

  it('returns templateExtractResult when selectedProperty is "templateExtractResult"', () => {
    const { result } = renderHook(() =>
      useShowExtractDebuggerStoreProperty('templateExtractResult')
    );

    expect(result.current).toEqual(mockTemplateResult);
    expect(useExtractDebuggerStore.use.templateExtractResult).toHaveBeenCalled();
  });

  it('returns templateExtractDebugInfo when selectedProperty is "templateExtractDebugInfo"', () => {
    const { result } = renderHook(() =>
      useShowExtractDebuggerStoreProperty('templateExtractDebugInfo')
    );

    expect(result.current).toEqual(mockDebugInfo);
    expect(useExtractDebuggerStore.use.templateExtractDebugInfo).toHaveBeenCalled();
  });

  it('returns templateExtractIssues when selectedProperty is "templateExtractIssues"', () => {
    const { result } = renderHook(() =>
      useShowExtractDebuggerStoreProperty('templateExtractIssues')
    );

    expect(result.current).toEqual(mockIssues);
    expect(useExtractDebuggerStore.use.templateExtractIssues).toHaveBeenCalled();
  });

  it('returns null when selectedProperty is not valid', () => {
    const { result } = renderHook(() => useShowExtractDebuggerStoreProperty('invalid'));

    expect(result.current).toBeNull();
  });

  it('returns null when selectedProperty is empty string', () => {
    const { result } = renderHook(() => useShowExtractDebuggerStoreProperty(''));

    expect(result.current).toBeNull();
  });

  it('calls all store methods regardless of selected property', () => {
    renderHook(() => useShowExtractDebuggerStoreProperty('observationExtractResult'));

    expect(useExtractDebuggerStore.use.observationExtractResult).toHaveBeenCalled();
    expect(useExtractDebuggerStore.use.templateExtractResult).toHaveBeenCalled();
    expect(useExtractDebuggerStore.use.templateExtractDebugInfo).toHaveBeenCalled();
    expect(useExtractDebuggerStore.use.templateExtractIssues).toHaveBeenCalled();
  });

  it('handles undefined values from store', () => {
    (useExtractDebuggerStore.use.observationExtractResult as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useShowExtractDebuggerStoreProperty('observationExtractResult')
    );

    expect(result.current).toBeUndefined();
  });
});
