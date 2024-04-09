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

import type { ValueSetPromise } from '../../interfaces/valueSet.interface';
import { getValueSetCodings, getValueSetPromise } from '../valueSet';
import type { Coding, Questionnaire, ValueSet } from 'fhir/r4';

export function extractContainedValueSets(
  questionnaire: Questionnaire,
  terminologyServerUrl: string
): {
  processedValueSetCodings: Record<string, Coding[]>;
  processedValueSetUrls: Record<string, string>;
  valueSetPromises: Record<string, ValueSetPromise>;
} {
  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    return { processedValueSetCodings: {}, processedValueSetUrls: {}, valueSetPromises: {} };
  }

  // Process contained ValueSets
  const processedValueSetCodings: Record<string, Coding[]> = {};
  const processedValueSetUrls: Record<string, string> = {};
  const valueSetPromises: Record<string, ValueSetPromise> = {};
  for (const entry of questionnaire.contained) {
    if (entry.resourceType !== 'ValueSet' || !entry.id) {
      continue;
    }

    if (entry.expansion) {
      // Store contained valueSet codings
      processedValueSetCodings[entry.id] = getValueSetCodings(entry);
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
      processedValueSetUrls[entry.id] = entry.url;
    }
  }

  return { processedValueSetCodings, processedValueSetUrls, valueSetPromises };
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
