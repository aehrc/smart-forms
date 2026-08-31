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

/// <reference types="jest" />
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
    extraLaunchContext: {
      disableWriteBackSelection: false,
      enableBundleValidation: false
    }
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

  it('returns extraLaunchContext from context state', () => {
    const { result } = renderHook(() => useSmartClient());

    expect(result.current.extraLaunchContext).toEqual({
      disableWriteBackSelection: false,
      enableBundleValidation: false
    });
  });

  it('setExtraLaunchContext dispatches SET_EXTRA_LAUNCH_CONTEXT', () => {
    const { result } = renderHook(() => useSmartClient());

    act(() => {
      result.current.setExtraLaunchContext({
        disableWriteBackSelection: true,
        enableBundleValidation: false
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_EXTRA_LAUNCH_CONTEXT',
      payload: { disableWriteBackSelection: true, enableBundleValidation: false }
    });
  });
});
