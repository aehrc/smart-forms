import { smartConfigStore } from '../../stores/smartConfigStore';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

describe('smartConfigStore actions', () => {
  beforeEach(() => {
    // Reset only the fields we care about for independent action tests
    smartConfigStore.setState({
      client: null,
      patient: null,
      user: null,
      encounter: null
    });
  });

  describe('setClient', () => {
    it('should set the FHIR client', () => {
      const mockClient = { request: jest.fn() } as unknown as Client;
      smartConfigStore.getState().setClient(mockClient);
      expect(smartConfigStore.getState().client).toBe(mockClient);
    });

    it('should replace an existing client', () => {
      const firstClient = { id: '1' } as unknown as Client;
      const secondClient = { id: '2' } as unknown as Client;

      smartConfigStore.getState().setClient(firstClient);
      expect(smartConfigStore.getState().client).toBe(firstClient);

      smartConfigStore.getState().setClient(secondClient);
      expect(smartConfigStore.getState().client).toBe(secondClient);
    });
  });

  describe('setPatient', () => {
    it('should set a patient resource', () => {
      const patient: Patient = { resourceType: 'Patient', id: 'p1' };
      smartConfigStore.getState().setPatient(patient);
      expect(smartConfigStore.getState().patient).toBe(patient);
    });
  });

  describe('setUser', () => {
    it('should set a practitioner resource', () => {
      const user: Practitioner = { resourceType: 'Practitioner', id: 'u1' };
      smartConfigStore.getState().setUser(user);
      expect(smartConfigStore.getState().user).toBe(user);
    });
  });

  describe('setEncounter', () => {
    it('should set an encounter resource', () => {
      const encounter: Encounter = {
        resourceType: 'Encounter',
        id: 'e1',
        status: 'in-progress',
        class: { code: 'AMB' }
      };
      smartConfigStore.getState().setEncounter(encounter);
      expect(smartConfigStore.getState().encounter).toBe(encounter);
    });
  });

  describe('subscriptions', () => {
    it('should notify subscriber when client changes', () => {
      const subscriber = jest.fn();
      const unsubscribe = smartConfigStore.subscribe(subscriber);

      const client = { id: 'test' } as unknown as Client;
      smartConfigStore.getState().setClient(client);

      expect(subscriber).toHaveBeenCalled();
      unsubscribe();
    });

    it('should notify subscriber when patient changes', () => {
      const subscriber = jest.fn();
      const unsubscribe = smartConfigStore.subscribe(subscriber);

      const patient: Patient = { resourceType: 'Patient', id: 'p2' };
      smartConfigStore.getState().setPatient(patient);

      expect(subscriber).toHaveBeenCalled();
      unsubscribe();
    });
  });
});
