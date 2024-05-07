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

import * as FHIR from 'fhirclient';
import type { ValueSetPromise } from '../interfaces/expressions.interface';
import type { QuestionnaireItem } from 'fhir/r4';

export const ONTOSERVER_ENDPOINT = 'https://r4.ontoserver.csiro.au/fhir/';

export function getValueSetPromise(
  qItem: QuestionnaireItem,
  fullUrl: string,
  valueSetPromiseMap: Record<string, ValueSetPromise>
) {
  let valueSetUrl = fullUrl;
  if (fullUrl.includes('ValueSet/$expand?url=')) {
    const splitUrl = fullUrl.split('ValueSet/$expand?url=');
    if (splitUrl[1]) {
      valueSetUrl = splitUrl[1];
    }
  }

  valueSetUrl = valueSetUrl.replace('|', '&version=');

  valueSetPromiseMap[qItem.linkId] = {
    promise: FHIR.client({ serverUrl: ONTOSERVER_ENDPOINT }).request({
      url: 'ValueSet/$expand?url=' + valueSetUrl
    })
  };
}
