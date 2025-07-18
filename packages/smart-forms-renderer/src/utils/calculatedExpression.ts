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

import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type {
  Coding,
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
import { createEmptyQrGroup, createEmptyQrItem, updateQrItemsInGroup } from './qrItem';
import dayjs from 'dayjs';
import { updateQuestionnaireResponse } from './genericRecursive';
import { deepEqual } from 'fast-equals';
import type { Variables } from '../interfaces';
import type { ComputedNewAnswers } from '../interfaces/computedUpdates.interface';
import { createQuestionnaireResponseItemMap } from './questionnaireResponseStoreUtils/updatableResponseItems';
import { nanoid } from 'nanoid';
import { getDecimalPrecision } from './extensions';
import { getRelevantCodingProperties } from './valueSet';

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

export async function evaluateCalculatedExpressionsFhirPath(
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

/**
 * Applies evaluated calculated expression values into a QuestionnaireResponse.
 * Filters out calculated expressions that has value=undefined because in our prior processing step, items without values are set to null.
 * Uses the generic updateQuestionnaireResponse function to recursively apply the values.
 *
 * @param questionnaire - The Questionnaire definition object.
 * @param initialResponse - The target QuestionnaireResponse to be updated.
 * @param previousCalculatedExpressions - A mapping from linkId to array of CalculatedExpression objects that were previously applied.
 * @param updatedCalculatedExpressions - A mapping from linkId to array of CalculatedExpression objects to be applied.
 * @returns The updated QuestionnaireResponse with calculated expression values applied.
 */
export function applyCalculatedExpressionValuesToResponse(
  questionnaire: Questionnaire,
  initialResponse: QuestionnaireResponse,
  previousCalculatedExpressions: Record<string, CalculatedExpression[]>,
  updatedCalculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponse {
  // Filter calculated expressions, only preserve key-value pairs with values
  const calculatedExpressionsWithValues: Record<string, CalculatedExpression[]> = {};
  for (const linkId in updatedCalculatedExpressions) {
    const itemCalcExpressionsWithValues = updatedCalculatedExpressions[linkId].filter(
      (calcExpression) => calcExpression.value !== undefined
    );

    if (itemCalcExpressionsWithValues.length > 0) {
      calculatedExpressionsWithValues[linkId] = itemCalcExpressionsWithValues;
    }
  }

  // Get the difference between previous and updated calculated expressions
  const diffCalculatedExpressions: Record<string, CalculatedExpression[]> = {};
  for (const [linkId, calculatedExpressionWithValue] of Object.entries(
    calculatedExpressionsWithValues
  )) {
    const calcExpressionFromItem = calculatedExpressionWithValue.find(
      (calcExpression) => calcExpression.from === 'item'
    );
    const existingCalcExpressionFromItem = previousCalculatedExpressions[linkId]?.find(
      (calcExpression) => calcExpression.from === 'item'
    );

    // Calculated expression not present previously, so include it
    if (!existingCalcExpressionFromItem) {
      diffCalculatedExpressions[linkId] = calculatedExpressionWithValue;
      continue;
    }

    // If the calculated expression from item has changed, add it to the diff
    if (!deepEqual(calcExpressionFromItem.value, existingCalcExpressionFromItem.value)) {
      diffCalculatedExpressions[linkId] = calculatedExpressionWithValue;
    }
  }

  return updateQuestionnaireResponse(
    questionnaire,
    initialResponse,
    applyCalculatedExpressionValuesRecursive,
    diffCalculatedExpressions
  );
}

/**
 * Recursively applies calculated expression values to items within a QuestionnaireResponse structure.
 *
 * This function navigates both group and leaf nodes of Questionnaire/QuestionnaireResponse pairs,
 * and integrates evaluated calculated expression values (from calculatedExpressions) into the appropriate QuestionnaireResponseItem(s).
 *
 * @param qItem - The current QuestionnaireItem being processed.
 * @param qrItemOrItems - The corresponding QuestionnaireResponseItem, or array for repeating groups, or null if not present.
 * @param calculatedExpressions - A mapping from linkId to array of CalculatedExpression objects to be applied.
 * @returns The updated QuestionnaireResponseItem, array (for repeating groups), or null if none were updated.
 */
function applyCalculatedExpressionValuesRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    const updatedQrItems = applyCalculatedExpressionValuesInRepeatGroup(
      qItem,
      qrItemOrItems,
      calculatedExpressions
    );
    return applyCalculatedExpressionValuesInNonLeafItem(
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

      const updatedChildQRItemOrItems = applyCalculatedExpressionValuesRecursive(
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

    return applyCalculatedExpressionValuesInNonLeafItem(qItem, qrItem, calculatedExpressions);
  }

  return applyCalculatedExpressionValuesInLeafItem(qItem, qrItem, calculatedExpressions);
}

/**
 * Recursively applies calculated expression values to items within a repeating (array) QuestionnaireResponse group.
 *
 * Iterates through each child QuestionnaireItem of the provided group, updating the corresponding QuestionnaireResponseItems
 * with evaluated calculated expressions as needed. This enables proper support for repeated groups within questionnaire structures.
 *
 * @param qItem - The QuestionnaireItem representing the repeat group (must have child items).
 * @param qrItems - The array of QuestionnaireResponseItems corresponding to the repeated items in the response.
 * @param calculatedExpressions - A mapping from linkId to array of CalculatedExpression objects to be applied.
 * @returns An array of updated QuestionnaireResponseItems, or null if none were updated.
 */
function applyCalculatedExpressionValuesInRepeatGroup(
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

    const updatedChildQRItemOrItems = applyCalculatedExpressionValuesRecursive(
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

/**
 * Constructs a `QuestionnaireResponseItem` for a given `QuestionnaireItem` based on a calculated expression.
 *
 * If a calculated expression (with `from: 'item'`) exists for the given item and has a defined value, it is parsed
 * into a `QuestionnaireResponseItemAnswer` and returned within a `QuestionnaireResponseItem`.
 *
 * - If no relevant expression exists or the value is `undefined`, the function returns `undefined` (leaves existing response unchanged).
 * - If the value is `null`, an empty `QuestionnaireResponseItem` is returned.
 * - If the value is defined and successfully parsed, a populated `QuestionnaireResponseItem` with an `answer` is returned.
 * - If parsing fails, the function returns `undefined`.
 *
 * @param qItem - The `QuestionnaireItem` for which to obtain the calculated answer.
 * @param calculatedExpressions - A mapping from `linkId` to array of `CalculatedExpression` objects to be applied.
 * @returns A constructed `QuestionnaireResponseItem`, or `undefined` if no valid expression or answer exists.
 */
function constructItemFromCalculatedExpression(
  qItem: QuestionnaireItem,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | undefined {
  const calcExpressionFromItem = calculatedExpressions[qItem.linkId]?.find(
    (calcExpression) => calcExpression.from === 'item'
  );

  // No calcExpressionFromItem or calcExpressionFromItem.value is undefined, return undefined (do not change existing QR item)
  if (!calcExpressionFromItem || calcExpressionFromItem.value === undefined) {
    return;
  }

  const generatedAnswerKey = generateCalculatedExpressionsAnswerKey(qItem.linkId);

  // calcExpressionFromItem.value is null, return empty item
  if (calcExpressionFromItem.value === null) {
    return createEmptyQrItem(qItem, generatedAnswerKey);
  }

  // At this point calcExpressionFromItem.value should have an evaluated value
  // Parse evaluated value to QuestionnaireResponseItemAnswer
  const parsedAnswer = parseValueToAnswer(qItem, calcExpressionFromItem.value);

  // Shouldn't really happen, but if it does, do not return anything
  if (!parsedAnswer) {
    return;
  }

  // Create a new QuestionnaireResponseItem with the parsed answer
  return {
    ...createEmptyQrItem(qItem, generatedAnswerKey),
    answer: [{ id: generatedAnswerKey, ...parsedAnswer }]
  };
}

function applyCalculatedExpressionValuesInNonLeafItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | null {
  const constructedItemFromCalculatedExpression = constructItemFromCalculatedExpression(
    qItem,
    calculatedExpressions
  );

  // If no constructed item, return previous item if it exists
  if (!constructedItemFromCalculatedExpression) {
    return qrItem ?? null;
  }

  // Existing qrItem has child items, merge them with the constructed item
  const existingChildItems = qrItem?.item ?? [];
  return {
    ...constructedItemFromCalculatedExpression,
    ...(existingChildItems.length > 0 && { item: existingChildItems })
  };
}

function applyCalculatedExpressionValuesInLeafItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItem | null {
  const constructedItemFromCalculatedExpression = constructItemFromCalculatedExpression(
    qItem,
    calculatedExpressions
  );

  // If no constructed item, return previous item if it exists
  if (!constructedItemFromCalculatedExpression) {
    return qrItem ?? null;
  }

  // Return constructed item as the new qrItem
  return constructedItemFromCalculatedExpression;
}

function objMatchesCoding(coding: Coding | undefined, obj: any): boolean {
  if (!coding || !obj || typeof obj !== 'object') {
    return false;
  }

  return (
    obj &&
    obj.code === coding.code &&
    obj.display === coding.display &&
    obj.system === coding.system
  );
}

function getMatchingAnswerFromAnswerOptions(
  answerOptions: QuestionnaireItemAnswerOption[],
  value: any
): QuestionnaireResponseItemAnswer | null {
  for (const option of answerOptions) {
    // Handle answerOption.valueInteger
    if ('valueInteger' in option && option.valueInteger === value) {
      return { valueInteger: option.valueInteger };
    }

    // Handle answerOption.valueDate
    if ('valueDate' in option && option.valueDate === value) {
      return { valueDate: option.valueDate };
    }

    // Handle answerOption.valueTime
    if ('valueTime' in option && option.valueTime === value) {
      return { valueTime: option.valueTime };
    }

    // Handle answerOption.valueString
    if ('valueString' in option && option.valueString === value) {
      return { valueString: option.valueString };
    }

    // Handle answerOption.valueCoding
    if ('valueCoding' in option) {
      if (
        option.valueCoding &&
        // Handle case where value matches valueCoding.code
        (option.valueCoding?.code === value?.code ||
          // Handle case where value matches the whole valueCoding object
          objMatchesCoding(option.valueCoding, value) ||
          // Handle case where value matches valueCoding.code.display
          option.valueCoding?.display === value?.display)
      ) {
        return { valueCoding: getRelevantCodingProperties(option.valueCoding) };
      }
    }
  }

  // FIXME No support for valueReference

  return null;
}

// duplicate functions in sdc-populate
function parseValueToAnswer(
  qItem: QuestionnaireItem,
  value: any
): QuestionnaireResponseItemAnswer | null {
  // Boolean support
  if (qItem.type === 'boolean' && typeof value === 'boolean') {
    return { valueBoolean: value };
  }

  // Decimal support
  if (qItem.type === 'decimal' && typeof value === 'number') {
    // Handle precision if available
    const precision = getDecimalPrecision(qItem);
    if (typeof precision === 'number') {
      value = parseFloat(value.toFixed(precision));
    }

    return { valueDecimal: value };
  }

  // Integer support
  if (qItem.type === 'integer' && typeof value === 'number') {
    return { valueInteger: value };
  }

  // Date support
  if (qItem.type === 'date' && typeof value === 'string' && checkIsDateTime(value)) {
    return { valueDate: value };
  }

  // DateTime support
  if (qItem.type === 'dateTime' && typeof value === 'string' && checkIsDateTime(value)) {
    return { valueDateTime: value };
  }

  // Time support
  if (qItem.type === 'time' && typeof value === 'string' && checkIsTime(value)) {
    return { valueTime: value };
  }

  // String and text support
  if (qItem.type === 'string' || (qItem.type === 'text' && typeof value === 'string')) {
    return { valueString: value };
  }

  // Url support
  if (qItem.type === 'url' && typeof value === 'string') {
    return { valueUri: value };
  }

  // Choice and open-choice support
  if (qItem.type === 'choice' || qItem.type === 'open-choice') {
    // Handle answerOption matching
    if (qItem.answerOption) {
      const matchingAnswer = getMatchingAnswerFromAnswerOptions(qItem.answerOption, value);
      if (matchingAnswer) {
        console.log(qItem.linkId, matchingAnswer);
      }

      if (matchingAnswer) {
        return matchingAnswer;
      }
    }

    // If it hasn't matched answerOption, it's values is coming from an answerValueSet. In this case, it will always take the form of a Coding
    // Handle valueCoding
    // TODO in this case we will need to know the codings beforehand...
    if (typeof value === 'object') {
      return { valueCoding: value };
    }

    // Handle valueString
    if (typeof value === 'string') {
      // if (option.valueCoding?.code === value || option.valueCoding?.display === value) {
      //
      // }
      return { valueString: value };
    }
  }

  // FIXME No support for Attachment and Reference

  // Quantity support
  if (qItem.type === 'quantity') {
    if (typeof value === 'number') {
      // Handle precision if available
      const precision = getDecimalPrecision(qItem);
      if (typeof precision === 'number') {
        value = parseFloat(value.toFixed(precision));
      }

      return { valueQuantity: { value: value } };
    }

    // TODO implement string for Quantity calcExpressions here
    // if (typeof value === 'string') {
    //
    //   return { valueQuantity: value };
    // }
  }

  return null;
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

/**
 * Evaluate calculated expressions with chaining support.
 * Iteratively evaluates calculated expressions until no more changes occur,
 * ensuring that chained expressions are properly resolved.
 */
export async function processCalculatedExpressions(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  calculatedExpressions: Record<string, CalculatedExpression[]>,
  variables: Variables,
  existingFhirPathContext: Record<string, any>,
  existingFhirPathTerminologyCache: Record<string, any>,
  terminologyServerUrl: string
): Promise<{
  updatedResponse: QuestionnaireResponse;
  updatedCalculatedExpressions: Record<string, CalculatedExpression[]>;
}> {
  let currentResponse = structuredClone(questionnaireResponse);
  let previousCalculatedExpressions = structuredClone(calculatedExpressions);
  let currentCalculatedExpressions = structuredClone(calculatedExpressions);

  let hasChanges = true;
  let iterationCount = 0;
  const maxIterations = 10; // Prevent infinite loops

  // Loop to chain calculated expression updates until stable or limit reached
  while (hasChanges && iterationCount < maxIterations) {
    iterationCount++;
    hasChanges = false;

    // Create updated response item map for current iteration
    const currentResponseItemMap = createQuestionnaireResponseItemMap(
      questionnaire,
      currentResponse
    );

    // Create updated FHIRPath context for current iteration
    const fhirPathEvalResult = await createFhirPathContext(
      currentResponse,
      currentResponseItemMap,
      variables,
      existingFhirPathContext,
      existingFhirPathTerminologyCache,
      terminologyServerUrl
    );
    const { fhirPathContext: updatedFhirPathContext } = fhirPathEvalResult;

    // Evaluate calculated expressions with current context
    const { calculatedExpsIsUpdated, updatedCalculatedExpressions } =
      await evaluateCalculatedExpressionsFhirPath(
        updatedFhirPathContext,
        existingFhirPathTerminologyCache,
        currentCalculatedExpressions,
        terminologyServerUrl
      );
    currentCalculatedExpressions = updatedCalculatedExpressions;

    if (calculatedExpsIsUpdated) {
      hasChanges = true;

      // Apply calculated expression values directly to the response
      currentResponse = applyCalculatedExpressionValuesToResponse(
        questionnaire,
        currentResponse,
        previousCalculatedExpressions,
        currentCalculatedExpressions
      );

      // Update previousCalculatedExpressions for the next iteration
      previousCalculatedExpressions = structuredClone(currentCalculatedExpressions);
    }
  }

  if (iterationCount >= maxIterations) {
    console.warn(
      'Calculated expression chaining reached maximum iterations. Possible circular dependency detected.'
    );
  }

  return {
    updatedResponse: currentResponse,
    updatedCalculatedExpressions: currentCalculatedExpressions
  };
}

/**
 * Generates a unique repeat ID for a calculated expression answer.
 *
 * @param linkId - The item's linkId.
 * @returns A unique calculatedExpression ID.
 */
export function generateCalculatedExpressionsAnswerKey(linkId: string): string {
  return `${linkId}-calculatedExpression-${nanoid()}`;
}
