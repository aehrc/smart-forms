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

export const TERMINOLOGY_SERVER_URL = 'https://tx.ontoserver.csiro.au/fhir';

// How long a value set expansion may take during form build before it is abandoned. This
// currently applies only to the batch $expand of answerValueSet bindings in
// resolveValueSetPromises(); other terminology calls have no timeout.
// Overridable via terminologyServerStore.setRequestOptions({ requestTimeoutMs }).
export const TERMINOLOGY_REQUEST_TIMEOUT_MS = 5000;
