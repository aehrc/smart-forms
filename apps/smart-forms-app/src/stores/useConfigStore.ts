import create from 'zustand';
import type { Encounter, Patient } from 'fhir/r4';
import type { Practitioner } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import type { Source } from '../types/source.interface.ts';

export interface ConfigState {
  smartClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  debugMode: boolean;
  questionnaireSource: Source;
  setPatient: (patient: Patient) => void;
  setUser: (user: Practitioner) => void;
  setEncounter: (encounter: Encounter) => void;
  updateSource: (newSource: Source) => void;
}

const useConfigStore = create<ConfigState>()((set) => ({
  smartClient: null,
  patient: null,
  user: null,
  encounter: null,
  debugMode: false,
  questionnaireSource: 'remote',
  setPatient: (patient: Patient) => set(() => ({ patient: patient })),
  setUser: (user: Practitioner) => set(() => ({ user: user })),
  setEncounter: (encounter: Encounter) => set(() => ({ encounter: encounter })),
  updateSource: (newSource: Source) => set(() => ({ questionnaireSource: newSource }))
}));

export default useConfigStore;
