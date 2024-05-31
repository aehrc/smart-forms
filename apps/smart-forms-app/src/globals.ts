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

export const TERMINOLOGY_SERVER_URL =
  import.meta.env.VITE_ONTOSERVER_URL ?? 'https://tx.ontoserver.csiro.au/fhir';
export const FORMS_SERVER_URL =
  import.meta.env.VITE_FORMS_SERVER_URL ?? 'https://smartforms.csiro.au/api/fhir';
export const LAUNCH_SCOPE =
  import.meta.env.VITE_LAUNCH_SCOPE ??
  'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs';
export const LAUNCH_CLIENT_ID = import.meta.env.VITE_LAUNCH_CLIENT_ID ?? 'smart-forms-client-id';
export const IN_APP_POPULATE = import.meta.env.VITE_IN_APP_POPULATE ?? true;
