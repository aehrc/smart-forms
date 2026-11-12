/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
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

import type { Bundle, OperationOutcomeIssue } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { HEADERS } from '../../../api/headers.ts';
import { responseIsOperationOutcome } from '../../../utils/operationOutcome.ts';

/**
 * Calls $validate for each bundle entry and returns a map of entry index to its error/fatal
 * issues, for the entries that have any. Resources are sent wrapped in a Parameters envelope, which is valid
 * for all resource types including FHIRPatch (Parameters) entries.
 * If the server does not support $validate, the entry is treated as valid (best-effort).
 */
export async function validateExtractedBundle(
  bundle: Bundle,
  smartClient: Client
): Promise<Map<number, OperationOutcomeIssue[]>> {
  const invalidEntryIssues = new Map<number, OperationOutcomeIssue[]>();
  const entries = bundle.entry ?? [];

  await Promise.all(
    entries.map(async (entry, index) => {
      const resource = entry.resource;
      if (!resource || !entry.request) return;

      try {
        const response = await smartClient.request({
          url: `${resource.resourceType}/$validate`,
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({
            resourceType: 'Parameters',
            parameter: [{ name: 'resource', resource }]
          })
        });

        const errorIssues = responseIsOperationOutcome(response)
          ? (response.issue ?? []).filter((i) => i.severity === 'error' || i.severity === 'fatal')
          : [];
        if (errorIssues.length > 0) {
          console.warn(
            `$validate errors for ${resource.resourceType} at bundle index ${index}:`,
            response
          );
          invalidEntryIssues.set(index, errorIssues);
        }
      } catch (e) {
        console.warn(
          `$validate not supported or failed for ${resource.resourceType} — skipping validation`,
          e
        );
      }
    })
  );

  return invalidEntryIssues;
}
