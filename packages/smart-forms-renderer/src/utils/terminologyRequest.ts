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

import { client } from 'fhirclient';
import { terminologyServerStore } from '../stores/terminologyServerStore';

/**
 * Performs a single terminology request and resolves with the parsed JSON body.
 *
 * This is the one seam through which every terminology request the renderer makes passes,
 * covering `ValueSet/$expand`, `ValueSet/$validate-code` and `CodeSystem/$lookup`.
 * By default it uses the built-in `fhirclient` transport. When a consumer has supplied a
 * `fetchTerminologyCallback` via `terminologyServerStore.getState().setRequestOptions()`, that
 * callback is used instead, which lets hosts without a browser `fetch` (React Native, for example)
 * route terminology traffic through their own HTTP client.
 *
 * @param query - The request relative to the terminology server, e.g. `ValueSet/$expand?url=...`
 * @param terminologyServerUrl - Base URL of the terminology server this request is directed at
 * @returns A promise of the parsed response body
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function terminologyRequest(query: string, terminologyServerUrl: string): Promise<any> {
  const { fetchTerminologyCallback } = terminologyServerStore.getState();

  if (fetchTerminologyCallback) {
    return fetchTerminologyCallback(query, { terminologyServerUrl });
  }

  return client({ serverUrl: terminologyServerUrl }).request({ url: query });
}

/**
 * Returns the timeout, in milliseconds, that a single terminology request is allowed to take.
 * Defaults to 5000, overridable via `terminologyServerStore.getState().setRequestOptions()`.
 */
export function getTerminologyRequestTimeoutMs(): number {
  return terminologyServerStore.getState().requestTimeoutMs;
}
