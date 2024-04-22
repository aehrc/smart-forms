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

import type Client from 'fhirclient/lib/Client';
import type {
  Bundle,
  Encounter,
  Identifier,
  OperationOutcome,
  Patient,
  Practitioner,
  Questionnaire
} from 'fhir/r4';
import type { fhirclient } from 'fhirclient/lib/types';
import * as FHIR from 'fhirclient';
import { HEADERS } from '../../../api/headers.ts';

const endpointUrl = import.meta.env.VITE_FORMS_SERVER_URL ?? 'https://smartforms.csiro.au/api/fhir';

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

    return FHIR.client(endpointUrl).request({
      url: 'Questionnaire?url=' + canonical + '&_sort=_lastUpdated',
      method: 'GET',
      headers: HEADERS
    });
  } else {
    return Promise.reject(new Error('No Questionnaire references found'));
  }
}

export function responseToQuestionnaireResource(
  response: Questionnaire | OperationOutcome | Bundle
): Questionnaire | undefined {
  if (response.resourceType === 'Questionnaire') {
    return response as Questionnaire;
  }

  if (response.resourceType === 'Bundle') {
    return response.entry?.find((entry) => entry.resource?.resourceType === 'Questionnaire')
      ?.resource as Questionnaire;
  }

  if (response.resourceType === 'OperationOutcome') {
    console.error(response);
  }
}
