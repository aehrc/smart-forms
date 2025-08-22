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

import type Client from 'fhirclient/lib/Client';

const iss = 'https://example.com/fhir';

const clientId = 'client-id-mock';

const scope =
  'launch openid fhirUser online_access patient/AllergyIntolerance.cs patient/Condition.cs patient/Encounter.r patient/Immunization.cs patient/Medication.r patient/MedicationStatement.cs patient/Observation.cs patient/Patient.r patient/Practitioner.r patient/QuestionnaireResponse.crus launch/questionnaire?role=http://ns.electronichealth.net.au/smart/role/new';

// mock patient ID
const patientId = 'pat-mock';

// mock prac ID
const userId = 'prac-mock';

// mock encounter ID
const encounterId = 'encounter-mock';

export const mockFhirClient = {
  request: jest.fn(),
  state: {
    clientId: clientId,
    scope: scope,
    serverUrl: iss,
    tokenResponse: {
      access_token: 'mock-access-token'
    }
  },
  patient: {
    id: patientId
  },
  encounter: { id: encounterId },
  user: {
    id: userId,
    fhirUser: `Practitioner/${userId}`,
    resourceType: 'Practitioner'
  }
} as unknown as Client;
