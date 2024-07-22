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

import type { Bundle, BundleEntry, Questionnaire, StructureMap } from 'fhir/r4b';
import { HEADERS } from './globals';

export function getTargetStructureMapCanonical(questionnaire: Questionnaire): string | null {
  return (
    questionnaire.extension?.find(
      (extension) =>
        extension.url ===
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap' &&
        !!extension.valueCanonical
    )?.valueCanonical ?? null
  );
}

export async function getTargetStructureMap(
  structureMapCanonical: string,
  formsServerUrl: string,
  formsServerAuthToken?: string
): Promise<StructureMap | null> {
  structureMapCanonical = structureMapCanonical.replace('|', '&version=');

  const requestUrl = `${formsServerUrl}/StructureMap?url=${structureMapCanonical}&_sort=_lastUpdated`;
  const headers = formsServerAuthToken
    ? { ...HEADERS, Authorization: `Bearer ${formsServerAuthToken}` }
    : HEADERS;
  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (resultIsStructureMapOrBundle(result)) {
    if (result.resourceType === 'StructureMap') {
      return result;
    }

    if (result.resourceType === 'Bundle') {
      const firstStructureMap = result.entry
        ?.filter(
          (entry): entry is BundleEntry<StructureMap> =>
            entry.resource?.resourceType === 'StructureMap'
        )
        .map((entry) => entry.resource)
        .find((structureMap) => !!structureMap);

      if (firstStructureMap) {
        return firstStructureMap;
      }
    }
  }

  return null;
}

function resultIsStructureMapOrBundle(result: any): result is StructureMap | Bundle {
  return (
    result.resourceType &&
    (result.resourceType === 'StructureMap' || result.resourceType === 'Bundle')
  );
}
