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

import type { OperationOutcome } from 'fhir/r4';

/**
 * Generates a user-friendly summary of prepopulation issues suitable for display to clinicians.
 *
 * Issues come in two main types:
 * - `not-found`: the server did not return the requested resource (no data, permission denied,
 *   or resource type not supported by the server).
 * - `invalid`: a pre-population FHIRPath expression could not be evaluated, typically because
 *   its source data was not available (often a downstream consequence of a `not-found` issue).
 *
 * The message is intentionally non-technical so that clinicians understand why some fields
 * are blank after prepopulation, without needing to consult the developer console.
 */
export function formatPopulateIssuesForUser(issues: OperationOutcome): string {
  const issueList = issues.issue ?? [];
  const hasNotFound = issueList.some((i) => i.code === 'not-found');
  const hasInvalid = issueList.some((i) => i.code === 'invalid');

  if (hasNotFound && !hasInvalid) {
    return (
      'Some fields could not be pre-populated. The server did not return the requested data — ' +
      'check that the server supports the required resource types and that permission has been granted.'
    );
  }

  if (hasNotFound) {
    return (
      'Some fields could not be pre-populated. The server did not return the requested data ' +
      '(check permissions and resource type support), and some pre-population expressions could ' +
      'not be evaluated as a result. Affected fields will need to be filled in manually.'
    );
  }

  return (
    'Some fields could not be pre-populated. Pre-population expressions could not be fully ' +
    'evaluated. Affected fields will need to be filled in manually.'
  );
}
