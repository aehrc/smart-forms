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

import { useContext } from 'react';
import { SmartClientContext } from '../contexts/SmartClientContext.tsx';
import type { Encounter, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import { useSmartConfigStore } from '@aehrc/smart-forms-renderer';
import type Client from 'fhirclient/lib/Client';

function useSmartClient() {
  const { state, dispatch } = useContext(SmartClientContext);

  const setClient = useSmartConfigStore.use.setClient();
  const setPatient = useSmartConfigStore.use.setPatient();
  const setUser = useSmartConfigStore.use.setUser();
  const setEncounter = useSmartConfigStore.use.setEncounter();

  function setSmartClient(client: Client) {
    dispatch({
      type: 'SET_CLIENT',
      payload: client
    });
    setClient(client);
  }

  function setCommonLaunchContexts(
    patient: Patient | null,
    user: Practitioner | null,
    encounter: Encounter | null
  ) {
    dispatch({
      type: 'SET_COMMON_CONTEXTS',
      payload: {
        patient,
        user,
        encounter
      }
    });

    if (patient) {
      setPatient(patient);
    }

    if (user) {
      setUser(user);
    }

    if (encounter) {
      setEncounter(encounter);
    }
  }

  function setQuestionnaireLaunchContext(questionnaire: Questionnaire) {
    dispatch({
      type: 'SET_QUESTIONNAIRE_CONTEXT',
      payload: questionnaire
    });
  }

  const smartClient = state.smartClient;
  const patient = state.patient;
  const user = state.user;
  const encounter = state.encounter;
  const launchQuestionnaire = state.launchQuestionnaire;
  const tokenReceivedTimestamp = state.tokenReceivedTimestamp;

  return {
    smartClient,
    patient,
    user,
    encounter,
    launchQuestionnaire,
    tokenReceivedTimestamp,
    setSmartClient,
    setCommonLaunchContexts,
    setQuestionnaireLaunchContext
  };
}

export default useSmartClient;
