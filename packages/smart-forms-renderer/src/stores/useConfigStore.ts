import { create } from 'zustand';
import type { Encounter, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

export interface ConfigState {
  smartClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  launchQuestionnaire: Questionnaire | null;
  debugMode: boolean;
  setSmartClient: (client: Client) => void;
  setPatient: (patient: Patient) => void;
  setUser: (user: Practitioner) => void;
  setEncounter: (encounter: Encounter) => void;
  setLaunchQuestionnaire: (launchQuestionnaire: Questionnaire | null) => void;
  activateDebugMode: () => void;
}

const useConfigStore = create<ConfigState>()((set) => ({
  smartClient: null,
  patient: null,
  user: null,
  encounter: null,
  launchQuestionnaire: null,
  debugMode: false,
  setSmartClient: (client: Client) => set(() => ({ smartClient: client })),
  setPatient: (patient: Patient) => set(() => ({ patient: patient })),
  setUser: (user: Practitioner) => set(() => ({ user: user })),
  setEncounter: (encounter: Encounter) => set(() => ({ encounter: encounter })),
  setLaunchQuestionnaire: (launchQuestionnaire: Questionnaire | null) =>
    set(() => ({ launchQuestionnaire: launchQuestionnaire })),
  activateDebugMode: () => set(() => ({ debugMode: true }))
}));

export default useConfigStore;
