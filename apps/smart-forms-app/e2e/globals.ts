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

export const PLAYWRIGHT_EHR_URL = 'https://proxy.smartforms.io/v/r4/fhir';
export const PLAYWRIGHT_FORMS_SERVER_URL = 'https://smartforms.csiro.au/api/fhir';

export const PLAYWRIGHT_APP_URL = process.env.CI
  ? 'http://localhost:4173'
  : 'http://localhost:5173';

export const LAUNCH_PARAM_WITHOUT_Q = btoa(
  JSON.stringify([
    0,
    'pat-sf',
    'primary-peter',
    'AUTO',
    0,
    0,
    0,
    'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs',
    PLAYWRIGHT_APP_URL,
    'a57d90e3-5f69-4b92-aa2e-2992180863c1',
    '',
    '',
    '',
    '',
    0,
    1,
    '',
    false
  ])
);

export const LAUNCH_PARAM_WITH_Q = btoa(
  JSON.stringify([
    0,
    'pat-sf',
    'primary-peter',
    'AUTO',
    0,
    0,
    0,
    'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs',
    PLAYWRIGHT_APP_URL,
    'a57d90e3-5f69-4b92-aa2e-2992180863c1',
    '',
    '',
    '',
    '',
    0,
    1,
    '{"role":"questionnaire-render-on-launch","canonical":"http://www.health.gov.au/assessments/mbs/715|0.2.0-assembled","type":"Questionnaire"}',
    false
  ])
);
