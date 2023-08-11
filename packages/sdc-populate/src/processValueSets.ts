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

import type {
  Coding,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  ValueSet
} from 'fhir/r4';
import type { ValueSetPromise } from './interfaces/expressions.interface';
import * as FHIR from 'fhirclient';

const ONTOSERVER_ENDPOINT = 'https://r4.ontoserver.csiro.au/fhir/';

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

export async function resolvePromises(
  valueSetPromises: Record<string, ValueSetPromise>
): Promise<Record<string, ValueSetPromise>> {
  const newValueSetPromises: Record<string, ValueSetPromise> = {};

  const valueSetPromiseKeys = Object.keys(valueSetPromises);
  const valueSetPromiseValues = Object.values(valueSetPromises);
  const promises = valueSetPromiseValues.map((valueSetPromise) => valueSetPromise.promise);
  const valueSets = await Promise.all(promises);

  for (const [i, valueSet] of valueSets.entries()) {
    const key = valueSetPromiseKeys[i];
    const valueSetPromise = valueSetPromiseValues[i];
    if (key && valueSetPromise) {
      valueSetPromise.valueSet = valueSet;
      newValueSetPromises[key] = valueSetPromise;
    }
  }
  return newValueSetPromises;
}

/**
 * Read a questionnaire response item recursively and retrieve valueSet answers if present
 *
 * @author Sean Fong
 */
export function addValueSetAnswersRecursive(
  qrItem: QuestionnaireResponseItem,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem {
  const items = qrItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = items.map((item) =>
      addValueSetAnswersRecursive(item, valueSetPromises)
    );

    return { ...qrItem, item: qrItems };
  }

  const valueSetPromise = valueSetPromises[qrItem.linkId];
  if (valueSetPromise && valueSetPromise.valueSet && qrItem.answer) {
    const answers = qrItem.answer;
    const valueSet = valueSetPromise.valueSet;

    const newAnswers: QuestionnaireResponseItemAnswer[] = [];
    for (const answer of answers) {
      const valueString = answer.valueString;

      if (valueString) {
        // Use string values to obtain valueCodings in valueSet
        newAnswers.push(getCodingFromValueSet(valueString, valueSet));
      } else {
        // Skip if answer isn't a valueString
        newAnswers.push(answer);
      }
    }
    return { ...qrItem, answer: newAnswers };
  }

  // If item does not have any valueSet
  return qrItem;
}

function getCodingFromValueSet(value: string, valueSet: ValueSet): QuestionnaireResponseItemAnswer {
  const coding = valueSet.expansion?.contains?.find((coding: Coding) => coding.code === value);
  return coding ? { valueCoding: coding } : { valueString: value };
}
