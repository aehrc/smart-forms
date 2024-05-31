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

import type { FetchResourceCallback } from '@aehrc/sdc-populate';
import axios from 'axios';

const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

export interface RequestConfig {
  clientEndpoint: string;
  authToken?: string;
}

export const fetchResourceCallback: FetchResourceCallback = (
  query: string,
  requestConfig: RequestConfig
) => {
  let { clientEndpoint } = requestConfig;
  const { authToken } = requestConfig;

  const headers = {
    Accept: 'application/json;charset=utf-8',
    Authorization: `Bearer ${authToken}`
  };

  if (!clientEndpoint.endsWith('/')) {
    clientEndpoint += '/';
  }

  const queryUrl = ABSOLUTE_URL_REGEX.test(query) ? query : clientEndpoint + query;

  return axios.get(queryUrl, {
    headers: headers
  });
};

export const terminologyCallback: FetchResourceCallback = (
  query: string,
  requestConfig: RequestConfig
) => {
  let { clientEndpoint } = requestConfig;

  const headers = {
    Accept: 'application/json;charset=utf-8'
  };

  if (!clientEndpoint.endsWith('/')) {
    clientEndpoint += '/';
  }

  const queryUrl = ABSOLUTE_URL_REGEX.test(query) ? query : clientEndpoint + query;

  return axios.get(queryUrl, {
    headers: headers
  });
};
