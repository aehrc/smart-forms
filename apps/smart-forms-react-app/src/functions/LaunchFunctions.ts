/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import type { OperationOutcome, Patient, Practitioner, Questionnaire } from 'fhir/r5';
import type { fhirclient } from 'fhirclient/lib/types';
import { headers } from './LoadServerResourceFunctions';
import * as FHIR from 'fhirclient';

export async function getPatient(client: Client): Promise<Patient> {
  return await client.patient.read();
}

export async function getUser(client: Client): Promise<Practitioner> {
  return (await client.user.read()) as Practitioner;
}

interface ResourceReference {
  reference: string;
}
interface tokenResponseWithFhirContext extends fhirclient.TokenResponse {
  fhirContext: ResourceReference[] | undefined;
}

export function getQuestionnaireReference(client: Client): string | null {
  const tokenResponse = client.state.tokenResponse as tokenResponseWithFhirContext;
  const fhirContext = tokenResponse.fhirContext;

  if (!fhirContext) return null;

  const questionnaireReferences = fhirContext.filter((resourceReference) =>
    resourceReference.reference.includes('Questionnaire')
  );

  if (questionnaireReferences.length === 0) return null;

  return questionnaireReferences[0].reference;
}

export function getQuestionnaireContext(
  questionnaireReference: string
): Promise<Questionnaire | OperationOutcome> {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  return FHIR.client(endpointUrl).request({
    url: questionnaireReference,
    method: 'GET',
    headers: headers
  });
}
