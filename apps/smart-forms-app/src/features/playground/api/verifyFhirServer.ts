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

import * as FHIR from 'fhirclient';
import { HEADERS } from '../../../api/headers.ts';
import type { CapabilityStatement } from 'fhir/r4';

export async function verifyFhirServer(
  endpointUrl: string
): Promise<{ isValidFhirServer: boolean; feedbackMessage: string }> {
  try {
    const metadata = await FHIR.client(endpointUrl).request({
      url: 'metadata',
      headers: HEADERS
    });

    return metadataResponseIsValid(metadata)
      ? { isValidFhirServer: true, feedbackMessage: 'URL validated' }
      : { isValidFhirServer: false, feedbackMessage: 'URL provided is not a FHIR Server' };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : e?.toString();
    return {
      isValidFhirServer: false,
      feedbackMessage: errorMessage ?? 'An unknown error occurred'
    };
  }
}

export function metadataResponseIsValid(response: any): response is CapabilityStatement {
  return response && response.resourceType === 'CapabilityStatement';
}
