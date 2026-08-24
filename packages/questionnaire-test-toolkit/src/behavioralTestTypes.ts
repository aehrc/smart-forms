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

import type { Patient, Questionnaire } from 'fhir/r4';
import type { InAppExtractOutput } from '@aehrc/sdc-template-extract';

export type RequestDefinition = {
  urlPrefix: string;
  params?: Record<string, string>;
  responseBody: unknown;
};

export interface BehavioralTestWrapperProps {
  patient?: Patient;
  requestDefinitions?: RequestDefinition[];
  onExtractResult?: (extractResult: InAppExtractOutput) => void;
  questionnaire: Questionnaire;
}
