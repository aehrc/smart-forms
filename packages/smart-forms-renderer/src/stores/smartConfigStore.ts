/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { createStore } from 'zustand/vanilla';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { createSelectors } from './selector';

/**
 * SmartConfigStore properties and methods
 * Properties can be accessed for fine-grain details.
 * Methods are usually used internally, using them from an external source is not recommended.
 *
 * @property client - The FHIRClient object (https://github.com/smart-on-fhir/client-js)
 * @property patient - The patient resource in context
 * @property user - The user resource in context
 * @property encounter - The encounter resource in context
 * @property setClient - Set the FHIRClient object when launching via SMART App Launch
 * @property setPatient - Set the patient resource in context
 * @property setUser - Set the user resource in context
 * @property setEncounter - Set the encounter resource in context
 *
 * @author Sean Fong
 */
export interface SmartConfigStoreType {
  client: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  setClient: (client: Client) => void;
  setPatient: (patient: Patient) => void;
  setUser: (user: Practitioner) => void;
  setEncounter: (encounter: Encounter) => void;
}

/**
 * Smart Config state management store. This is only used for answerExpressions.
 * It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities.
 * Will be deprecated in version 1.0.0.
 *
 * This is the vanilla version of the store which can be used in non-React environments.
 * @see SmartConfigStoreType for available properties and methods.
 *
 * @author Sean Fong
 */
export const smartConfigStore = createStore<SmartConfigStoreType>()((set) => ({
  client: null,
  patient: null,
  user: null,
  encounter: null,
  setClient: (client: Client) => set(() => ({ client: client })),
  setPatient: (patient: Patient) => set(() => ({ patient: patient })),
  setUser: (user: Practitioner) => set(() => ({ user: user })),
  setEncounter: (encounter: Encounter) => set(() => ({ encounter: encounter }))
}));

/**
 * Smart Config state management store. This is only used for answerExpressions.
 * It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities.
 * Will be deprecated in version 1.0.0.
 *
 * This is the React version of the store which can be used as React hooks in React functional components.
 * @see SmartConfigStoreType for available properties and methods.
 * @see smartConfigStore for the vanilla store.
 *
 * @author Sean Fong
 */
export const useSmartConfigStore = createSelectors(smartConfigStore);
