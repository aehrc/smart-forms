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

import type { OperationOutcome, Questionnaire, QuestionnaireItem } from 'fhir/r4';

/**
 * Detects a specific HTTP status code inside an issue's details.text string.
 * The fetch callback in sdc-populate sets details.text to:
 *   "HTTP error when performing <url>. Status: <code>"
 */
function detectHttpStatus(issueList: OperationOutcome['issue']): number | null {
  for (const issue of issueList ?? []) {
    const text = issue.details?.text ?? '';
    const match = text.match(/Status:\s*(\d{3})/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

/**
 * Returns true if any issue indicates a network/CORS failure (fetch threw before
 * an HTTP response was received).
 */
function hasNetworkError(issueList: OperationOutcome['issue']): boolean {
  return (issueList ?? []).some((i) => {
    const text = i.details?.text ?? '';
    return text.includes('Failed to fetch') || text.toLowerCase().includes('networkerror');
  });
}

/**
 * Returns true if any issue indicates a server-side error (HTTP 5xx).
 * These come from the FHIR server itself returning a 500/503/etc. response.
 */
function hasServerSideError(httpStatus: number | null): boolean {
  return httpStatus !== null && httpStatus >= 500 && httpStatus < 600;
}

/**
 * Returns true if any issue indicates a missing FHIRPath launch context variable.
 * This happens when a questionnaire expression references a context like %patient
 * that was never provided in the pre-fill parameters (e.g. running in playground mode
 * without a patient launch context).
 *
 * Detected from fhirpath.js's "Attempting to access an undefined environment variable" error
 * stored in issue.details.text by sdc-populate.
 */
function hasMissingContextError(issueList: OperationOutcome['issue']): boolean {
  return (issueList ?? []).some((i) => {
    const text = i.details?.text ?? '';
    return text.includes('undefined environment variable');
  });
}

/**
 * Generates a user-friendly summary of pre-fill issues suitable for display to clinicians.
 * All messages avoid technical jargon (no FHIRPath, HTTP codes, or server internals).
 *
 * Priority order:
 * 1. HTTP 429 — server rate-limited
 * 2. HTTP 403 — permission denied
 * 3. HTTP 404 — resource not found on server
 * 4. HTTP 5xx — server-side error
 * 5. Network / CORS — can't reach server at all
 * 6. not-found + invalid — server returned no data → cascade expression failure
 * 7. not-found only — server returned no data
 * 8. Missing launch context — required patient context (%patient etc.) not provided
 * 9. Default — standalone FHIRPath expression failure
 */
export function formatPopulateIssuesForUser(
  issues: OperationOutcome,
  affectedFieldCount?: number,
  debugFieldNames?: string[]
): string {
  const issueList = issues.issue ?? [];
  const httpStatus = detectHttpStatus(issueList);

  const countPart =
    affectedFieldCount !== undefined && affectedFieldCount > 0
      ? ` ${affectedFieldCount} field${affectedFieldCount === 1 ? '' : 's'} affected — please fill ${affectedFieldCount === 1 ? 'it' : 'them'} in manually.`
      : '';
  const debugPart =
    debugFieldNames && debugFieldNames.length > 0
      ? ` [Debug — affected fields: ${debugFieldNames.join(', ')}]`
      : '';
  const fieldSuffix = countPart + debugPart;

  if (httpStatus === 429) {
    return (
      'Pre-fill incomplete: the health record server is busy (too many requests). ' +
      'Please wait a moment and try pre-filling again.'
    );
  }

  if (httpStatus === 403) {
    return (
      'Pre-fill incomplete: access to health record data was denied by the server. ' +
      'Contact your administrator to check that the correct permissions have been granted.' +
      fieldSuffix
    );
  }

  if (httpStatus === 404) {
    return (
      'Pre-fill incomplete: some health record data was not found on the server. ' +
      'Check that the server supports the required resource types.' +
      fieldSuffix
    );
  }

  if (hasServerSideError(httpStatus)) {
    return (
      'Pre-fill incomplete: the health record server returned an error. ' +
      'This may be a temporary issue — please try again shortly or contact your administrator.' +
      fieldSuffix
    );
  }

  if (hasNetworkError(issueList)) {
    return (
      'Pre-fill incomplete: could not reach the health record server. ' +
      'Check your network connection and try pre-filling again.'
    );
  }

  const hasNotFound = issueList.some((i) => i.code === 'not-found');
  const hasInvalid = issueList.some((i) => i.code === 'invalid');

  if (hasNotFound && hasInvalid) {
    return (
      "Pre-fill incomplete: no matching records were found in the patient's health history " +
      'for some fields, so those fields could not be pre-filled.' +
      fieldSuffix
    );
  }

  if (hasNotFound) {
    return (
      "Pre-fill incomplete: no matching records were found in the patient's health history " +
      'for some fields. Check that the server supports the required resource types and that ' +
      'permission has been granted.' +
      fieldSuffix
    );
  }

  if (hasMissingContextError(issueList)) {
    return (
      'Pre-fill incomplete: some required patient context was not available in this session ' +
      '(e.g. the patient record was not provided to the pre-fill service). ' +
      'Affected fields could not be pre-filled.' +
      fieldSuffix
    );
  }

  return (
    "Pre-fill incomplete: some fields' pre-fill calculations could not be completed. " +
    'The required health record data may be unavailable.' +
    fieldSuffix
  );
}

/**
 * Builds a Map of questionnaire item linkId → inline warning message for every field
 * whose pre-fill failed. The message is chosen per-field based on the root cause:
 *
 * - `not-found` issues present → downstream cascade; field message says data wasn't in health history.
 * - `invalid` issue whose details.text contains "undefined environment variable" → the required
 *   launch context (%patient etc.) was missing; field message names that specifically.
 * - All other `invalid`-only cases → generic expression failure message.
 *
 * Only `invalid`-coded issues carry a linkId (set by `createInvalidWarningIssue` in sdc-populate).
 * `not-found` issues are resource-level and are not tied to a single item.
 */
export function extractWarningMessages(issues: OperationOutcome): Map<string, string> {
  const issueList = issues.issue ?? [];
  const hasNotFound = issueList.some((i) => i.code === 'not-found');

  const messages = new Map<string, string>();
  for (const issue of issueList) {
    if (issue.code === 'invalid' && issue.expression) {
      let fieldMessage: string;

      if (hasNotFound) {
        // Expression failed because a required resource was not returned by the server
        fieldMessage =
          "Could not be pre-filled: no matching records were found in the patient's health history for this field.";
      } else if ((issue.details?.text ?? '').includes('undefined environment variable')) {
        // Expression failed because a launch context variable (%patient etc.) was not provided
        fieldMessage =
          'Could not be pre-filled: required patient context was not available in this session.';
      } else {
        // Standalone expression evaluation failure
        fieldMessage =
          "Could not be pre-filled: this field's pre-fill calculation could not be completed.";
      }

      for (const expr of issue.expression) {
        messages.set(expr, fieldMessage);
      }
    }
  }
  return messages;
}

/**
 * Traverses the questionnaire tree and returns a qualified label for each linkId that appears
 * in `linkIds`. When the item lives inside a group, the immediate parent group name is prepended
 * (e.g. "Body height › Value") so that generic names like "Value" or "Date performed" are
 * unambiguous in the snackbar debug list.
 */
export function getWarningFieldNames(questionnaire: Questionnaire, linkIds: Set<string>): string[] {
  const names: string[] = [];

  function traverse(items: QuestionnaireItem[] | undefined, parentGroupName?: string): void {
    for (const item of items ?? []) {
      if (linkIds.has(item.linkId)) {
        const label = item.text ?? item.linkId;
        names.push(parentGroupName ? `${parentGroupName} › ${label}` : label);
      }
      // Only group items provide meaningful parent context for their children
      const nextParent = item.type === 'group' ? (item.text ?? item.linkId) : parentGroupName;
      traverse(item.item, nextParent);
    }
  }

  traverse(questionnaire.item);
  return names;
}
