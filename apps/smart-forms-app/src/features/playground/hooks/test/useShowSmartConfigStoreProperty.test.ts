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
import useShowSmartConfigStoreProperty from '../useShowSmartConfigStoreProperty';

// Mock the smart-forms-renderer hook
jest.mock('@aehrc/smart-forms-renderer', () => ({
  useSmartConfigStore: {
    use: {
      client: jest.fn(),
      patient: jest.fn(),
      user: jest.fn(),
      encounter: jest.fn()
    }
  }
}));

import { useSmartConfigStore } from '@aehrc/smart-forms-renderer';

describe('useShowSmartConfigStoreProperty', () => {
  const mockClient = { id: 'client-1', name: 'Test Client' };
  const mockPatient = { id: 'patient-1', name: [{ text: 'John Doe' }] };
  const mockUser = { id: 'user-1', name: [{ text: 'Dr. Smith' }] };
  const mockEncounter = { id: 'encounter-1', status: 'in-progress' };

  beforeEach(() => {
    jest.clearAllMocks();

    (useSmartConfigStore.use.client as jest.Mock).mockReturnValue(mockClient);
    (useSmartConfigStore.use.patient as jest.Mock).mockReturnValue(mockPatient);
    (useSmartConfigStore.use.user as jest.Mock).mockReturnValue(mockUser);
    (useSmartConfigStore.use.encounter as jest.Mock).mockReturnValue(mockEncounter);
  });

  it('returns client when selectedProperty is "client"', () => {
    const { result } = renderHook(() => useShowSmartConfigStoreProperty('client'));

    expect(result.current).toEqual(mockClient);
    expect(useSmartConfigStore.use.client).toHaveBeenCalled();
  });

  it('returns patient when selectedProperty is "patient"', () => {
    const { result } = renderHook(() => useShowSmartConfigStoreProperty('patient'));

    expect(result.current).toEqual(mockPatient);
    expect(useSmartConfigStore.use.patient).toHaveBeenCalled();
  });

  it('returns user when selectedProperty is "user"', () => {
    const { result } = renderHook(() => useShowSmartConfigStoreProperty('user'));

    expect(result.current).toEqual(mockUser);
    expect(useSmartConfigStore.use.user).toHaveBeenCalled();
  });

  it('returns encounter when selectedProperty is "encounter"', () => {
    const { result } = renderHook(() => useShowSmartConfigStoreProperty('encounter'));

    expect(result.current).toEqual(mockEncounter);
    expect(useSmartConfigStore.use.encounter).toHaveBeenCalled();
  });

  it('returns null when selectedProperty is not valid', () => {
    const { result } = renderHook(() => useShowSmartConfigStoreProperty('invalid'));

    expect(result.current).toBeNull();
  });

  it('returns null when selectedProperty is empty string', () => {
    const { result } = renderHook(() => useShowSmartConfigStoreProperty(''));

    expect(result.current).toBeNull();
  });

  it('calls all store methods regardless of selected property', () => {
    renderHook(() => useShowSmartConfigStoreProperty('client'));

    expect(useSmartConfigStore.use.client).toHaveBeenCalled();
    expect(useSmartConfigStore.use.patient).toHaveBeenCalled();
    expect(useSmartConfigStore.use.user).toHaveBeenCalled();
    expect(useSmartConfigStore.use.encounter).toHaveBeenCalled();
  });
});
