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

import type { Dispatch, ReactNode } from 'react';
import { createContext, useReducer } from 'react';
import type { Encounter, FhirResource, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import type { FhirContext } from '../features/smartAppLaunch/utils/launch.ts';

export interface SmartClientState {
  smartClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  fhirContext: FhirContext[] | null;
  resolvedFhirContextReferences: Record<string, FhirResource> | null;
  launchQuestionnaire: Questionnaire | null;
  tokenReceivedTimestamp: number | null;
  disableWriteBackSelection: boolean;
}

export type SmartClientActions =
  | { type: 'SET_CLIENT'; payload: Client }
  | {
      type: 'SET_COMMON_CONTEXTS';
      payload: { patient: Patient | null; user: Practitioner | null; encounter: Encounter | null };
    }
  | { type: 'SET_QUESTIONNAIRE_CONTEXT'; payload: Questionnaire }
  | { type: 'SET_FHIR_CONTEXT'; payload: FhirContext[] }
  | { type: 'SET_RESOLVED_FHIR_CONTEXT_REFERENCES'; payload: Record<string, FhirResource> }
  | { type: 'SET_DISABLE_WRITEBACK_SELECTION'; payload: boolean };

function smartClientReducer(state: SmartClientState, action: SmartClientActions): SmartClientState {
  switch (action.type) {
    case 'SET_CLIENT':
      return { ...state, smartClient: action.payload, tokenReceivedTimestamp: Date.now() };
    case 'SET_COMMON_CONTEXTS':
      return {
        ...state,
        patient: action.payload.patient,
        user: action.payload.user,
        encounter: action.payload.encounter
      };
    case 'SET_QUESTIONNAIRE_CONTEXT':
      return { ...state, launchQuestionnaire: action.payload };
    case 'SET_FHIR_CONTEXT':
      return { ...state, fhirContext: action.payload };
    case 'SET_RESOLVED_FHIR_CONTEXT_REFERENCES':
      return { ...state, resolvedFhirContextReferences: action.payload };
    case 'SET_DISABLE_WRITEBACK_SELECTION':
      return { ...state, disableWriteBackSelection: action.payload };
    default:
      return state;
  }
}

const initialSmartClientState: SmartClientState = {
  smartClient: null,
  patient: null,
  user: null,
  encounter: null,
  launchQuestionnaire: null,
  fhirContext: null,
  resolvedFhirContextReferences: null,
  tokenReceivedTimestamp: null,
  disableWriteBackSelection: false
};

export interface SmartClientContextType {
  state: SmartClientState;
  dispatch: Dispatch<SmartClientActions>;
}

export const SmartClientContext = createContext<SmartClientContextType>({
  state: initialSmartClientState,
  dispatch: () => null
});

function SmartClientContextProvider(props: { children: ReactNode }) {
  const { children } = props;

  const [state, dispatch] = useReducer(smartClientReducer, initialSmartClientState);

  return (
    <SmartClientContext.Provider
      value={{
        state,
        dispatch
      }}>
      {children}
    </SmartClientContext.Provider>
  );
}

export default SmartClientContextProvider;
