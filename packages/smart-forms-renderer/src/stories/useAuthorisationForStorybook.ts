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

import { useEffect, useState } from 'react';
import * as FHIR from 'fhirclient';
import { oauth2 } from 'fhirclient';
import useSmartClient from './useSmartClientForStorybook';
import {
  Bundle,
  Encounter,
  Identifier,
  OperationOutcome,
  Patient,
  Practitioner,
  Questionnaire
} from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';
import Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';
import { HEADERS } from '@aehrc/smart-forms-app/src/api/headers';

export interface AuthState {
  hasClient: boolean | null;
  hasUser: boolean | null;
  hasPatient: boolean | null;
  hasQuestionnaire: boolean | null;
  errorMessage: string | null;
}

export type AuthActions =
  | { type: 'UPDATE_HAS_CLIENT'; payload: boolean }
  | { type: 'UPDATE_HAS_USER'; payload: boolean }
  | { type: 'UPDATE_HAS_PATIENT'; payload: boolean }
  | { type: 'UPDATE_HAS_QUESTIONNAIRE'; payload: boolean }
  | { type: 'FAIL_AUTH'; payload: string };

function authReducer(state: AuthState, action: AuthActions): AuthState {
  switch (action.type) {
    case 'UPDATE_HAS_CLIENT':
      return { ...state, hasClient: action.payload };
    case 'UPDATE_HAS_USER':
      return { ...state, hasUser: action.payload };
    case 'UPDATE_HAS_PATIENT':
      return { ...state, hasPatient: action.payload };
    case 'UPDATE_HAS_QUESTIONNAIRE':
      return { ...state, hasQuestionnaire: action.payload };
    case 'FAIL_AUTH':
      return {
        hasClient: false,
        hasQuestionnaire: false,
        hasPatient: false,
        hasUser: false,
        errorMessage: action.payload
      };
    default:
      return state;
  }
}

const initialAuthState: AuthState = {
  hasClient: null,
  hasUser: null,
  hasPatient: null,
  hasQuestionnaire: null,
  errorMessage: null
};

function useAuthorisationForStorybook(launchState, formsServerUrl: string) {
  const { setSmartClient, setCommonLaunchContexts, setQuestionnaireLaunchContext } =
    useSmartClient();

  const buildSourceQuestionnaire = useQuestionnaireStore.use.buildSourceQuestionnaire();

  const [isAuthorising, setIsAuthorising] = useState(true);

  useEffect(
    () => {
      oauth2
        .ready()
        .then((client) => {
          console.log(client);
          // Set SMART client
          setSmartClient(client);
          sessionStorage.setItem('authorised', 'true');

          readCommonLaunchContexts(client).then(({ patient, user, encounter }) => {
            setCommonLaunchContexts(patient, user, encounter);
          });

          // Set questionnaire launch context if available
          const questionnaireReferences = getQuestionnaireReferences(client);
          if (questionnaireReferences.length > 0) {
            readQuestionnaireContext(client, formsServerUrl, questionnaireReferences)
              .then(async (result: Questionnaire | OperationOutcome | Bundle) => {
                const questionnaire = resultToQuestionnaireResource(result);

                // return early if no matching questionnaire
                if (!questionnaire) {
                  setIsAuthorising(false);
                  return;
                }

                // set questionnaire in provider context
                await buildSourceQuestionnaire(questionnaire);
                setQuestionnaireLaunchContext(questionnaire);
                setIsAuthorising(false);
              })
              .catch(() => {
                setIsAuthorising(false);
              });
          }

          // Cannot find questionnaire in context
          setIsAuthorising(false);
        })
        .catch((error: Error) => {
          console.error(error);
          console.log(error);
          setIsAuthorising(false);
        });
    },
    // only authenticate once, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return isAuthorising;
}

// internal functions

export async function readCommonLaunchContexts(
  client: Client
): Promise<{ patient: Patient | null; user: Practitioner | null; encounter: Encounter | null }> {
  const settledPromises = await Promise.allSettled([
    client.patient.read(),
    client.user.read(),
    client.encounter.read()
  ]);

  let patient: Patient | null = null;
  let user: Practitioner | null = null;
  let encounter: Encounter | null = null;
  for (const settledPromise of settledPromises) {
    if (settledPromise.status === 'fulfilled') {
      const resource = settledPromise.value;

      if (resource.resourceType === 'Patient') {
        patient = resource;
        continue;
      }

      if (resource.resourceType === 'Practitioner') {
        user = resource;
        continue;
      }

      if (resource.resourceType === 'Encounter') {
        encounter = resource as Encounter;
      }
    }
  }

  return {
    patient,
    user,
    encounter
  };
}

interface FhirContext {
  reference?: string;
  role?: string;
  canonical?: string;
  type?: string;
  identifier?: Identifier;
}

interface tokenResponseCustomised extends fhirclient.TokenResponse {
  fhirContext?: FhirContext[];
  intent?: string;
}

export function getQuestionnaireReferences(client: Client): FhirContext[] {
  const tokenResponse = client.state.tokenResponse as tokenResponseCustomised;
  const fhirContext = tokenResponse.fhirContext;

  if (!fhirContext) return [];

  // Temporarily recognise relative and canonical references only
  return fhirContext.filter(
    (context) => context.reference?.includes('Questionnaire') || context.canonical
  );
}

export function readQuestionnaireContext(
  client: Client,
  formsServerUrl: string,
  questionnaireReferences: FhirContext[]
): Promise<Questionnaire | Bundle | OperationOutcome> {
  if (questionnaireReferences.length === 0) {
    return Promise.reject(new Error('No Questionnaire references found'));
  }

  const questionnaireReference = questionnaireReferences[0];

  if (questionnaireReference.reference) {
    const questionnaireId = questionnaireReference.reference.split('/')[1];
    return client.request({
      url: 'Questionnaire/' + questionnaireId,
      method: 'GET',
      headers: HEADERS
    });
  } else if (questionnaireReference.canonical) {
    let canonical = questionnaireReference.canonical;

    canonical = canonical.replace('|', '&version=');

    return FHIR.client(formsServerUrl).request({
      url: 'Questionnaire?url=' + canonical + '&_sort=_lastUpdated',
      method: 'GET',
      headers: HEADERS
    });
  } else {
    return Promise.reject(new Error('No Questionnaire references found'));
  }
}

function resultToQuestionnaireResource(
  result: Questionnaire | OperationOutcome | Bundle
): Questionnaire | undefined {
  if (result.resourceType === 'Questionnaire') {
    return result as Questionnaire;
  }

  if (result.resourceType === 'Bundle') {
    return result.entry?.find((entry) => entry.resource?.resourceType === 'Questionnaire')
      ?.resource as Questionnaire;
  }

  if (result.resourceType === 'OperationOutcome') {
    console.error(result);
  }
}

export default useAuthorisationForStorybook;
