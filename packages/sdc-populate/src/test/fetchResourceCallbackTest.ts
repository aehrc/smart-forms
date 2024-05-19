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

import axios from 'axios';
import type { FetchResourceCallback } from '../SDCPopulateQuestionnaireOperation';

const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

export interface RequestConfig {
  clientEndpoint: string;
  authToken: string | null;
}

export const requestConfigTest: RequestConfig = {
  clientEndpoint: 'https://proxy.smartforms.io/fhir',
  authToken: null
};

export const fetchResourceCallbackTest: FetchResourceCallback = (
  query: string,
  requestConfig: RequestConfig
) => {
  let { clientEndpoint } = requestConfig;
  const { authToken } = requestConfig;

  const headers: any = {
    Accept: 'application/json;charset=utf-8'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (!clientEndpoint.endsWith('/')) {
    clientEndpoint += '/';
  }

  if (ABSOLUTE_URL_REGEX.test(query)) {
    return axios.get(query, {
      headers: headers
    });
  }

  return axios.get(clientEndpoint + query, {
    headers: headers
  });
};
