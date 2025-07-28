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

import '@testing-library/jest-dom';
import { mockFhirClient } from './test/data-shared/mockFhirClient.ts';

// Need to mock as nanoid is an ESM module
jest.mock('nanoid', () => ({
  nanoid: () => 'mocked-id-123'
}));

// Mock global variables from env files
jest.mock('./globals.ts', () => ({
  TERMINOLOGY_SERVER_URL: 'https://example.com/terminology/fhir',
  FORMS_SERVER_URL: 'https://example.com/forms/fhir',
  LAUNCH_SCOPE:
    'launch openid fhirUser online_access patient/AllergyIntolerance.cs patient/Condition.cs patient/Encounter.r patient/Immunization.cs patient/Medication.r patient/MedicationStatement.cs patient/Observation.cs patient/Patient.r patient/Practitioner.r patient/QuestionnaireResponse.crus launch/questionnaire?role=http://ns.electronichealth.net.au/smart/role/new',
  LAUNCH_CLIENT_ID: 'client-id-mock',
  IN_APP_POPULATE: false
}));

// Mock read methods on client.patient, client.user, client.encounter
mockFhirClient.patient.read = jest.fn().mockResolvedValue({
  resourceType: 'Patient',
  id: mockFhirClient.patient.id
});

mockFhirClient.user.read = jest.fn().mockResolvedValue({
  resourceType: 'Practitioner',
  id: mockFhirClient.user.id
});

mockFhirClient.encounter.read = jest.fn().mockResolvedValue({
  resourceType: 'Encounter',
  id: null
});

// Mock the whole fhirclient library
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));
