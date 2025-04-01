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

import type { ProcessedValueSet, ValueSetPromise } from '../../interfaces/valueSet.interface';
import { getValueSetCodings, getValueSetPromise } from '../valueSet';
import type { Coding, Questionnaire, ValueSet } from 'fhir/r4';

export function extractContainedValueSets(
  questionnaire: Questionnaire,
  terminologyServerUrl: string
): {
  processedValueSets: Record<string, ProcessedValueSet>;
  valueSetPromises: Record<string, ValueSetPromise>;
  cachedValueSetCodings: Record<string, Coding[]>;
} {
  const processedValueSets: Record<string, ProcessedValueSet> = {};
  const valueSetPromises: Record<string, ValueSetPromise> = {};
  const cachedValueSetCodings: Record<string, Coding[]> = {};

  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    return { processedValueSets, valueSetPromises, cachedValueSetCodings };
  }

  // Process contained ValueSets
  for (const entry of questionnaire.contained) {
    if (entry.resourceType !== 'ValueSet' || !entry.id) {
      continue;
    }

    // There are Codings in contained ValueSets, save into cache and skip to next iteration
    if (entry.expansion) {
      // Store contained valueSet codings
      processedValueSets[entry.id] = {
        initialValueSetUrl: entry.url ?? '',
        updatableValueSetUrl: entry.url ?? '',
        bindingParameters: [],
        isDynamic: false
      };
      cachedValueSetCodings[entry.id] = getValueSetCodings(entry);
      continue;
    }

    // Add unexpanded contained ValueSets to valueSetPromiseMap
    const valueSetUrl = getValueSetUrlFromContained(entry);
    if (valueSetUrl) {
      valueSetPromises[entry.id] = {
        promise: getValueSetPromise(valueSetUrl, terminologyServerUrl)
      };
      continue;
    }

    if (entry.url) {
      processedValueSets[entry.id] = {
        initialValueSetUrl: entry.url,
        updatableValueSetUrl: entry.url,
        bindingParameters: [],
        isDynamic: false
      };
    }
  }

  return { processedValueSets, valueSetPromises, cachedValueSetCodings };
}

/**
 * Sets an array of codings with the values from a valueSet
 *
 * @author Sean Fong
 */
export function getValueSetUrlFromContained(valueSet: ValueSet): string {
  const urls = valueSet.compose?.include?.map((include) =>
    include.valueSet?.[0] ? include.valueSet[0] : ''
  );

  return urls && urls.length > 0 ? urls[0] : '';
}
