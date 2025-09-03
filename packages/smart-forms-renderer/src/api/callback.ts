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

import type {
  FetchResourceCallback,
  FetchResourceRequestConfig,
  FetchTerminologyCallback,
  FetchTerminologyRequestConfig
} from '@aehrc/sdc-populate';

const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

/**
 * Pre-populate callback function that works with '@aehrc/sdc-populate' `populateQuestionnaire()`. Used in GranularRepopulateButton.tsx.
 * See GranularRepopulateButton.tsx for usage.
 * Also used in https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/PrePopWrapperForStorybook.tsx.
 *
 * @author Sean Fong
 */
export const fetchResourceCallback: FetchResourceCallback = async (
  query: string,
  requestConfig: FetchResourceRequestConfig
) => {
  let { sourceServerUrl } = requestConfig;
  const { authToken } = requestConfig;

  const headers: Record<string, string> = {
    Accept: 'application/json;charset=utf-8'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (!sourceServerUrl.endsWith('/')) {
    sourceServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : `${sourceServerUrl}${query}`;
  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};

/**
 * Terminology callback function that works with '@aehrc/sdc-populate' `populateQuestionnaire()`.
 * See GranularRepopulateButton.tsx for usage.
 *
 * @author Sean Fong
 */
export const fetchTerminologyCallback: FetchTerminologyCallback = async (
  query: string,
  terminologyRequestConfig: FetchTerminologyRequestConfig
) => {
  let { terminologyServerUrl } = terminologyRequestConfig;

  const headers = {
    Accept: 'application/fhir+json;charset=utf-8'
  };

  if (!terminologyServerUrl.endsWith('/')) {
    terminologyServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : terminologyServerUrl + query;

  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
