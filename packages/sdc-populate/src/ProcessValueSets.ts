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
} from 'fhir/r5';
import type { ValueSetPromise } from './Interfaces';
import * as FHIR from 'fhirclient';
import { headers } from 'smart-forms-react/src/functions/LoadServerResourceFunctions';

export function getValueSetPromise(
  qItem: QuestionnaireItem,
  fullUrl: string,
  valueSetPromiseMap: Record<string, ValueSetPromise>
) {
  const ontoserver = process.env.REACT_APP_ONTOSERVER_URL ?? 'https://r4.ontoserver.csiro.au/fhir/';

  const valueSetUrl = fullUrl.includes('ValueSet/$expand?url=')
    ? fullUrl.split('ValueSet/$expand?url=')[1]
    : fullUrl;

  valueSetPromiseMap[qItem.linkId] = {
    promise: FHIR.client({ serverUrl: ontoserver }).request({
      url: 'ValueSet/$expand?url=' + valueSetUrl,
      headers: headers
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
 * Read items within a questionnaire recursively and generates a questionnaireResponseItem to be added to the populated response.
 *
 * @author Sean Fong
 */
export function addValueSetAnswers(
  qrForm: QuestionnaireResponseItem,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem {
  if (!qrForm.item) return qrForm;

  const newQrGroups: QuestionnaireResponseItem[] = [];
  for (const qrGroup of qrForm.item) {
    newQrGroups.push(readQuestionnaireResponseItem(qrGroup, valueSetPromises));
  }
  qrForm.item = newQrGroups;
  return qrForm;
}

/**
 * Read a single questionnaire item/group recursively and generating questionnaire response items from initialExpressions if present
 *
 * @author Sean Fong
 */
function readQuestionnaireResponseItem(
  qrItem: QuestionnaireResponseItem,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem {
  const items = qrItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = [];

    items.forEach((item) => {
      const newQrItem = readQuestionnaireResponseItem(item, valueSetPromises);
      qrItems.push(newQrItem);
    });

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
