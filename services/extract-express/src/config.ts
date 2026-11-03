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

import { readBaseUrlSetting } from './outboundUrl';

export interface ServerConfig {
  url: URL;
  authToken: string | undefined;
}

export interface ExtractConfig {
  /** EHR server that provides StructureMap/$transform, or null when not configured */
  ehrServer: ServerConfig | null;
  /** Forms server that Questionnaires and StructureMaps are read from, or null when not configured */
  formsServer: ServerConfig | null;
}

function blankToUndefined(value: string | undefined): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}

function readServer(
  env: NodeJS.ProcessEnv,
  urlSetting: string,
  tokenSetting: string
): ServerConfig | null {
  const url = readBaseUrlSetting(env[urlSetting], urlSetting);
  return url ? { url, authToken: blankToUndefined(env[tokenSetting]) } : null;
}

/**
 * Reads the service configuration from environment variables. Throws on a malformed URL so that a
 * misconfigured service fails at startup instead of sending requests somewhere unexpected.
 */
export function loadConfig(env: NodeJS.ProcessEnv): ExtractConfig {
  return {
    ehrServer: readServer(env, 'EHR_SERVER_URL', 'EHR_SERVER_AUTH_TOKEN'),
    formsServer: readServer(env, 'FORMS_SERVER_URL', 'FORMS_SERVER_AUTH_TOKEN')
  };
}

/**
 * Every base URL this service may send requests to.
 */
export function allOutboundBases(config: ExtractConfig): URL[] {
  return [config.ehrServer, config.formsServer]
    .filter((server): server is ServerConfig => server !== null)
    .map((server) => server.url);
}

/**
 * Formats a base URL for messages, without a trailing slash.
 */
export function displayBaseUrl(server: ServerConfig): string {
  return server.url.href.replace(/\/+$/, '');
}

/**
 * Request headers for a server, with its auth token when it has one.
 */
export function headersFor(server: ServerConfig, baseHeaders: Record<string, string>) {
  return server.authToken
    ? { ...baseHeaders, Authorization: `Bearer ${server.authToken}` }
    : baseHeaders;
}
