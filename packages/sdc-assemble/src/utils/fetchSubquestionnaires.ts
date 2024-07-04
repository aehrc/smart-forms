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

import type { Bundle, OperationOutcome, OperationOutcomeIssue, Questionnaire } from 'fhir/r4';
import { createErrorOutcome, createSubquestionnaireNotFoundErrorOutcome } from './operationOutcome';
import type { FetchQuestionnaireCallback } from '../interfaces';

/**
 * Fetches subquestionnaires from a FHIR server via a callback function defined by the implementer
 *
 * @param canonicals - An array of subquestionnaire canonical urls to be fetched
 * @param issues - An array of OperationOutcome warnings
 * @param fetchQuestionnaireCallback - A callback function defined by the implementer to fetch Questionnaire resources by a canonical url
 * @param fetchQuestionnaireRequestConfig - A request configuration object to be passed to the callback function
 * @returns A promise that resolves to an array of subquestionnaire resources or an OperationOutcome error
 *
 * @author Sean Fong
 */
export async function fetchSubquestionnaires(
  canonicals: string[],
  issues: OperationOutcomeIssue[],
  fetchQuestionnaireCallback: FetchQuestionnaireCallback,
  fetchQuestionnaireRequestConfig: any
): Promise<Questionnaire[] | OperationOutcome> {
  // Gather all promises to be executed at once
  const promises = canonicals.map((canonical) =>
    fetchQuestionnaireCallback(canonical.replace('|', '&version='), fetchQuestionnaireRequestConfig)
  );

  const resources: (Bundle | OperationOutcome)[] = [];
  try {
    const settledPromises = await Promise.allSettled(promises);
    for (const [, settledPromise] of settledPromises.entries()) {
      if (settledPromise.status === 'rejected') {
        issues.push({
          severity: 'warning',
          code: 'not-found',
          details: { text: settledPromise.reason.message }
        });
        continue;
      }

      // Get lookupResult from response (fhirClient and fetch scenario)
      if (responseIsBundle(settledPromise.value)) {
        resources.push(settledPromise.value);
        continue;
      }
      // Fallback to get valueSet from response.data (axios scenario)
      if (settledPromise.value.data && responseIsBundle(settledPromise.value.data)) {
        resources.push(settledPromise.value);
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      return createErrorOutcome(e.message);
    }
  }

  // Gather subquestionnaires from the bundles
  const subquestionnaires = [];
  for (const [i, resource] of resources.entries()) {
    if (resource.resourceType === 'Bundle') {
      // Get the first subquestionnaire from the bundle
      if (!resource.entry?.[0]) {
        return createSubquestionnaireNotFoundErrorOutcome(canonicals[i] ?? '');
      }

      const subquestionnaire = resource.entry[0].resource;
      if (!subquestionnaire || subquestionnaire.resourceType !== 'Questionnaire') {
        return createSubquestionnaireNotFoundErrorOutcome(canonicals[i] ?? '');
      }
      subquestionnaires.push(subquestionnaire);
    } else {
      // Return an error if one of the resources is an OperationOutcome
      return resource.resourceType === 'OperationOutcome'
        ? resource
        : createErrorOutcome(
            `Bundle received while fetching questionnaire ${canonicals[i]} is invalid.`
          );
    }
  }

  return subquestionnaires;
}

export function responseIsBundle(response: any): response is Bundle {
  return response && response.resourceType === 'Bundle';
}
