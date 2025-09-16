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
import { useLocation } from 'react-router-dom';
import useBackToTop from '../hooks/useBackToTop';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn()
}));

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true
});

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('useBackToTop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scrolls to top when hook is called', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/test-path',
      search: '',
      hash: '',
      state: null,
      key: 'test-key'
    });

    renderHook(() => useBackToTop());

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('scrolls to top when pathname changes', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/initial-path',
      search: '',
      hash: '',
      state: null,
      key: 'initial-key'
    });

    const { rerender } = renderHook(() => useBackToTop());

    // Clear the initial render call
    mockScrollTo.mockClear();

    // Change pathname
    mockUseLocation.mockReturnValue({
      pathname: '/new-path',
      search: '',
      hash: '',
      state: null,
      key: 'new-key'
    });

    rerender();

    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it('does not scroll when pathname stays the same', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/same-path',
      search: '',
      hash: '',
      state: null,
      key: 'same-key'
    });

    const { rerender } = renderHook(() => useBackToTop());

    // Clear the initial call
    mockScrollTo.mockClear();

    // Rerender with same pathname
    rerender();

    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});
