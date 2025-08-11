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
import type { ReferenceContext, ResourceContext } from '../interfaces/inputParameters.interface';
import type { BundleEntry, FhirResource } from 'fhir/r4';
import type { FetchResourceCallback, FetchResourceRequestConfig } from '../interfaces';
import { createInvalidWarningIssue } from './operationOutcome';

/**
 * Creates a tuple for a reference context, including a promise to fetch the referenced resource.
 * Returns a warning issue if the reference is missing, helping to validate input parameters.
 */
export function createReferenceContextTuple(
  referenceContext: ReferenceContext,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig
): [ReferenceContext, Promise<any>, FhirResource | null] {
  const query = referenceContext.part[1]?.valueReference?.reference;

  if (!query) {
    return [
      referenceContext,
      Promise.resolve(
        createInvalidWarningIssue(
          `Reference Context ${
            referenceContext.part[0]?.valueString ?? ''
          } does not contain a reference`
        )
      ),
      null
    ];
  }

  return [referenceContext, fetchResourceCallback(query, fetchResourceRequestConfig), null];
}

/**
 * Creates a tuple for a resource context using a bundle entry and a fetch callback.
 * Returns a warning issue if the bundle entry does not contain a request, ensuring proper validation.
 */
export function createResourceContextTuple(
  resourceContext: ResourceContext,
  bundleEntry: BundleEntry,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig
): [ResourceContext, Promise<any>, FhirResource | null] {
  const query = bundleEntry.request?.url;

  if (!query) {
    const resourceContextName = resourceContext.part[0]?.valueString;
    return [
      resourceContext,
      Promise.resolve(
        createInvalidWarningIssue(
          `${resourceContextName} bundle entry ${
            bundleEntry.fullUrl ?? ''
          } does not contain a request`
        )
      ),
      null
    ];
  }

  return [resourceContext, fetchResourceCallback(query, fetchResourceRequestConfig), null];
}
