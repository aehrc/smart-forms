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

import { parseBaseUrl, parseBaseUrlList, readBaseUrlSetting } from './outboundUrl';

/**
 * The terminology server used when TERMINOLOGY_SERVER_URL is not set.
 * Matches TERMINOLOGY_SERVER_URL in packages/sdc-populate/src/globals.ts (checked by a unit test).
 */
export const DEFAULT_TERMINOLOGY_SERVER_URL = 'https://tx.ontoserver.csiro.au/fhir';

export interface ServerConfig {
  url: URL;
  authToken: string | undefined;
}

export interface PopulateConfig {
  /** EHR server for reference contexts and questionnaire lookups, or null when not configured */
  ehrServer: ServerConfig | null;
  terminologyServer: ServerConfig;
  /** Additional base URLs that absolute URLs in a request may point at */
  allowedFetchBases: URL[];
}

function blankToUndefined(value: string | undefined): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}

/**
 * Reads the service configuration from environment variables. Throws on a malformed URL so that a
 * misconfigured service fails at startup instead of sending requests somewhere unexpected.
 */
export function loadConfig(env: NodeJS.ProcessEnv): PopulateConfig {
  const ehrServerUrl = readBaseUrlSetting(env['EHR_SERVER_URL'], 'EHR_SERVER_URL');
  const configuredTerminologyServerUrl = readBaseUrlSetting(
    env['TERMINOLOGY_SERVER_URL'],
    'TERMINOLOGY_SERVER_URL'
  );

  return {
    ehrServer: ehrServerUrl
      ? { url: ehrServerUrl, authToken: blankToUndefined(env['EHR_SERVER_AUTH_TOKEN']) }
      : null,
    // The auth token is only sent to a terminology server the operator configured, never to the default
    terminologyServer: configuredTerminologyServerUrl
      ? {
          url: configuredTerminologyServerUrl,
          authToken: blankToUndefined(env['TERMINOLOGY_SERVER_AUTH_TOKEN'])
        }
      : {
          url: parseBaseUrl(DEFAULT_TERMINOLOGY_SERVER_URL, 'TERMINOLOGY_SERVER_URL'),
          authToken: undefined
        },
    allowedFetchBases: parseBaseUrlList(env['ALLOWED_FETCH_ORIGINS'], 'ALLOWED_FETCH_ORIGINS')
  };
}

/**
 * Formats a base URL the way the sdc-populate library and fhirpath.js expect it: without a trailing
 * slash, because they append "/" and the path themselves.
 */
export function toLibraryBaseUrl(url: URL): string {
  return url.href.replace(/\/+$/, '');
}

/**
 * Every base URL this service may send requests to.
 */
export function allOutboundBases(config: PopulateConfig): URL[] {
  return [
    ...(config.ehrServer ? [config.ehrServer.url] : []),
    config.terminologyServer.url,
    ...config.allowedFetchBases
  ];
}
