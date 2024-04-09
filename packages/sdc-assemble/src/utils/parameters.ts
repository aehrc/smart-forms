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

import type { OperationOutcomeIssue, Questionnaire } from 'fhir/r4';
import type { OutputParameters } from '../interfaces';

/**
 * Create output parameters with 'return' and 'outcome' field which holds the assembled questionnaire and issues/warnings respectively
 *
 * @param assembled - The assembled Questionnaire resource
 * @param issues - An OperationOutcome which consist of the warnings/info generated during the assembly process
 * @returns Output parameters resource for the $assemble operation
 *
 * @author Sean Fong
 */
export function createOutputParameters(
  assembled: Questionnaire,
  issues: OperationOutcomeIssue[]
): OutputParameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'return',
        resource: assembled
      },
      {
        name: 'outcome',
        resource: {
          resourceType: 'OperationOutcome',
          issue: issues
        }
      }
    ]
  };
}
