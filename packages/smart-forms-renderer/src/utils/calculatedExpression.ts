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

import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { emptyResponse } from './emptyResource';
import { createFhirPathContext, handleFhirPathResult } from './fhirpath';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { createEmptyQrGroup, updateQrItemsInGroup } from './qrItem';
import dayjs from 'dayjs';
import { updateQuestionnaireResponse } from './genericRecursive';
import { deepEqual } from 'fast-equals';
import type { Variables } from '../interfaces';
import type { ComputedNewAnswers } from '../interfaces/computedUpdates.interface';

interface EvaluateInitialCalculatedExpressionsParams {
  initialResponse: QuestionnaireResponse;
  initialResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  variables: Variables;
  existingFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  terminologyServerUrl: string;
}

export async function evaluateInitialCalculatedExpressions(
  params: EvaluateInitialCalculatedExpressionsParams
): Promise<{
  initialCalculatedExpressions: Record<string, CalculatedExpression[]>;
  updatedFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
}> {
  const {
    initialResponse,
    initialResponseItemMap,
    calculatedExpressions,
    variables,
    existingFhirPathContext,
    terminologyServerUrl
  } = params;
  let { fhirPathTerminologyCache } = params;

  // Return early if initialResponse is empty or there are no calculated expressions to evaluate
  if (
    deepEqual(initialResponse, structuredClone(emptyResponse)) ||
    Object.keys(calculatedExpressions).length === 0
  ) {
    return {
      initialCalculatedExpressions: calculatedExpressions,
      updatedFhirPathContext: existingFhirPathContext,
      fhirPathTerminologyCache
    };
  }

  let initialCalculatedExpressions: Record<string, CalculatedExpression[]> = {
    ...calculatedExpressions
  };

  // If 'value' key does not exist in calculated expressions, initialise it to null
  initialCalculatedExpressions = initialiseCalculatedExpressionValuesToNull(
    initialCalculatedExpressions
  );

  const fhirPathEvalResult = await createFhirPathContext(
    initialResponse,
    initialResponseItemMap,
    variables,
    existingFhirPathContext,
    fhirPathTerminologyCache,
    terminologyServerUrl
  );
  const updatedFhirPathContext = fhirPathEvalResult.fhirPathContext;
  fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;

  for (const linkId in initialCalculatedExpressions) {
    const itemCalcExpressions = calculatedExpressions[linkId];

    for (const calcExpression of itemCalcExpressions) {
      const cacheKey = JSON.stringify(calcExpression.expression); // Use expression as cache key
      if (fhirPathTerminologyCache[cacheKey]) {
        continue;
      }

      try {
        const fhirPathResult = fhirpath.evaluate(
          {},
          calcExpression.expression,
          updatedFhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl
          }
        );
        const result = await handleFhirPathResult(fhirPathResult);

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          fhirPathTerminologyCache[cacheKey] = result;
        }

        // Only update calculatedExpressions if length of result array > 0
        if (result.length > 0 && !deepEqual(calcExpression.value, result[0])) {
          calcExpression.value = result[0];
        }
      } catch (e) {
        console.warn(e.message, `LinkId: ${linkId}\nExpression: ${calcExpression.expression}`);
      }
    }

    initialCalculatedExpressions[linkId] = itemCalcExpressions;
  }

  return {
    initialCalculatedExpressions,
    updatedFhirPathContext,
    fhirPathTerminologyCache
  };
}

// If 'value' key does not exist in calculated expressions, initialise it to null
// This is so it doesn't trigger a UI change when calcExpression.value goes from "undefined" to "null"
// This might potentially introduce unintended issues? - need to keep an eye on this function
function initialiseCalculatedExpressionValuesToNull(
  calculatedExpressions: Record<string, CalculatedExpression[]>
) {
  for (const linkId in calculatedExpressions) {
    const itemCalcExpressions = calculatedExpressions[linkId];

    for (const calcExpression of itemCalcExpressions) {
      if (!('value' in calcExpression)) {
        calcExpression.value = null;
      }
    }
  }

  return calculatedExpressions;
}

export async function evaluateCalculatedExpressions(
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  calculatedExpressions: Record<string, CalculatedExpression[]>,
  terminologyServerUrl: string
): Promise<{
  calculatedExpsIsUpdated: boolean;
  updatedCalculatedExpressions: Record<string, CalculatedExpression[]>;
  computedNewAnswers: ComputedNewAnswers;
}> {
  const updatedCalculatedExpressions: Record<string, CalculatedExpression[]> = {
    ...calculatedExpressions
  };

  let isUpdated = false;
  const computedNewAnswers: ComputedNewAnswers = {};
  for (const linkId in calculatedExpressions) {
    const itemCalcExpressions = calculatedExpressions[linkId];

    for (const calcExpression of itemCalcExpressions) {
      const cacheKey = JSON.stringify(calcExpression.expression); // Use expression as cache key
      if (fhirPathTerminologyCache[cacheKey]) {
        continue;
      }

      try {
        const fhirPathResult = fhirpath.evaluate(
          {},
          calcExpression.expression,
          fhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl
          }
        );
        const result = await handleFhirPathResult(fhirPathResult);

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          fhirPathTerminologyCache[cacheKey] = result;
        }

        if (
          typeof calcExpression.value === 'string' &&
          calcExpression.value.startsWith('Blood tests')
        ) {
          console.log(calcExpression.value, structuredClone(result), calcExpression.expression);
        }

        // Update calculatedExpressions if length of result array > 0
        // Only update when current calcExpression value is different from the result, otherwise it will result in an infinite loop as per issue #733
        if (result.length > 0 && !deepEqual(calcExpression.value, result[0])) {
          // console.log(calcExpression.value, structuredClone(result));
          isUpdated = true;
          calcExpression.value = result[0];

          // Update computedNewAnswers if the expression is a cqf-expression for _answerValueSet - clear answers (similar to dynamic value sets)
          if (calcExpression.from === 'item._answerValueSet') {
            computedNewAnswers[linkId] = null;
          }
        }

        // Update calculatedExpression value to null if no result is returned
        if (result.length === 0 && calcExpression.value !== null) {
          isUpdated = true;
          calcExpression.value = null;

          // Update computedNewAnswers if the expression is a cqf-expression for _answerValueSet - clear answers (similar to dynamic value sets)
          if (calcExpression.from === 'item._answerValueSet') {
            computedNewAnswers[linkId] = null;
          }
        }
      } catch (e) {
        console.warn(e.message, `LinkId: ${linkId}\nExpression: ${calcExpression.expression}`);
      }
    }

    updatedCalculatedExpressions[linkId] = itemCalcExpressions;
  }

  return {
    calculatedExpsIsUpdated: isUpdated,
    updatedCalculatedExpressions: updatedCalculatedExpressions,
    computedNewAnswers: computedNewAnswers
  };
}

export function initialiseCalculatedExpressionValues(
  questionnaire: Questionnaire,
  populatedResponse: QuestionnaireResponse,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponse {
  // Filter calculated expressions, only preserve key-value pairs with values
  const calculatedExpressionsWithValues: Record<string, CalculatedExpression[]> = {};
  for (const linkId in calculatedExpressions) {
    const itemCalcExpressionsWithValues = calculatedExpressions[linkId].filter(
      (calcExpression) => calcExpression.value !== undefined
    );

    if (itemCalcExpressionsWithValues.length > 0) {
      calculatedExpressionsWithValues[linkId] = itemCalcExpressionsWithValues;
    }
  }

  return updateQuestionnaireResponse(
    questionnaire,
    populatedResponse,
    initialiseItemCalculatedExpressionValueRecursive,
    calculatedExpressionsWithValues
  );
}

function initialiseItemCalculatedExpressionValueRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    const updatedQrItems = initialiseItemCalculatedExpressionValueInRepeatGroup(
      qItem,
      qrItemOrItems,
      calculatedExpressions
    );
    return constructGroupItem(
      qItem,
      updatedQrItems && updatedQrItems.length > 0
        ? {
            linkId: qItem.linkId,
            text: qItem.text,
            item: updatedQrItems
          }
        : null,
      calculatedExpressions
    );
  }

  let qrItem = qrItemOrItems;
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    // If item.type is 'group', create empty group qrItem
    if (qItem.type === 'group') {
      qrItem = qrItemOrItems ?? structuredClone(createEmptyQrGroup(qItem));
    }
    const childQrItems = qrItem?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // Otherwise loop through qItem as usual
    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      const updatedChildQRItemOrItems = initialiseItemCalculatedExpressionValueRecursive(
        childQItem,
        childQRItemOrItems ?? null,
        calculatedExpressions
      );

      // Update QR items in repeating group
      if (Array.isArray(updatedChildQRItemOrItems)) {
        if (updatedChildQRItemOrItems.length > 0) {
          updateQrItemsInGroup(
            null,
            {
              linkId: childQItem.linkId,
              qrItems: updatedChildQRItemOrItems
            },
            qrItem ?? structuredClone(createEmptyQrGroup(qItem)),
            indexMap
          );
        }
        continue;
      }

      // Update QR items in non-repeating group
      const updatedChildQRItem = updatedChildQRItemOrItems;
      if (updatedChildQRItem) {
        updateQrItemsInGroup(
          updatedChildQRItem,
          null,
          qrItem ?? structuredClone(createEmptyQrGroup(qItem)),
          indexMap
        );
      }
    }

    return constructGroupItem(qItem, qrItem, calculatedExpressions);
  }

  return constructSingleItem(qItem, qrItem, calculatedExpressions);
}

function initialiseItemCalculatedExpressionValueInRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem[] | null {
  if (!qItem.item) {
    return [];
  }

  const indexMap = mapQItemsIndex(qItem);
  const qrItemsByIndex = getQrItemsIndex(qItem.item, qrItems, indexMap);
  const updatedQrItems: QuestionnaireResponseItem[] = [];

  for (const [index, childQItem] of qItem.item.entries()) {
    const childQRItemOrItems = qrItemsByIndex[index] ?? null;

    const updatedChildQRItemOrItems = initialiseItemCalculatedExpressionValueRecursive(
      childQItem,
      childQRItemOrItems,
      calculatedExpressions
    );

    if (Array.isArray(updatedChildQRItemOrItems)) {
      updatedQrItems.push(...updatedChildQRItemOrItems);
    } else if (updatedChildQRItemOrItems) {
      updatedQrItems.push(updatedChildQRItemOrItems);
    }
  }

  return updatedQrItems.length > 0 ? updatedQrItems : null;
}

function getCalculatedExpressionAnswer(
  qItem: QuestionnaireItem,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItemAnswer | undefined {
  const calcExpressionFromItem = calculatedExpressions[qItem.linkId]?.find(
    (calcExpression) => calcExpression.from === 'item'
  );

  if (calcExpressionFromItem) {
    // If value is undefined or null, do not return anything
    if (calcExpressionFromItem?.value === undefined || calcExpressionFromItem.value === null) {
      return;
    }

    // Otherwise there is a value (including 0 and empty strings)
    return parseValueToAnswer(qItem, calcExpressionFromItem.value);
  }

  return;
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | null {
  const calculatedExpressionAnswer = getCalculatedExpressionAnswer(qItem, calculatedExpressions);

  // If group item has an existing answer, do not overwrite it with calculated expression value
  if (qrItem?.answer && qrItem?.answer.length > 0) {
    return qrItem ?? null;
  }

  if (!calculatedExpressionAnswer) {
    return qrItem ?? null;
  }

  if (qrItem) {
    return {
      ...qrItem,
      answer: [calculatedExpressionAnswer]
    };
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: [calculatedExpressionAnswer]
  };
}

function constructSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | null {
  const calculatedExpressionAnswer = getCalculatedExpressionAnswer(qItem, calculatedExpressions);
  if (!calculatedExpressionAnswer) {
    return qrItem ?? null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: [calculatedExpressionAnswer]
  };
}

// duplicate functions in sdc-populate
function parseValueToAnswer(qItem: QuestionnaireItem, value: any): QuestionnaireResponseItemAnswer {
  if (qItem.answerOption) {
    const answerOption = qItem.answerOption.find(
      (option: QuestionnaireItemAnswerOption) =>
        option.valueCoding?.code === value?.code ||
        // Handle case where valueCoding.code is not available
        (!option.valueCoding?.code && option.valueCoding?.display === value?.display)
    );

    if (answerOption) {
      return answerOption;
    }
  }

  if (typeof value === 'boolean' && qItem.type === 'boolean') {
    return { valueBoolean: value };
  }

  if (typeof value === 'number') {
    if (qItem.type === 'decimal') {
      return { valueDecimal: value };
    }
    if (qItem.type === 'integer') {
      return { valueInteger: value };
    }
  }

  if (typeof value === 'object' && value.unit) {
    return { valueQuantity: value };
  }

  if (typeof value === 'object' && value.system && value.code) {
    return { valueCoding: value };
  }

  // Value is string at this point
  if (qItem.type === 'date' && checkIsDateTime(value)) {
    return { valueDate: value };
  }

  if (qItem.type === 'dateTime' && checkIsDateTime(value)) {
    return { valueDateTime: value };
  }

  if (qItem.type === 'time' && checkIsTime(value)) {
    return { valueTime: value };
  }

  return { valueString: value };
}

/**
 * Check if an answer is a datetime in the format YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss+zz:zz
 *
 * @author Sean Fong
 */
export function checkIsDateTime(value: string): boolean {
  const acceptedFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ'];
  const formattedDate = dayjs(value).format();
  return dayjs(formattedDate, acceptedFormats, true).isValid();
}

/**
 * Check if an answer is in a  time format - Regex: ([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?
 *
 * @author Sean Fong
 */
export function checkIsTime(value: string): boolean {
  const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?$/;
  return timeRegex.test(value);
}
