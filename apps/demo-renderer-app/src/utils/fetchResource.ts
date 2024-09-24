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

import type { Patient, Practitioner, Questionnaire } from 'fhir/r4';

export async function fetchResource(
  endpointUrl: string,
  bearerToken: string | null,
  noCache: boolean = false
) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }

  if (noCache) {
    headers['Cache-Control'] = 'no-cache';
  }

  const response = await fetch(endpointUrl, { headers });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export function questionnaireIsValid(questionnaire: any): questionnaire is Questionnaire {
  return questionnaire.resourceType === 'Questionnaire' && questionnaire.item;
}

export function patientIsValid(patient: any): patient is Patient {
  return patient.resourceType === 'Patient' && patient.id && patient.name;
}

export function practitionerIsValid(practitioner: any): practitioner is Practitioner {
  return practitioner.resourceType === 'Practitioner' && practitioner.id && practitioner.name;
}
