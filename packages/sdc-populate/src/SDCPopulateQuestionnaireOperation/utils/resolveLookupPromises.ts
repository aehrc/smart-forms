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

import type { CodeSystemLookupPromise } from '../interfaces/expressions.interface';
import type { LookupResponse } from '../api/lookupCodeSystem';
import { lookupResponseIsValid } from '../api/lookupCodeSystem';

export async function resolveLookupPromises(
  codeSystemLookupPromises: Record<string, CodeSystemLookupPromise>
): Promise<Record<string, CodeSystemLookupPromise>> {
  const newCodeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};

  const lookupPromiseKeys = Object.keys(codeSystemLookupPromises);
  const lookupPromiseValues = Object.values(codeSystemLookupPromises);

  const promises = lookupPromiseValues.map((lookupPromise) => lookupPromise.promise);
  const settledPromises = await Promise.allSettled(promises);

  for (const [i, settledPromise] of settledPromises.entries()) {
    if (settledPromise.status === 'rejected') {
      continue;
    }

    let lookupResult: LookupResponse | null = null;

    // Get lookupResult from response (fhirClient and fetch scenario)
    if (lookupResponseIsValid(settledPromise.value)) {
      lookupResult = settledPromise.value;
    }
    // Fallback to get valueSet from response.data (axios scenario)
    if (
      !lookupResult &&
      settledPromise.value.data &&
      lookupResponseIsValid(settledPromise.value.data)
    ) {
      lookupResult = settledPromise.value.data;
    }

    if (!lookupResult) {
      continue;
    }

    const key = lookupPromiseKeys[i];
    const lookupPromise = lookupPromiseValues[i];

    if (key && lookupPromise) {
      lookupPromise.newCoding = {
        ...lookupPromise.oldCoding,
        display: lookupResult.parameter.find((p) => p.name === 'display')?.valueString ?? undefined
      };
      newCodeSystemLookupPromises[key] = lookupPromise;
    }
  }

  return newCodeSystemLookupPromises;
}
