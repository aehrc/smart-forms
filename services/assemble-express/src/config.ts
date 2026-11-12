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

export interface AssembleConfig {
  /** Forms server that subquestionnaires are fetched from, or null when not configured */
  formsServer: ServerConfig | null;
}

function blankToUndefined(value: string | undefined): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}

/**
 * Reads the service configuration from environment variables. Throws on a malformed URL so that a
 * misconfigured service fails at startup instead of sending requests somewhere unexpected.
 */
export function loadConfig(env: NodeJS.ProcessEnv): AssembleConfig {
  const formsServerUrl = readBaseUrlSetting(env['FORMS_SERVER_URL'], 'FORMS_SERVER_URL');
  return {
    formsServer: formsServerUrl
      ? { url: formsServerUrl, authToken: blankToUndefined(env['FORMS_SERVER_AUTH_TOKEN']) }
      : null
  };
}

/**
 * Every base URL this service may send requests to.
 */
export function allOutboundBases(config: AssembleConfig): URL[] {
  return config.formsServer ? [config.formsServer.url] : [];
}
