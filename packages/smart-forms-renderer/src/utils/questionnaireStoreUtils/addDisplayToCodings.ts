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

import type { Coding } from 'fhir/r4';
import type { CodeSystemLookupPromise } from '../../interfaces/lookup.interface';
import * as FHIR from 'fhirclient';

// Use this for QuestionnaireStore.ProcessedCodings
export async function addDisplayToProcessedCodings(
  processedCodings: Record<string, Coding[]>,
  terminologyServerUrl: string
): Promise<Record<string, Coding[]>> {
  // Store code system lookup promises for codings without displays
  const codeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};
  for (const key in processedCodings) {
    const codings = processedCodings[key];
    for (const coding of codings) {
      if (!coding.display) {
        const query = `system=${coding.system}&code=${coding.code}`;
        codeSystemLookupPromises[query] = {
          promise: getCodeSystemLookupPromise(query, terminologyServerUrl),
          oldCoding: coding
        };
      }
    }
  }

  // Resolves lookup promises in one go and assign newCodings to processedCodings
  const resolvedCodeSystemLookupPromises = await resolveLookupPromises(codeSystemLookupPromises);
  for (const key in processedCodings) {
    const codings = processedCodings[key];

    for (const coding of codings) {
      const lookUpKey = `system=${coding.system}&code=${coding.code}`;
      const resolvedLookup = resolvedCodeSystemLookupPromises[lookUpKey];
      if (resolvedLookup?.newCoding?.display) {
        coding.display = resolvedLookup.newCoding.display;
      }
    }
  }

  return processedCodings;
}

// Use this for an array of codings
export async function addDisplayToCodingArray(
  codings: Coding[],
  terminologyServerUrl: string
): Promise<Coding[]> {
  // Store code system lookup promises for codings without displays
  const codeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};
  for (const coding of codings) {
    if (!coding.display) {
      const query = `system=${coding.system}&code=${coding.code}`;
      codeSystemLookupPromises[query] = {
        promise: getCodeSystemLookupPromise(query, terminologyServerUrl),
        oldCoding: coding
      };
    }
  }

  // Resolves lookup promises in one go and assign newCodings to processedCodings
  const resolvedCodeSystemLookupPromises = await resolveLookupPromises(codeSystemLookupPromises);
  for (const coding of codings) {
    const lookUpKey = `system=${coding.system}&code=${coding.code}`;
    const resolvedLookup = resolvedCodeSystemLookupPromises[lookUpKey];
    if (resolvedLookup?.newCoding?.display) {
      coding.display = resolvedLookup.newCoding.display;
    }
  }

  return codings;
}

export function getCodeSystemLookupPromise(query: string, terminologyServerUrl: string) {
  return FHIR.client({ serverUrl: terminologyServerUrl }).request({
    url: `CodeSystem/$lookup?${query}`
  });
}

export async function resolveLookupPromises(
  codeSystemLookupPromises: Record<string, CodeSystemLookupPromise>
): Promise<Record<string, CodeSystemLookupPromise>> {
  const newCodeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};

  const lookupPromiseKeys = Object.keys(codeSystemLookupPromises);
  const lookupPromiseValues = Object.values(codeSystemLookupPromises);

  const promises = lookupPromiseValues.map((lookupPromise) => lookupPromise.promise);
  const lookupResults = await Promise.all(promises);

  for (const [i, lookupResult] of lookupResults.entries()) {
    if (!lookupResponseIsValid(lookupResult)) {
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

export interface LookupResponse {
  parameter: [DisplayParameter];
}

export interface DisplayParameter {
  name: 'display';
  valueString: string;
}

export function lookupResponseIsValid(response: any): response is LookupResponse {
  return (
    response &&
    response.resourceType === 'Parameters' &&
    response.parameter &&
    response.parameter.find((p: any) => p.name === 'display') &&
    response.parameter.find((p: any) => p.name === 'display').valueString
  );
}
