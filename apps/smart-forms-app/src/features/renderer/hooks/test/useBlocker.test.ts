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
import { useLayoutEffect } from 'react';
import { unstable_useBlocker as useBlocker } from 'react-router-dom';
import useLeavePageBlocker from '../useBlocker';

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useLayoutEffect: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  unstable_useBlocker: jest.fn()
}));

// Mock @aehrc/smart-forms-renderer
jest.mock('@aehrc/smart-forms-renderer', () => ({
  useQuestionnaireResponseStore: {
    use: {
      formChangesHistory: jest.fn()
    }
  }
}));

const mockUseLayoutEffect = useLayoutEffect as jest.MockedFunction<typeof useLayoutEffect>;
const mockUseBlocker = useBlocker as jest.MockedFunction<typeof useBlocker>;

// Import the mocked modules for accessing mock functions
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
const mockFormChangesHistory = useQuestionnaireResponseStore.use
  .formChangesHistory as jest.MockedFunction<() => unknown[]>;

describe('useLeavePageBlocker', () => {
  const mockProceed = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLayoutEffect.mockImplementation((cb) => cb());
    // Mock formChangesHistory to return an empty array by default (unblocked)
    mockFormChangesHistory.mockReturnValue([]);
  });

  it('returns blocker from useBlocker when unblocked', () => {
    const mockBlocker = {
      state: 'unblocked' as const,
      location: undefined,
      proceed: undefined,
      reset: undefined
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    const { result } = renderHook(() => useLeavePageBlocker());

    expect(result.current).toBe(mockBlocker);
  });

  it('calls useBlocker with boolean based on formChangesHistory', () => {
    const mockBlocker = {
      state: 'unblocked' as const,
      location: undefined,
      proceed: undefined,
      reset: undefined
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    renderHook(() => useLeavePageBlocker());

    expect(mockUseBlocker).toHaveBeenCalledWith(false); // formChangesHistory is empty by default
  });

  it('calls useBlocker with true when formChangesHistory has items', () => {
    const mockBlocker = {
      state: 'blocked' as const,
      location: {
        pathname: '/some-path',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      },
      proceed: mockProceed,
      reset: mockReset
    };

    mockFormChangesHistory.mockReturnValue(['change1', 'change2']); // Mock history with items
    mockUseBlocker.mockReturnValue(mockBlocker);

    renderHook(() => useLeavePageBlocker());

    expect(mockUseBlocker).toHaveBeenCalledWith(true); // Should be blocked when history has items
  });

  it('calls proceed when blocker location is /renderer/preview', () => {
    const mockBlocker = {
      state: 'blocked' as const,
      location: {
        pathname: '/renderer/preview',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      },
      proceed: mockProceed,
      reset: mockReset
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    renderHook(() => useLeavePageBlocker());

    expect(mockProceed).toHaveBeenCalledTimes(1);
  });

  it('calls proceed when blocker location is /renderer', () => {
    const mockBlocker = {
      state: 'blocked' as const,
      location: {
        pathname: '/renderer',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      },
      proceed: mockProceed,
      reset: mockReset
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    renderHook(() => useLeavePageBlocker());

    expect(mockProceed).toHaveBeenCalledTimes(1);
  });

  it('does not call proceed for other paths', () => {
    const mockBlocker = {
      state: 'blocked' as const,
      location: {
        pathname: '/other-path',
        search: '',
        hash: '',
        state: null,
        key: 'test'
      },
      proceed: mockProceed,
      reset: mockReset
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    renderHook(() => useLeavePageBlocker());

    expect(mockProceed).not.toHaveBeenCalled();
  });

  it('sets up useLayoutEffect', () => {
    const mockBlocker = {
      state: 'unblocked' as const,
      location: undefined,
      proceed: undefined,
      reset: undefined
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    renderHook(() => useLeavePageBlocker());

    expect(mockUseLayoutEffect).toHaveBeenCalledWith(expect.any(Function), [mockBlocker, false]); // false because formChangesHistory is empty
  });
});
