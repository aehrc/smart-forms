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

import { createStore } from 'zustand/vanilla';
import { createSelectors } from './selector';
import { TERMINOLOGY_REQUEST_TIMEOUT_MS, TERMINOLOGY_SERVER_URL } from '../globals';
import type { FetchTerminologyCallback } from '@aehrc/sdc-populate';

/**
 * Options that control how the renderer talks to a terminology server.
 * Every property is optional, anything left out keeps its current value.
 *
 * @property fetchTerminologyCallback - Transport used for every terminology request the renderer makes
 *   (`ValueSet/$expand`, `ValueSet/$validate-code` and `CodeSystem/$lookup`).
 *   Leave this unset (or `null`) to use the built-in `fhirclient` transport, which is the default.
 *   Supply a callback to route terminology traffic through your own HTTP client, which is what
 *   non-browser hosts such as React Native need. The callback is given the request as a query string
 *   relative to the terminology server, e.g. `ValueSet/$expand?url=...`, plus a request config
 *   carrying the `terminologyServerUrl` the renderer resolved for that call. It must resolve with the
 *   parsed JSON body of the response, and reject on a transport or HTTP error.
 *   This is the same callback shape `@aehrc/sdc-populate` accepts, so one implementation can serve both.
 *
 * @property requestTimeoutMs - How long a value set expansion may take during form build before it
 *   is abandoned. Applies only to the batch `$expand` of `answerValueSet` bindings; `$validate-code`
 *   and `CodeSystem/$lookup` are not timed.
 *   - Default: `5000`
 */
export interface TerminologyRequestOptions {
  fetchTerminologyCallback?: FetchTerminologyCallback | null;
  requestTimeoutMs?: number;
}

/**
 * TerminologyServerStore properties and methods
 * Properties can be accessed for fine-grain details.
 * Methods are usually used internally, using them from an external source is not recommended.
 *
 * @property url - The current terminology server URL
 * @property fetchTerminologyCallback - The injected terminology transport, or `null` to use the built-in `fhirclient` one
 * @property requestTimeoutMs - The timeout applied to build-time batch value set expansion, in milliseconds
 * @property setUrl - Set the terminology server URL
 * @property resetUrl - Reset the terminology server URL to the default
 * @property setRequestOptions - Set one or more terminology request options, leaving the rest untouched
 * @property resetRequestOptions - Reset every terminology request option to its default
 *
 * @author Sean Fong
 */
export interface TerminologyServerStoreType {
  url: string;
  fetchTerminologyCallback: FetchTerminologyCallback | null;
  requestTimeoutMs: number;
  setUrl: (newUrl: string) => void;
  resetUrl: () => void;
  setRequestOptions: (options: TerminologyRequestOptions) => void;
  resetRequestOptions: () => void;
}

/**
 * Terminology server state management store. This is used for resolving valueSets externally.
 * Defaults to use https://tx.ontoserver.csiro.au/fhir.
 * This is the vanilla version of the store which can be used in non-React environments.
 * @see {@link TerminologyServerStoreType} for available properties and methods.
 *
 * @author Sean Fong
 */
export const terminologyServerStore = createStore<TerminologyServerStoreType>()((set) => ({
  url: TERMINOLOGY_SERVER_URL,
  fetchTerminologyCallback: null,
  requestTimeoutMs: TERMINOLOGY_REQUEST_TIMEOUT_MS,
  setUrl: (newUrl: string) => set(() => ({ url: newUrl })),
  resetUrl: () => set(() => ({ url: TERMINOLOGY_SERVER_URL })),
  setRequestOptions: (options: TerminologyRequestOptions) =>
    set((state) => ({
      fetchTerminologyCallback:
        options.fetchTerminologyCallback === undefined
          ? state.fetchTerminologyCallback
          : options.fetchTerminologyCallback,
      requestTimeoutMs: options.requestTimeoutMs ?? state.requestTimeoutMs
    })),
  resetRequestOptions: () =>
    set(() => ({
      fetchTerminologyCallback: null,
      requestTimeoutMs: TERMINOLOGY_REQUEST_TIMEOUT_MS
    }))
}));

/**
 * Terminology server state management store. This is used for resolving valueSets externally.
 * Defaults to use https://tx.ontoserver.csiro.au/fhir.
 * This is the React version of the store which can be used as React hooks in React functional components.
 * @see {@link TerminologyServerStoreType} for available properties and methods.
 *
 * @author Sean Fong
 */
export const useTerminologyServerStore = createSelectors(terminologyServerStore);
