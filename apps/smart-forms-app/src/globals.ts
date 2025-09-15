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

import { configLoader } from './utils/configLoader';

// Configuration values with priority: Environment Variables > Mounted Config File > Default Values
export const TERMINOLOGY_SERVER_URL = configLoader.getStringValue(
  'VITE_ONTOSERVER_URL',
  'terminology_server_url',
  'https://tx.ontoserver.csiro.au/fhir'
);

export const FORMS_SERVER_URL = configLoader.getStringValue(
  'VITE_FORMS_SERVER_URL',
  'forms_server_url',
  'https://smartforms.csiro.au/api/fhir'
);

export const LAUNCH_SCOPE = configLoader.getStringValue(
  'VITE_LAUNCH_SCOPE',
  'launch_scope',
  'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs'
);

export const LAUNCH_CLIENT_ID = configLoader.getStringValue(
  'VITE_LAUNCH_CLIENT_ID',
  'client_id',
  'smart-forms-client-id'
);

export const IN_APP_POPULATE = configLoader.getBooleanValue(
  'VITE_IN_APP_POPULATE',
  'in_app_populate',
  true
);

// Non-environment variables, but still global constants
export const NUM_OF_QUESTIONNAIRES_TO_FETCH = 500;
export const NUM_OF_EXISTING_RESPONSES_TO_FETCH = 200;

export const NUM_OF_PATIENTS_TO_FETCH_PLAYGROUND = 100;
export const NUM_OF_PRACTITIONERS_TO_FETCH_PLAYGROUND = 100;
