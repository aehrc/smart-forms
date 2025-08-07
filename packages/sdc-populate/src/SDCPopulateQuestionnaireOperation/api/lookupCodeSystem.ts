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

import type { Coding } from 'fhir/r4';
import type { CodeSystemLookupPromise } from '../interfaces/expressions.interface';
import type { FetchTerminologyCallback, FetchTerminologyRequestConfig } from '../interfaces';
import { defaultTerminologyRequest } from './defaultTerminologyRequest';

export function getCodeSystemLookupPromise(
  coding: Coding,
  codeSystemLookupPromiseMap: Record<string, CodeSystemLookupPromise>,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
) {
  const key = `system=${coding.system}&code=${coding.code}`;
  const query = `CodeSystem/$lookup?${key}`;

  const lookupPromise =
    fetchTerminologyCallback && fetchTerminologyRequestConfig
      ? fetchTerminologyCallback(query, fetchTerminologyRequestConfig)
      : defaultTerminologyRequest(query);

  codeSystemLookupPromiseMap[key] = {
    promise: lookupPromise,
    oldCoding: coding
  };
}

export interface LookupResponse {
  parameter: [DisplayParameter];
}

export interface DisplayParameter {
  name: 'display';
  valueString: string;
}

export function lookupResponseIsValid(response: any): response is LookupResponse {
  return !!(
    response &&
    response.resourceType === 'Parameters' &&
    Array.isArray(response.parameter) &&
    response.parameter.find((p: any) => p.name === 'display' && p.valueString)
  );
}
