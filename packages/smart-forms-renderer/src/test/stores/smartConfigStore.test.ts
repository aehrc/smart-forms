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

import { smartConfigStore } from '../../stores/smartConfigStore';
import type { Patient, Practitioner, Encounter } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

describe('smartConfigStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const initialState = smartConfigStore.getState();
    smartConfigStore.setState({
      client: null,
      patient: null,
      user: null,
      encounter: null,
      setClient: initialState.setClient,
      setPatient: initialState.setPatient,
      setUser: initialState.setUser,
      setEncounter: initialState.setEncounter
    });
  });

  describe('initial state', () => {
    it('should have all properties as null initially', () => {
      const state = smartConfigStore.getState();
      expect(state.client).toBeNull();
      expect(state.patient).toBeNull();
      expect(state.user).toBeNull();
      expect(state.encounter).toBeNull();
    });
  });

  describe('setClient', () => {
    it('should set the FHIR client', () => {
      const mockClient = {
        request: jest.fn(),
        patient: { read: jest.fn() },
        user: { read: jest.fn() }
      } as unknown as Client;

      smartConfigStore.getState().setClient(mockClient);
      
      const state = smartConfigStore.getState();
      expect(state.client).toBe(mockClient);
    });

    it('should replace existing client', () => {
      const firstClient = { id: 'client1' } as unknown as Client;
      const secondClient = { id: 'client2' } as unknown as Client;
      
      smartConfigStore.getState().setClient(firstClient);
      expect(smartConfigStore.getState().client).toBe(firstClient);
      
      smartConfigStore.getState().setClient(secondClient);
      expect(smartConfigStore.getState().client).toBe(secondClient);
    });
  });

  describe('setPatient', () => {
    it('should set a patient resource', () => {
      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ given: ['John'], family: 'Doe' }]
      };

      smartConfigStore.getState().setPatient(mockPatient);
      
      const state = smartConfigStore.getState();
      expect(state.patient).toBe(mockPatient);
      expect(state.patient?.id).toBe('patient-123');
    });

    it('should replace existing patient', () => {
      const firstPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-1',
        name: [{ given: ['John'], family: 'Doe' }]
      };
      
      const secondPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-2',
        name: [{ given: ['Jane'], family: 'Smith' }]
      };
      
      smartConfigStore.getState().setPatient(firstPatient);
      expect(smartConfigStore.getState().patient?.id).toBe('patient-1');
      
      smartConfigStore.getState().setPatient(secondPatient);
      expect(smartConfigStore.getState().patient?.id).toBe('patient-2');
    });
  });

  describe('setUser', () => {
    it('should set a practitioner user resource', () => {
      const mockUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-123',
        name: [{ given: ['Dr. John'], family: 'Smith' }]
      };

      smartConfigStore.getState().setUser(mockUser);
      
      const state = smartConfigStore.getState();
      expect(state.user).toBe(mockUser);
      expect(state.user?.id).toBe('practitioner-123');
    });

    it('should replace existing user', () => {
      const firstUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [{ given: ['Dr. John'], family: 'Smith' }]
      };
      
      const secondUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-2',
        name: [{ given: ['Dr. Jane'], family: 'Doe' }]
      };
      
      smartConfigStore.getState().setUser(firstUser);
      expect(smartConfigStore.getState().user?.id).toBe('practitioner-1');
      
      smartConfigStore.getState().setUser(secondUser);
      expect(smartConfigStore.getState().user?.id).toBe('practitioner-2');
    });
  });

  describe('setEncounter', () => {
    it('should set an encounter resource', () => {
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-123',
        status: 'in-progress',
        class: { code: 'AMB' }
      };

      smartConfigStore.getState().setEncounter(mockEncounter);
      
      const state = smartConfigStore.getState();
      expect(state.encounter).toBe(mockEncounter);
      expect(state.encounter?.id).toBe('encounter-123');
    });

    it('should replace existing encounter', () => {
      const firstEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-1',
        status: 'planned',
        class: { code: 'AMB' }
      };
      
      const secondEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-2',
        status: 'in-progress',
        class: { code: 'IMP' }
      };
      
      smartConfigStore.getState().setEncounter(firstEncounter);
      expect(smartConfigStore.getState().encounter?.id).toBe('encounter-1');
      
      smartConfigStore.getState().setEncounter(secondEncounter);
      expect(smartConfigStore.getState().encounter?.id).toBe('encounter-2');
    });
  });

  describe('store subscription', () => {
    it('should notify subscribers when client changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = smartConfigStore.subscribe(mockSubscriber);
      
      const mockClient = { id: 'test-client' } as unknown as Client;
      smartConfigStore.getState().setClient(mockClient);
      
      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });

    it('should notify subscribers when patient changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = smartConfigStore.subscribe(mockSubscriber);
      
      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'test-patient'
      };
      smartConfigStore.getState().setPatient(mockPatient);
      
      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });

    it('should notify subscribers when user changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = smartConfigStore.subscribe(mockSubscriber);
      
      const mockUser: Practitioner = {
        resourceType: 'Practitioner',
        id: 'test-practitioner'
      };
      smartConfigStore.getState().setUser(mockUser);
      
      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });

    it('should notify subscribers when encounter changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = smartConfigStore.subscribe(mockSubscriber);
      
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'test-encounter',
        status: 'in-progress',
        class: { code: 'AMB' }
      };
      smartConfigStore.getState().setEncounter(mockEncounter);
      
      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('multiple operations', () => {
    it('should handle setting all resources in sequence', () => {
      const mockClient = { id: 'client' } as unknown as Client;
      const mockPatient: Patient = { resourceType: 'Patient', id: 'patient' };
      const mockUser: Practitioner = { resourceType: 'Practitioner', id: 'practitioner' };
      const mockEncounter: Encounter = { 
        resourceType: 'Encounter', 
        id: 'encounter',
        status: 'in-progress',
        class: { code: 'AMB' }
      };

      smartConfigStore.getState().setClient(mockClient);
      smartConfigStore.getState().setPatient(mockPatient);
      smartConfigStore.getState().setUser(mockUser);
      smartConfigStore.getState().setEncounter(mockEncounter);
      
      const state = smartConfigStore.getState();
      expect(state.client).toBe(mockClient);
      expect(state.patient).toBe(mockPatient);
      expect(state.user).toBe(mockUser);
      expect(state.encounter).toBe(mockEncounter);
    });
  });
});
