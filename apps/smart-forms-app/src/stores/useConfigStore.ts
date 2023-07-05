import { create } from 'zustand';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import type { Source } from '../types/source.interface.ts';

export interface ConfigState {
  smartClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  debugMode: boolean;
  questionnaireSource: Source;
  setSmartClient: (client: Client) => void;
  setPatient: (patient: Patient) => void;
  setUser: (user: Practitioner) => void;
  setEncounter: (encounter: Encounter) => void;
  updateQuestionnaireSource: (newSource: Source) => void;
  activateDebugMode: () => void;
}

const useConfigStore = create<ConfigState>()((set) => ({
  smartClient: null,
  patient: null,
  user: null,
  encounter: null,
  debugMode: false,
  questionnaireSource: 'remote',
  setSmartClient: (client: Client) => set(() => ({ smartClient: client })),
  setPatient: (patient: Patient) => set(() => ({ patient: patient })),
  setUser: (user: Practitioner) => set(() => ({ user: user })),
  setEncounter: (encounter: Encounter) => set(() => ({ encounter: encounter })),
  updateQuestionnaireSource: (newSource: Source) => set(() => ({ questionnaireSource: newSource })),
  activateDebugMode: () => set(() => ({ debugMode: true }))
}));

export default useConfigStore;