/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import { Coding, ValueSet, ValueSetExpansionContains } from 'fhir/r5';

export class AnswerValueSet {
  static cache: Record<string, Coding[]> = {};

  /**
   * Expands a given valueSet URL into a valueSet and returns it in a callback function.
   *
   * @author Sean Fong
   */
  static expand(
    fullUrl: string,
    setAnswerOptions: { (newOptions: ValueSet): void },
    displayError: { (error: Error): void }
  ) {
    const ontoserver =
      process.env.REACT_APP_ONTOSERVER_URL ?? 'https://r4.ontoserver.csiro.au/fhir/';

    const valueSetUrl = fullUrl.includes('ValueSet/$expand?url=')
      ? fullUrl.split('ValueSet/$expand?url=')[1]
      : fullUrl;

    FHIR.client({ serverUrl: ontoserver })
      .request({ url: 'ValueSet/$expand?url=' + valueSetUrl })
      .then((response) => {
        setAnswerOptions(response);
      })
      .catch((error) => {
        console.error(error);
        displayError(error);
      });
  }

  /**
   * Sets an array of valueCodings with the values from an array of valueSetExpansionContains
   *
   * @author Sean Fong
   */
  static getValueCodings(valueSetExpansionContains: ValueSetExpansionContains[]) {
    const valueCodings: Coding[] = [];
    valueSetExpansionContains.forEach((item) => {
      valueCodings.push({
        system: item.system,
        code: item.code,
        display: item.display
      });
    });
    return valueCodings;
  }
}
