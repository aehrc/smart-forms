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
import useSmartClient from '../hooks/useSmartClient';
import type { SmartClientContextType } from '../contexts/SmartClientContext';

const mockDispatch = jest.fn();

const mockContextValue: SmartClientContextType = {
  state: {
    smartClient: null,
    patient: null,
    user: null,
    encounter: null,
    launchQuestionnaire: null,
    fhirContext: null,
    resolvedFhirContextReferences: null,
    tokenReceivedTimestamp: null,
    disableWriteBackSelection: false
  },
  dispatch: mockDispatch
};

const mockSetClientStore = jest.fn();
const mockSetPatientStore = jest.fn();
const mockSetUserStore = jest.fn();
const mockSetEncounterStore = jest.fn();
const mockSetFhirContextStore = jest.fn();
const mockSetResolvedFhirContextReferencesStore = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => mockContextValue)
}));

jest.mock('@aehrc/smart-forms-renderer', () => ({
  useSmartConfigStore: {
    use: {
      setClient: jest.fn(() => mockSetClientStore),
      setPatient: jest.fn(() => mockSetPatientStore),
      setUser: jest.fn(() => mockSetUserStore),
      setEncounter: jest.fn(() => mockSetEncounterStore),
      setFhirContext: jest.fn(() => mockSetFhirContextStore),
      setResolvedFhirContextReferences: jest.fn(() => mockSetResolvedFhirContextReferencesStore)
    }
  }
}));

describe('useSmartClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns disableWriteBackSelection from context state', () => {
    const { result } = renderHook(() => useSmartClient());

    expect(result.current.disableWriteBackSelection).toBe(false);
  });

  it('setDisableWriteBackSelection dispatches SET_DISABLE_WRITEBACK_SELECTION with true', () => {
    const { result } = renderHook(() => useSmartClient());

    act(() => {
      result.current.setDisableWriteBackSelection(true);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_DISABLE_WRITEBACK_SELECTION',
      payload: true
    });
  });

  it('setDisableWriteBackSelection dispatches SET_DISABLE_WRITEBACK_SELECTION with false', () => {
    const { result } = renderHook(() => useSmartClient());

    act(() => {
      result.current.setDisableWriteBackSelection(false);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_DISABLE_WRITEBACK_SELECTION',
      payload: false
    });
  });
});
