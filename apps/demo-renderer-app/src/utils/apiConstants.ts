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

// Launch properties
export const ISS = 'https://gw.interop.community/AuConNov23/data';
export const CLIENT_ID = '320392f1-ef47-4470-8cfa-f31389057531';
export const SCOPES =
  'patient/Observation.rs patient/Patient.rs online_access openid profile patient/QuestionnaireResponse.cruds launch fhirUser patient/Encounter.rs patient/Condition.rs';

// Patient and practitioner launch context queries
export const PATIENT_QUERY =
  'https://gw.interop.community/AuConNov23/data/Patient?_count=10&_sort=-_lastUpdated';
export const PRACTITIONER_QUERY =
  'https://gw.interop.community/AuConNov23/data/Practitioner?_count=10&_sort=-_lastUpdated';
