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

import { HEADERS } from '../../../api/headers.ts';
import type { Bundle, Questionnaire, StructureMap } from 'fhir/r4';
import * as FHIR from 'fhirclient';
import { FORMS_SERVER_URL } from '../../../globals.ts';

export async function fetchTargetStructureMap(
  questionnaire: Questionnaire
): Promise<StructureMap | null> {
  let targetStructureMapCanonical = questionnaire.extension?.find(
    (extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap'
  )?.valueCanonical;

  if (!targetStructureMapCanonical) {
    return null;
  }

  targetStructureMapCanonical = targetStructureMapCanonical.replace('|', '&version=');
  const requestUrl = `/StructureMap?url=${targetStructureMapCanonical}&_sort=_lastUpdated`;
  const resource = await FHIR.client(FORMS_SERVER_URL).request({
    url: requestUrl,
    headers: HEADERS
  });

  // Response isn't a resource, exit early
  if (!resource.resourceType) {
    return null;
  }

  if (resource.resourceType === 'Bundle') {
    return resource.entry?.find((entry: any) => entry.resource?.resourceType === 'StructureMap')
      ?.resource as StructureMap;
  }

  if (resource.resourceType === 'StructureMap') {
    return resource as StructureMap;
  }

  return null;
}

export function extractedResourceIsBatchBundle(
  extractedResource: any
): extractedResource is Bundle {
  return (
    !!extractedResource &&
    !!extractedResource.resourceType &&
    extractedResource.resourceType === 'Bundle' &&
    (extractedResource.type === 'transaction' || extractedResource.type === 'batch')
  );
}
