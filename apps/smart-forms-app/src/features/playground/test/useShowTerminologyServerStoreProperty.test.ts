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
import useShowTerminologyServerStoreProperty from '../hooks/useShowTerminologyServerStoreProperty';

// Mock the smart-forms-renderer hook
jest.mock('@aehrc/smart-forms-renderer', () => ({
  useTerminologyServerStore: {
    use: {
      url: jest.fn()
    }
  }
}));

import { useTerminologyServerStore } from '@aehrc/smart-forms-renderer';

describe('useShowTerminologyServerStoreProperty', () => {
  const mockUrl = 'https://tx.fhir.org/r4';

  beforeEach(() => {
    jest.clearAllMocks();
    (useTerminologyServerStore.use.url as jest.Mock).mockReturnValue(mockUrl);
  });

  it('returns url when selectedProperty is "url"', () => {
    const { result } = renderHook(() => useShowTerminologyServerStoreProperty('url'));

    expect(result.current).toEqual(mockUrl);
    expect(useTerminologyServerStore.use.url).toHaveBeenCalled();
  });

  it('returns null when selectedProperty is not valid', () => {
    const { result } = renderHook(() => useShowTerminologyServerStoreProperty('invalid'));

    expect(result.current).toBeNull();
  });

  it('returns null when selectedProperty is empty string', () => {
    const { result } = renderHook(() => useShowTerminologyServerStoreProperty(''));

    expect(result.current).toBeNull();
  });

  it('returns null when selectedProperty is not "url"', () => {
    const { result } = renderHook(() => useShowTerminologyServerStoreProperty('other'));

    expect(result.current).toBeNull();
  });

  it('calls url method regardless of selected property', () => {
    renderHook(() => useShowTerminologyServerStoreProperty('url'));

    expect(useTerminologyServerStore.use.url).toHaveBeenCalled();
  });

  it('handles undefined url value', () => {
    (useTerminologyServerStore.use.url as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useShowTerminologyServerStoreProperty('url'));

    expect(result.current).toBeUndefined();
  });
});
