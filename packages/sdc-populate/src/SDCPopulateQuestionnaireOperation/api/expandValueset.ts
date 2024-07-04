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

import type { ValueSetPromise } from '../interfaces/expressions.interface';
import type { QuestionnaireItem } from 'fhir/r4';
import type { FetchResourceCallback } from '../interfaces';
import { TERMINOLOGY_SERVER_URL } from '../../globals';

export function getValueSetPromise(
  qItem: QuestionnaireItem,
  fullUrl: string,
  valueSetPromiseMap: Record<string, ValueSetPromise>,
  terminologyCallback?: FetchResourceCallback,
  terminologyRequestConfig?: any
) {
  let valueSetUrl = fullUrl;
  if (fullUrl.includes('ValueSet/$expand?url=')) {
    const splitUrl = fullUrl.split('ValueSet/$expand?url=');
    if (splitUrl[1]) {
      valueSetUrl = splitUrl[1];
    }
  }

  valueSetUrl = valueSetUrl.replace('|', '&version=');
  const query = `ValueSet/$expand?url=${valueSetUrl}`;

  const valueSetPromise = terminologyCallback
    ? terminologyCallback(query, terminologyRequestConfig)
    : defaultTerminologyRequest(query);

  valueSetPromiseMap[qItem.linkId] = {
    promise: valueSetPromise
  };
}

const headers = {
  'Content-Type': 'application/fhir+json;charset=utf-8',
  Accept: 'application/json;charset=utf-8'
};

export async function defaultTerminologyRequest(query: string) {
  const requestUrl = TERMINOLOGY_SERVER_URL + '/' + query;
  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw `HTTP error when performing ${requestUrl}. Status: ${response.status}`;
  }

  return response.json();
}
