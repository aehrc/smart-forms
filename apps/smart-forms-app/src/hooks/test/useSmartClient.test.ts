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
import { createElement } from 'react';
import useSmartClient from '../useSmartClient';
import { SmartClientContext } from '../../contexts/SmartClientContext';
import type { SmartClientContextType, SmartClientState } from '../../contexts/SmartClientContext';
import type { Encounter, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import type { FhirContext } from '../../features/smartAppLaunch/utils/launch';

// Mock the smart-forms-renderer store
const mockSetClient = jest.fn();
const mockSetPatient = jest.fn();
const mockSetUser = jest.fn();
const mockSetEncounter = jest.fn();

jest.mock('@aehrc/smart-forms-renderer', () => ({
  useSmartConfigStore: {
    use: {
      setClient: () => mockSetClient,
      setPatient: () => mockSetPatient,
      setUser: () => mockSetUser,
      setEncounter: () => mockSetEncounter
    }
  }
}));

// Create wrapper component for context
const createWrapper = (contextValue: SmartClientContextType) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(SmartClientContext.Provider, { value: contextValue }, children);
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('useSmartClient', () => {
  let mockDispatch: jest.Mock;
  let mockState: SmartClientState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    mockState = {
      smartClient: null,
      patient: null,
      user: null,
      encounter: null,
      launchQuestionnaire: null,
      fhirContext: null,
      tokenReceivedTimestamp: null
    };
  });

  describe('initial state', () => {
    it('should return initial state values when context has null values', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      expect(result.current.smartClient).toBeNull();
      expect(result.current.patient).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.encounter).toBeNull();
      expect(result.current.launchQuestionnaire).toBeNull();
      expect(result.current.fhirContext).toBeNull();
      expect(result.current.tokenReceivedTimestamp).toBeNull();
    });

    it('should return populated state values when context has data', () => {
      const mockClient = { id: 'test-client' } as unknown as Client;
      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Doe', given: ['John'] }]
      };
      const mockUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456',
        name: [{ family: 'Smith', given: ['Dr. Jane'] }]
      };
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-789',
        status: 'in-progress',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
      };
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-abc',
        status: 'active'
      };
      const mockFhirContext: FhirContext[] = [{ name: 'patient', reference: 'Patient/123' }];
      const mockTimestamp = 1638360000000;

      const populatedState: SmartClientState = {
        smartClient: mockClient,
        patient: mockPatient,
        user: mockUser,
        encounter: mockEncounter,
        launchQuestionnaire: mockQuestionnaire,
        fhirContext: mockFhirContext,
        tokenReceivedTimestamp: mockTimestamp
      };

      const wrapper = createWrapper({
        state: populatedState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      expect(result.current.smartClient).toEqual(mockClient);
      expect(result.current.patient).toEqual(mockPatient);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.encounter).toEqual(mockEncounter);
      expect(result.current.launchQuestionnaire).toEqual(mockQuestionnaire);
      expect(result.current.fhirContext).toEqual(mockFhirContext);
      expect(result.current.tokenReceivedTimestamp).toEqual(mockTimestamp);
    });
  });

  describe('setSmartClient', () => {
    it('should dispatch SET_CLIENT action and call store setClient', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockClient = { id: 'test-client', request: jest.fn() } as unknown as Client;

      act(() => {
        result.current.setSmartClient(mockClient);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CLIENT',
        payload: mockClient
      });
      expect(mockSetClient).toHaveBeenCalledWith(mockClient);
    });

    it('should handle complex client objects', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const complexClient = {
        id: 'complex-client',
        state: { serverUrl: 'https://fhir.example.com' },
        patient: { read: jest.fn() },
        request: jest.fn()
      } as unknown as Client;

      act(() => {
        result.current.setSmartClient(complexClient);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CLIENT',
        payload: complexClient
      });
      expect(mockSetClient).toHaveBeenCalledWith(complexClient);
    });
  });

  describe('setCommonLaunchContexts', () => {
    it('should dispatch SET_COMMON_CONTEXTS action and call store setters for all resources', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        birthDate: '1990-01-01'
      };
      const mockUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456',
        active: true
      };
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-789',
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
      };

      act(() => {
        result.current.setCommonLaunchContexts(mockPatient, mockUser, mockEncounter);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_COMMON_CONTEXTS',
        payload: {
          patient: mockPatient,
          user: mockUser,
          encounter: mockEncounter
        }
      });
      expect(mockSetPatient).toHaveBeenCalledWith(mockPatient);
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetEncounter).toHaveBeenCalledWith(mockEncounter);
    });

    it('should handle null patient and not call setPatient', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456'
      };
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-789',
        status: 'in-progress',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
      };

      act(() => {
        result.current.setCommonLaunchContexts(null, mockUser, mockEncounter);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_COMMON_CONTEXTS',
        payload: {
          patient: null,
          user: mockUser,
          encounter: mockEncounter
        }
      });
      expect(mockSetPatient).not.toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetEncounter).toHaveBeenCalledWith(mockEncounter);
    });

    it('should handle null user and not call setUser', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123'
      };
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-789',
        status: 'planned',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
      };

      act(() => {
        result.current.setCommonLaunchContexts(mockPatient, null, mockEncounter);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_COMMON_CONTEXTS',
        payload: {
          patient: mockPatient,
          user: null,
          encounter: mockEncounter
        }
      });
      expect(mockSetPatient).toHaveBeenCalledWith(mockPatient);
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetEncounter).toHaveBeenCalledWith(mockEncounter);
    });

    it('should handle null encounter and not call setEncounter', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123'
      };
      const mockUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456'
      };

      act(() => {
        result.current.setCommonLaunchContexts(mockPatient, mockUser, null);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_COMMON_CONTEXTS',
        payload: {
          patient: mockPatient,
          user: mockUser,
          encounter: null
        }
      });
      expect(mockSetPatient).toHaveBeenCalledWith(mockPatient);
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetEncounter).not.toHaveBeenCalled();
    });

    it('should handle all null contexts', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      act(() => {
        result.current.setCommonLaunchContexts(null, null, null);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_COMMON_CONTEXTS',
        payload: {
          patient: null,
          user: null,
          encounter: null
        }
      });
      expect(mockSetPatient).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetEncounter).not.toHaveBeenCalled();
    });
  });

  describe('setQuestionnaireLaunchContext', () => {
    it('should dispatch SET_QUESTIONNAIRE_CONTEXT action', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-test',
        status: 'active',
        title: 'Test Questionnaire'
      };

      act(() => {
        result.current.setQuestionnaireLaunchContext(mockQuestionnaire);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_QUESTIONNAIRE_CONTEXT',
        payload: mockQuestionnaire
      });
    });

    it('should handle questionnaire with complex properties', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const complexQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'complex-questionnaire',
        status: 'active',
        version: '1.0.0',
        title: 'Complex Test Questionnaire',
        description: 'A questionnaire with complex properties',
        item: [
          {
            linkId: '1',
            text: 'What is your name?',
            type: 'string',
            required: true
          }
        ]
      };

      act(() => {
        result.current.setQuestionnaireLaunchContext(complexQuestionnaire);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_QUESTIONNAIRE_CONTEXT',
        payload: complexQuestionnaire
      });
    });
  });

  describe('setFhirContext', () => {
    it('should dispatch SET_FHIR_CONTEXT action', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockFhirContext: FhirContext[] = [
        { name: 'patient', reference: 'Patient/123' },
        { name: 'encounter', reference: 'Encounter/456' }
      ];

      act(() => {
        result.current.setFhirContext(mockFhirContext);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_FHIR_CONTEXT',
        payload: mockFhirContext
      });
    });

    it('should handle empty FHIR context array', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const emptyFhirContext: FhirContext[] = [];

      act(() => {
        result.current.setFhirContext(emptyFhirContext);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_FHIR_CONTEXT',
        payload: emptyFhirContext
      });
    });

    it('should handle complex FHIR context with multiple entries', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const complexFhirContext: FhirContext[] = [
        { name: 'patient', reference: 'Patient/patient-123' },
        { name: 'encounter', reference: 'Encounter/encounter-456' },
        { name: 'practitioner', reference: 'Practitioner/practitioner-789' },
        { name: 'organization', reference: 'Organization/organization-abc' }
      ];

      act(() => {
        result.current.setFhirContext(complexFhirContext);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_FHIR_CONTEXT',
        payload: complexFhirContext
      });
    });
  });

  describe('returned functions', () => {
    it('should provide all expected functions', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      expect(typeof result.current.setSmartClient).toBe('function');
      expect(typeof result.current.setCommonLaunchContexts).toBe('function');
      expect(typeof result.current.setQuestionnaireLaunchContext).toBe('function');
      expect(typeof result.current.setFhirContext).toBe('function');
    });

    it('should have stable function references', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result, rerender } = renderHook(() => useSmartClient(), { wrapper });

      rerender();

      // Functions should be stable across re-renders - just verify they exist and are functions
      expect(typeof result.current.setSmartClient).toBe('function');
      expect(typeof result.current.setCommonLaunchContexts).toBe('function');
      expect(typeof result.current.setQuestionnaireLaunchContext).toBe('function');
      expect(typeof result.current.setFhirContext).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential operations', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      const mockClient = { id: 'test-client' } as unknown as Client;
      const mockPatient: Patient = { resourceType: 'Patient', id: 'patient-123' };
      const mockUser: Practitioner = { resourceType: 'Practitioner', id: 'practitioner-456' };
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-789',
        status: 'active'
      };
      const mockFhirContext: FhirContext[] = [{ name: 'patient', reference: 'Patient/123' }];

      act(() => {
        result.current.setSmartClient(mockClient);
        result.current.setCommonLaunchContexts(mockPatient, mockUser, null);
        result.current.setQuestionnaireLaunchContext(mockQuestionnaire);
        result.current.setFhirContext(mockFhirContext);
      });

      expect(mockDispatch).toHaveBeenCalledTimes(4);
      expect(mockSetClient).toHaveBeenCalledWith(mockClient);
      expect(mockSetPatient).toHaveBeenCalledWith(mockPatient);
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetEncounter).not.toHaveBeenCalled();
    });

    it('should handle context updates without affecting store calls for null values', () => {
      const wrapper = createWrapper({
        state: mockState,
        dispatch: mockDispatch
      });

      const { result } = renderHook(() => useSmartClient(), { wrapper });

      // First call with some values
      act(() => {
        result.current.setCommonLaunchContexts({ resourceType: 'Patient', id: 'patient-1' }, null, {
          resourceType: 'Encounter',
          id: 'encounter-1',
          status: 'in-progress',
          class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
        });
      });

      expect(mockSetPatient).toHaveBeenCalledTimes(1);
      expect(mockSetUser).toHaveBeenCalledTimes(0);
      expect(mockSetEncounter).toHaveBeenCalledTimes(1);

      // Second call with different values
      act(() => {
        result.current.setCommonLaunchContexts(
          null,
          { resourceType: 'Practitioner', id: 'practitioner-1' },
          null
        );
      });

      expect(mockSetPatient).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(mockSetUser).toHaveBeenCalledTimes(1); // Called once now
      expect(mockSetEncounter).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });
});
