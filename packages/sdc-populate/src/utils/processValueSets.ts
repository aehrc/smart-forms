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
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  ValueSet
} from 'fhir/r4';
import type { ValueSetPromise } from '../interfaces/expressions.interface';
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
export function filterValueSetAnswersRecursive(
  qrItem: QuestionnaireResponseItem,
  valueSetPromises: Record<string, ValueSetPromise>,
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>,
  containedResources: Record<string, ValueSet>
): QuestionnaireResponseItem | null {
  const items = qrItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = items
      .map((item) =>
        filterValueSetAnswersRecursive(item, valueSetPromises, answerOptions, containedResources)
      )
      .filter((item): item is QuestionnaireResponseItem => item !== null);

    return { ...qrItem, item: qrItems };
  }

  const linkId = qrItem.linkId;

  const valueSetOptionCodings = valueSetPromises[linkId]?.valueSet?.expansion?.contains;
  if (qrItem.answer && valueSetOptionCodings) {
    return { ...qrItem, answer: cleanAnswers(qrItem.answer, valueSetOptionCodings) };
  }

  const answerOptionCodings = answerOptions[linkId]?.map((option) => option.valueCoding);
  if (qrItem.answer && answerOptionCodings) {
    return { ...qrItem, answer: cleanAnswers(qrItem.answer, answerOptionCodings) };
  }

  const containedValueSetOptionCodings = containedResources[linkId]?.expansion?.contains;
  if (qrItem.answer && containedValueSetOptionCodings) {
    const cleanedAnswers = cleanAnswers(qrItem.answer, containedValueSetOptionCodings);

    return cleanedAnswers.length > 0
      ? {
          ...qrItem,
          answer: cleanAnswers(qrItem.answer, containedValueSetOptionCodings)
        }
      : null;
  }

  // If item does not have any valueSet nor answerOption
  return qrItem;
}

function cleanAnswers(answers: QuestionnaireResponseItemAnswer[], options: (Coding | undefined)[]) {
  const newAnswers: QuestionnaireResponseItemAnswer[] = [];

  for (let answer of answers) {
    if (answer.valueString) {
      // attempt to obtain valueCodings in valueSet from valueString
      answer = parseStringToCoding(answer.valueString, options);

      // return as valueString if no valueCoding found
      if (answer.valueString) {
        newAnswers.push(answer);
        continue;
      }
    }

    // add answer to newAnswers if not valueCoding
    if (!answer.valueCoding) {
      newAnswers.push(answer);
      continue;
    }

    // answer is valueCoding at this point, filter out codings that are not in valueSet
    const valueCoding = codingIsInOptions(answer.valueCoding, options);
    if (valueCoding) {
      newAnswers.push(answer);
    }
  }

  return newAnswers;
}

function parseStringToCoding(
  value: string,
  options: (Coding | undefined)[]
): QuestionnaireResponseItemAnswer {
  if (!options) {
    return { valueString: value };
  }

  const coding = options.find((coding) => coding?.code === value);
  return coding ? { valueCoding: coding } : { valueString: value };
}

function codingIsInOptions(answerCoding: Coding, options: (Coding | undefined)[]): Coding | null {
  if (!options) {
    return null;
  }

  return options.find((option) => option?.code === answerCoding.code) ?? null;
}
