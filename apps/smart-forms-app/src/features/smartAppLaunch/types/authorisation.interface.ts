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

export interface AuthState {
  hasClient: boolean | null;
  hasUser: boolean | null;
  hasPatient: boolean | null;
  hasQuestionnaire: boolean | null;
  errorMessage: string | null;
}

export type AuthActions =
  | { type: 'UPDATE_HAS_CLIENT'; payload: boolean }
  | { type: 'UPDATE_HAS_USER'; payload: boolean }
  | { type: 'UPDATE_HAS_PATIENT'; payload: boolean }
  | { type: 'UPDATE_HAS_QUESTIONNAIRE'; payload: boolean }
  | { type: 'FAIL_AUTH'; payload: string };
