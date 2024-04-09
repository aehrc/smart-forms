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

import type { Dispatch, ReactNode } from 'react';
import { createContext, useReducer } from 'react';
import type { Encounter, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

export interface SmartClientState {
  smartClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  launchQuestionnaire: Questionnaire | null;
  tokenReceivedTimestamp: number | null;
}

export type SmartClientActions =
  | { type: 'SET_CLIENT'; payload: Client }
  | {
      type: 'SET_COMMON_CONTEXTS';
      payload: { patient: Patient | null; user: Practitioner | null; encounter: Encounter | null };
    }
  | { type: 'SET_QUESTIONNAIRE_CONTEXT'; payload: Questionnaire };

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
  tokenReceivedTimestamp: null
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
