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
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import _isEqual from 'lodash/isEqual';
import { emptyResponse } from './emptyResource';
import { createFhirPathContext } from './fhirpath';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { updateQrItemsInGroup } from './qrItem';
import cloneDeep from 'lodash.clonedeep';
import dayjs from 'dayjs';
import { updateQuestionnaireResponse } from './updateQr';

interface EvaluateInitialCalculatedExpressionsParams {
  initialResponse: QuestionnaireResponse;
  initialResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  variablesFhirPath: Record<string, Expression[]>;
  existingFhirPathContext: Record<string, any>;
}

export function evaluateInitialCalculatedExpressions(
  params: EvaluateInitialCalculatedExpressionsParams
): {
  initialCalculatedExpressions: Record<string, CalculatedExpression[]>;
  updatedFhirPathContext: Record<string, any>;
} {
  const {
    initialResponse,
    initialResponseItemMap,
    calculatedExpressions,
    variablesFhirPath,
    existingFhirPathContext
  } = params;

  // Return early if initialResponse is empty or there are no calculated expressions to evaluate
  if (
    _isEqual(initialResponse, cloneDeep(emptyResponse)) ||
    Object.keys(calculatedExpressions).length === 0
  ) {
    return {
      initialCalculatedExpressions: calculatedExpressions,
      updatedFhirPathContext: existingFhirPathContext
    };
  }

  const initialCalculatedExpressions: Record<string, CalculatedExpression[]> = {
    ...calculatedExpressions
  };

  const updatedFhirPathContext = createFhirPathContext(
    initialResponse,
    initialResponseItemMap,
    variablesFhirPath,
    existingFhirPathContext
  );

  for (const linkId in initialCalculatedExpressions) {
    const itemCalcExpressions = calculatedExpressions[linkId];

    for (const calcExpression of itemCalcExpressions) {
      try {
        const result = fhirpath.evaluate(
          {},
          calcExpression.expression,
          updatedFhirPathContext,
          fhirpath_r4_model
        );

        // Only update calculatedExpressions if length of result array > 0
        if (result.length > 0 && !_isEqual(calcExpression.value, result[0])) {
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
    updatedFhirPathContext
  };
}

export function evaluateCalculatedExpressions(
  fhirPathContext: Record<string, any>,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): {
  calculatedExpsIsUpdated: boolean;
  updatedCalculatedExpressions: Record<string, CalculatedExpression[]>;
} {
  const updatedCalculatedExpressions: Record<string, CalculatedExpression[]> = {
    ...calculatedExpressions
  };

  let isUpdated = false;
  for (const linkId in calculatedExpressions) {
    const itemCalcExpressions = calculatedExpressions[linkId];

    for (const calcExpression of itemCalcExpressions) {
      try {
        const result = fhirpath.evaluate(
          {},
          calcExpression.expression,
          fhirPathContext,
          fhirpath_r4_model
        );

        // Update calculatedExpressions if length of result array > 0
        // Only update when current calcExpression value is different from the result, otherwise it will result in an infinite loop as per issue #733
        if (result.length > 0 && !_isEqual(calcExpression.value, result[0])) {
          isUpdated = true;
          calcExpression.value = result[0];
        }

        // Update calculatedExpression value to null if no result is returned
        if (result.length === 0 && calcExpression.value !== null) {
          isUpdated = true;
          calcExpression.value = null;
        }
      } catch (e) {
        console.warn(e.message, `LinkId: ${linkId}\nExpression: ${calcExpression.expression}`);
      }
    }

    updatedCalculatedExpressions[linkId] = itemCalcExpressions;
  }

  return {
    calculatedExpsIsUpdated: isUpdated,
    updatedCalculatedExpressions: updatedCalculatedExpressions
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
    return qrItemOrItems;
  }

  const qrItem = qrItemOrItems;
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
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

      // FIXME Not implemented for repeat groups
      if (Array.isArray(updatedChildQRItemOrItems)) {
        continue;
      }

      const updatedChildQRItem = updatedChildQRItemOrItems;
      if (updatedChildQRItem) {
        updateQrItemsInGroup(
          updatedChildQRItem,
          null,
          updatedChildQRItem ?? { linkId: qItem.linkId, text: qItem.text, item: [] },
          indexMap
        );
      }
    }

    return constructGroupItem(qItem, qrItem, calculatedExpressions);
  }

  return constructSingleItem(qItem, qrItem, calculatedExpressions);
}

function getCalculatedExpressionAnswer(
  qItem: QuestionnaireItem,
  calculatedExpressions: Record<string, CalculatedExpression[]>
): QuestionnaireResponseItemAnswer | undefined {
  const calcExpressionFromItem = calculatedExpressions[qItem.linkId]?.find(
    (calcExpression) => calcExpression.from === 'item'
  );

  if (calcExpressionFromItem && calcExpressionFromItem.value) {
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
      (option: QuestionnaireItemAnswerOption) => option.valueCoding?.code === value?.code
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

  if (typeof value === 'object') {
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
