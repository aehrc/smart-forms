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

import type { OperationOutcome } from 'fhir/r4b';
import type { IssuesParameter } from '@aehrc/sdc-populate';

export function createInvalidParametersOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Parameters provided is invalid against the $populate specification.' }
      }
    ]
  };
}

export function createOperationOutcome(errorMessage: string): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: errorMessage
        }
      }
    ]
  };
}

export function addEndpointToNotFoundIssues(
  issuesParameter: IssuesParameter,
  ehrServerUrl: string
): IssuesParameter {
  if (issuesParameter?.resource && issuesParameter.resource.issue.length > 0) {
    issuesParameter.resource.issue.forEach((issue) => {
      if (issue.code === 'not-found' && issue.details?.text) {
        issue.details.text += ` at ${ehrServerUrl}. You might have to resolve it manually and pass the context as a resource instead of a reference.`;
      }
    });
  }

  return issuesParameter;
}
