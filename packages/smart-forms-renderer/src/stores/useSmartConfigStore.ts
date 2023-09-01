import { create } from 'zustand';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

export interface UseSmartConfigStoreType {
  client: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  setClient: (client: Client) => void;
  setPatient: (patient: Patient) => void;
  setUser: (user: Practitioner) => void;
  setEncounter: (encounter: Encounter) => void;
}

const useSmartConfigStore = create<UseSmartConfigStoreType>()((set) => ({
  client: null,
  patient: null,
  user: null,
  encounter: null,
  setClient: (client: Client) => set(() => ({ client: client })),
  setPatient: (patient: Patient) => set(() => ({ patient: patient })),
  setUser: (user: Practitioner) => set(() => ({ user: user })),
  setEncounter: (encounter: Encounter) => set(() => ({ encounter: encounter }))
}));

export default useSmartConfigStore;
