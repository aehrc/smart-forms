/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import type { AssembleOutputParameters, AssembleOutputParametersWithIssues } from './Interfaces';

/**
 * Create output parameters as a response to be returned to the renderer without any issues.
 *
 * @author Sean Fong
 */
export function createOutputParameters(assembled: Questionnaire): AssembleOutputParameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'return',
        resource: assembled
      }
    ]
  };
}

/**
 * Create output parameters as a response to be returned to the renderer with issues.
 *
 * @author Sean Fong
 */
export function createOutputParametersWithIssues(
  outcome: OperationOutcome
): AssembleOutputParametersWithIssues {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'outcome',
        resource: outcome
      }
    ]
  };
}
