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

import type { FhirContext } from '../interfaces/fhirContext.interface';
import type { FhirResource } from 'fhir/r4';
import type {
  FetchResourceCallback,
  FetchResourceRequestConfig
} from '../../SDCPopulateQuestionnaireOperation';
import { addTimeoutToPromise } from './populateQuestionnaire';

/**
 * Resolves FHIR context references by fetching each referenced resource asynchronously.
 * Returns a map of context type to fetched FHIR resource, enabling context-aware population.
 */
export async function resolveFhirContextReferences(
  fhirContext: FhirContext[] | null,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  timeoutMs: number
): Promise<Record<string, FhirResource>> {
  if (!fhirContext || fhirContext.length === 0) {
    return {};
  }

  // Filter contexts that have a internal `reference`
  const contextsWithReferences = fhirContext.filter((ctx) => typeof ctx.reference === 'string');

  // Define fhirContext-fetch promises
  const promises = contextsWithReferences.map((ctx) =>
    addTimeoutToPromise(
      fetchResourceCallback(ctx.reference ?? '', fetchResourceRequestConfig),
      timeoutMs
    )
  );

  const settledPromises = await Promise.allSettled(promises);

  const fhirContextReferenceMap: Record<string, FhirResource> = {};
  for (const [i, settledPromise] of settledPromises.entries()) {
    const context = contextsWithReferences[i];

    // This should never happen
    if (!context) {
      continue;
    }

    // If no type set in context, determine resource type from reference
    const type = context.type ?? context.reference?.split('/')[0];

    if (settledPromise.status === 'fulfilled' && type) {
      // This assumes that there is one resource per resourceType in fhirContext
      fhirContextReferenceMap[type] = settledPromise.value as FhirResource;
    }

    if (settledPromise.status === 'rejected') {
      console.warn(
        `SDC-Populate issue: fhirContext with reference "${context?.reference}" could not be resolved.\nError: ${settledPromise.reason}`
      );
    }
  }

  return fhirContextReferenceMap;
}
