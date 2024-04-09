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

import type { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import type { OutputParameters, ResponseParameter } from '../interfaces/outputParameters.interface';

/**
 * Create output parameters as a response to be returned to the renderer. If they are issues, return with an issues parameter.
 *
 * @author Sean Fong
 */
export function createOutputParameters(
  questionnaireResponse: QuestionnaireResponse,
  issues: OperationOutcomeIssue[]
): OutputParameters {
  const responseParameter: ResponseParameter = {
    name: 'response',
    resource: questionnaireResponse
  };

  if (issues.length === 0) {
    return {
      resourceType: 'Parameters',
      parameter: [responseParameter]
    };
  } else {
    return {
      resourceType: 'Parameters',
      parameter: [
        responseParameter,
        {
          name: 'issues',
          resource: {
            resourceType: 'OperationOutcome',
            issue: issues
          }
        }
      ]
    };
  }
}
