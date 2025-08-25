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

import { renderHook, act } from '@testing-library/react';
import useDebugMode from '../hooks/useDebugMode';

// Mock the DebugModeContext
const mockSetEnabled = jest.fn();
const mockContext = {
  enabled: false,
  setEnabled: mockSetEnabled
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => mockContext)
}));

describe('useDebugMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContext.enabled = false;
  });

  it('returns debugModeEnabled as false when context enabled is false', () => {
    const { result } = renderHook(() => useDebugMode());

    expect(result.current.debugModeEnabled).toBe(false);
  });

  it('returns debugModeEnabled as true when context enabled is true', () => {
    mockContext.enabled = true;

    const { result } = renderHook(() => useDebugMode());

    expect(result.current.debugModeEnabled).toBe(true);
  });

  it('toggleDebugMode calls setEnabled with opposite value when enabled is false', () => {
    const { result } = renderHook(() => useDebugMode());

    act(() => {
      result.current.toggleDebugMode();
    });

    expect(mockSetEnabled).toHaveBeenCalledWith(true);
  });

  it('toggleDebugMode calls setEnabled with opposite value when enabled is true', () => {
    mockContext.enabled = true;

    const { result } = renderHook(() => useDebugMode());

    act(() => {
      result.current.toggleDebugMode();
    });

    expect(mockSetEnabled).toHaveBeenCalledWith(false);
  });
});
