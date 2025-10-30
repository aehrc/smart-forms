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

export const PLAYWRIGHT_EHR_URL = 'https://proxy.smartforms.io/v/r4/fhir';
export const PLAYWRIGHT_FORMS_SERVER_URL = 'https://smartforms.csiro.au/api/fhir';

export const PLAYWRIGHT_APP_URL = process.env.CI
  ? 'http://localhost:4173'
  : 'http://localhost:5173';

/*
 * This is the base64 encoded version of the following array. Refer to https://github.com/aehrc/SMART-EHR-Launcher/blob/main/src/lib/codec.ts
 * If you find tests constantly failing at the beforeEach step, check if the clientIds, scopes, etc are still valid.
 *
 * [
 *   launchTypeIndex (indexOf ["provider-ehr", "patient-portal", "provider-standalone", "patient-standalone", "backend-service"], use 0 for "provider-ehr"),
 *   patientId,
 *   providerId,
 *   encounterId,
 *   skip_login (use fixed value 0 for bool false)
 *   skip_auth (use fixed value 0 for bool false)
 *   sim_ehr (use fixed value 0 for bool false)
 *   scope,
 *   redirect_uris (comma separated),
 *   client_id,
 *   client_secret (use fixed value ""),
 *   auth_error (use fixed value ""),
 *   jwks_url (use fixed value ""),
 *   jwks (use fixed value ""),
 *   clientTypes (indexOf ["public", "confidential-symmetric", "confidential-asymmetric", "backend-service"], use 0 for "public"),
 *   PKCEValidationTypes (indexOf ["none", "auto", "always"], use 1 for "auto"),
 *   fhir_context (object but stringified),
 *   source_fhir_server,
 *   is_embedded_view (boolean)
 * ]
 *
 */
export const LAUNCH_PARAM_WITHOUT_Q = btoa(
  JSON.stringify([
    0,
    'pat-sf',
    'primary-peter',
    'health-check-pat-sf',
    0,
    0,
    0,
    'launch openid fhirUser online_access patient/AllergyIntolerance.cs patient/Condition.cs patient/Encounter.r patient/Immunization.cs patient/Medication.r patient/MedicationStatement.cs patient/Observation.cs patient/Patient.r patient/QuestionnaireResponse.crus user/Practitioner.r launch/questionnaire?role=http://ns.electronichealth.net.au/smart/role/new',
    PLAYWRIGHT_APP_URL,
    'a57d90e3-5f69-4b92-aa2e-2992180863c1',
    '',
    '',
    '',
    '',
    0,
    1,
    '',
    'https://proxy.smartforms.io/v/r4/fhir',
    false
  ])
);

export const LAUNCH_PARAM_WITH_Q = btoa(
  JSON.stringify([
    0,
    'pat-sf',
    'primary-peter',
    'health-check-pat-sf',
    0,
    0,
    0,
    'launch openid fhirUser online_access patient/AllergyIntolerance.cs patient/Condition.cs patient/Encounter.r patient/Immunization.cs patient/Medication.r patient/MedicationStatement.cs patient/Observation.cs patient/Patient.r patient/QuestionnaireResponse.crus user/Practitioner.r launch/questionnaire?role=http://ns.electronichealth.net.au/smart/role/new',
    PLAYWRIGHT_APP_URL,
    'a57d90e3-5f69-4b92-aa2e-2992180863c1',
    '',
    '',
    '',
    '',
    0,
    1,
    // Adjust version if the MBS715 questionnaire version changes
    '{"role":"http://ns.electronichealth.net.au/smart/role/new","canonical":"http://www.health.gov.au/assessments/mbs/715|0.3.0-assembled","type":"Questionnaire"}',
    'https://proxy.smartforms.io/v/r4/fhir',
    false
  ])
);
