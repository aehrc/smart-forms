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

import type { Coding } from 'fhir/r4';
import * as FHIR from 'fhirclient';
import { ONTOSERVER_ENDPOINT } from './expandValueset';
import type { CodeSystemLookupPromise } from '../interfaces/expressions.interface';

export function getCodeSystemLookupPromise(
  coding: Coding,
  codeSystemLookupPromiseMap: Record<string, CodeSystemLookupPromise>
) {
  const query = `system=${coding.system}&code=${coding.code}`;

  codeSystemLookupPromiseMap[query] = {
    promise: FHIR.client({ serverUrl: ONTOSERVER_ENDPOINT }).request({
      url: `CodeSystem/$lookup?${query}`
    }),
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
  return (
    response &&
    response.resourceType === 'Parameters' &&
    response.parameter &&
    response.parameter.find((p: any) => p.name === 'display') &&
    response.parameter.find((p: any) => p.name === 'display').valueString
  );
}
