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

import type { FetchResourceCallback, FetchTerminologyCallback } from '@aehrc/sdc-populate';
import type { PopulateConfig, ServerConfig } from './config';
import { fetchJson, isUnderBase, resolveQueryUrl } from './outboundUrl';

function createHeaders(target: URL, server: ServerConfig | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json;charset=utf-8'
  };

  // Only send a server's auth token to that server, never to another allowed origin
  if (server?.authToken && isUnderBase(target, server.url)) {
    headers['Authorization'] = `Bearer ${server.authToken}`;
  }

  return headers;
}

/**
 * Creates the callback sdc-populate uses to fetch questionnaires and context resources.
 * Relative queries go to EHR_SERVER_URL. Absolute URLs are fetched only when they are under
 * EHR_SERVER_URL or ALLOWED_FETCH_ORIGINS.
 */
export function createFetchResourceCallback(config: PopulateConfig): FetchResourceCallback {
  return async (query: string) => {
    const requestUrl = resolveQueryUrl(
      query,
      config.ehrServer?.url ?? null,
      config.allowedFetchBases,
      'EHR_SERVER_URL'
    );
    return fetchJson(requestUrl, { headers: createHeaders(requestUrl, config.ehrServer) });
  };
}

/**
 * Creates the callback sdc-populate uses for ValueSet $expand and CodeSystem $lookup.
 * Relative queries go to TERMINOLOGY_SERVER_URL (or the default terminology server). Absolute URLs
 * are fetched only when they are under that server or ALLOWED_FETCH_ORIGINS.
 */
export function createFetchTerminologyCallback(config: PopulateConfig): FetchTerminologyCallback {
  return async (query: string) => {
    const requestUrl = resolveQueryUrl(
      query,
      config.terminologyServer.url,
      config.allowedFetchBases,
      'TERMINOLOGY_SERVER_URL'
    );
    return fetchJson(requestUrl, {
      headers: createHeaders(requestUrl, config.terminologyServer)
    });
  };
}
