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

import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { CodeSystemLookupPromise } from '../../interfaces/lookup.interface';
import { client } from 'fhirclient';

// Use this for QuestionnaireStore.cachedValueSetCodings
export async function addDisplayToCacheCodings(
  cachedValueSetCodings: Record<string, Coding[]>,
  terminologyServerUrl: string
): Promise<Record<string, Coding[]>> {
  // Store code system lookup promises for codings without displays
  const codeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};
  for (const key in cachedValueSetCodings) {
    const codings = cachedValueSetCodings[key];
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
  for (const key in cachedValueSetCodings) {
    const codings = cachedValueSetCodings[key];
    for (const coding of codings) {
      const lookUpKey = `system=${coding.system}&code=${coding.code}`;
      const resolvedLookup = resolvedCodeSystemLookupPromises[lookUpKey];
      if (resolvedLookup?.newCoding?.display) {
        coding.display = resolvedLookup.newCoding.display;
      }
    }
  }

  return cachedValueSetCodings;
}

export interface AnswerOptionsLookupResult {
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
  /**
   * Per-coding keys (`${system}|${code}`) where the $lookup call failed or returned no display.
   * Granular enough to show a fallback label per individual option that couldn't be resolved,
   * while leaving successfully-resolved options in the same dropdown unaffected.
   */
  lookupFailedCodingKeys: Set<string>;
}

// Use this for a Record<linkId, answerOption[]>
export async function addDisplayToAnswerOptions(
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>,
  terminologyServerUrl: string
): Promise<AnswerOptionsLookupResult> {
  // Store code system lookup promises for codings without displays.
  // Track each coding key (system|code) that needed a lookup so we can identify failures afterward.
  const codeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};
  const codingKeysNeedingLookup = new Set<string>();

  for (const key in answerOptions) {
    const options = answerOptions[key];
    for (const option of options) {
      if (option.valueCoding && !option.valueCoding.display) {
        const query = `system=${option.valueCoding.system}&code=${option.valueCoding.code}`;
        codeSystemLookupPromises[query] = {
          promise: getCodeSystemLookupPromise(query, terminologyServerUrl),
          oldCoding: option.valueCoding
        };
        codingKeysNeedingLookup.add(`${option.valueCoding.system}|${option.valueCoding.code}`);
      }
    }
  }

  // Resolves lookup promises in one go and assign newCodings to processedCodings
  const resolvedCodeSystemLookupPromises = await resolveLookupPromises(codeSystemLookupPromises);
  const lookupFailedCodingKeys = new Set<string>();

  for (const key in answerOptions) {
    const options = answerOptions[key];

    for (const option of options) {
      if (option.valueCoding) {
        const lookUpKey = `system=${option.valueCoding.system}&code=${option.valueCoding.code}`;
        const codingKey = `${option.valueCoding.system}|${option.valueCoding.code}`;
        const resolvedLookup = resolvedCodeSystemLookupPromises[lookUpKey];
        if (resolvedLookup?.newCoding?.display) {
          option.valueCoding.display = resolvedLookup.newCoding.display;
        } else if (codingKeysNeedingLookup.has(codingKey) && !option.valueCoding.display) {
          // This coding needed a lookup but still has no display — the $lookup request either
          // failed or the server returned no display value. Track it so individual options can
          // show a fallback label (e.g. "[133932002]") instead of the raw code silently.
          lookupFailedCodingKeys.add(codingKey);
        }
      }
    }
  }

  return { answerOptions, lookupFailedCodingKeys };
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
  return client({ serverUrl: terminologyServerUrl }).request({
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
  const settledPromises = await Promise.allSettled(promises);

  for (const [i, settledPromise] of settledPromises.entries()) {
    if (settledPromise.status === 'rejected') {
      continue;
    }

    const lookupResult = settledPromise.value;
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
