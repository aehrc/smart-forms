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

import { HEADERS } from './globals';
import type { FetchQuestionnaireCallback } from '@aehrc/sdc-assemble';
import type { AssembleConfig } from './config';
import { fetchJson, isUnderBase, resolveQueryUrl } from './outboundUrl';

/**
 * Creates the callback sdc-assemble uses to fetch subquestionnaires by canonical URL.
 * Requests only go to FORMS_SERVER_URL; without it, subquestionnaires cannot be fetched.
 */
export function createFetchQuestionnaireCallback(
  config: AssembleConfig
): FetchQuestionnaireCallback {
  return async (canonicalUrl: string) => {
    const formsServer = config.formsServer;
    const requestUrl = resolveQueryUrl(
      `Questionnaire?url=${canonicalUrl}`,
      formsServer?.url ?? null,
      [],
      'FORMS_SERVER_URL'
    );

    const headers =
      formsServer?.authToken && isUnderBase(requestUrl, formsServer.url)
        ? { ...HEADERS, Authorization: `Bearer ${formsServer.authToken}` }
        : HEADERS;

    return fetchJson(requestUrl, { headers });
  };
}
