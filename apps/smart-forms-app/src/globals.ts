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

// Configuration will be loaded from config.json at runtime
// These are fallback values that will be used if config.json is not available
export const DEFAULT_TERMINOLOGY_SERVER_URL = 'https://tx.ontoserver.csiro.au/fhir';
export const DEFAULT_FORMS_SERVER_URL = 'https://smartforms.csiro.au/api/fhir';
export const DEFAULT_LAUNCH_SCOPE = 'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs';
export const DEFAULT_LAUNCH_CLIENT_ID = 'smart-forms-client-id';
export const DEFAULT_IN_APP_POPULATE = true;
export const DEFAULT_ENABLE_DYNAMIC_CLIENT_REGISTRATION = true;
export const DEFAULT_DYNAMIC_REGISTRATION_FALLBACK_ENABLED = true;
export const DEFAULT_ADDITIONAL_REDIRECT_URIS = '';

// Legacy exports for backward compatibility - these will be replaced by config loader
export const TERMINOLOGY_SERVER_URL = DEFAULT_TERMINOLOGY_SERVER_URL;
export const FORMS_SERVER_URL = DEFAULT_FORMS_SERVER_URL;
export const LAUNCH_SCOPE = DEFAULT_LAUNCH_SCOPE;
export const LAUNCH_CLIENT_ID = DEFAULT_LAUNCH_CLIENT_ID;
export const IN_APP_POPULATE = DEFAULT_IN_APP_POPULATE;
export const ENABLE_DYNAMIC_CLIENT_REGISTRATION = DEFAULT_ENABLE_DYNAMIC_CLIENT_REGISTRATION;
export const DYNAMIC_REGISTRATION_FALLBACK_ENABLED = DEFAULT_DYNAMIC_REGISTRATION_FALLBACK_ENABLED;
export const ADDITIONAL_REDIRECT_URIS = DEFAULT_ADDITIONAL_REDIRECT_URIS;

// Non-environment variables, but still global constants
export const NUM_OF_QUESTIONNAIRES_TO_FETCH = 500;
export const NUM_OF_EXISTING_RESPONSES_TO_FETCH = 200;

export const NUM_OF_PATIENTS_TO_FETCH_PLAYGROUND = 100;
export const NUM_OF_PRACTITIONERS_TO_FETCH_PLAYGROUND = 100;
