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
import moment from 'moment';

interface EvaluateInitialCalculatedExpressionsParams {
  initialResponse: QuestionnaireResponse;
  calculatedExpressions: Record<string, CalculatedExpression>;
  variablesFhirPath: Record<string, Expression[]>;
}

export function evaluateInitialCalculatedExpressions(
  params: EvaluateInitialCalculatedExpressionsParams
): Record<string, CalculatedExpression> {
  const { initialResponse, calculatedExpressions, variablesFhirPath } = params;

  // Return early if initialResponse is empty
  if (_isEqual(initialResponse, cloneDeep(emptyResponse))) {
    return calculatedExpressions;
  }

  const initialCalculatedExpressions: Record<string, CalculatedExpression> = {
    ...calculatedExpressions
  };

  if (Object.keys(initialCalculatedExpressions).length > 0) {
    const fhirPathContext: Record<string, any> = createFhirPathContext(
      initialResponse,
      variablesFhirPath
    );

    for (const linkId in initialCalculatedExpressions) {
      try {
        const result = fhirpath.evaluate(
          initialResponse,
          calculatedExpressions[linkId].expression,
          fhirPathContext,
          fhirpath_r4_model
        );

        if (!_isEqual(calculatedExpressions[linkId].value, result[0])) {
          initialCalculatedExpressions[linkId].value = result[0];
        }
      } catch (e) {
        console.warn(
          e.message,
          `LinkId: ${linkId}\nExpression: ${calculatedExpressions[linkId].expression}`
        );
      }
    }
  }
  return initialCalculatedExpressions;
}

export function evaluateCalculatedExpressions(
  fhirPathContext: Record<string, any>,
  calculatedExpressions: Record<string, CalculatedExpression>
): {
  calculatedExpsIsUpdated: boolean;
  updatedCalculatedExpressions: Record<string, CalculatedExpression>;
} {
  const updatedCalculatedExpressions: Record<string, CalculatedExpression> = {
    ...calculatedExpressions
  };

  let isUpdated = false;
  for (const linkId in calculatedExpressions) {
    try {
      const result = fhirpath.evaluate(
        '',
        calculatedExpressions[linkId].expression,
        fhirPathContext,
        fhirpath_r4_model
      );

      if (result.length > 0) {
        if (!_isEqual(calculatedExpressions[linkId].value, result[0])) {
          isUpdated = true;
          updatedCalculatedExpressions[linkId].value = result[0];
        }
      }
    } catch (e) {
      console.warn(
        e.message,
        `LinkId: ${linkId}\nExpression: ${calculatedExpressions[linkId].expression}`
      );
    }
  }

  return {
    calculatedExpsIsUpdated: isUpdated,
    updatedCalculatedExpressions: updatedCalculatedExpressions
  };
}

export function initialiseCalculatedExpressionValues(
  questionnaire: Questionnaire,
  populatedResponse: QuestionnaireResponse,
  calculatedExpressions: Record<string, CalculatedExpression>
): QuestionnaireResponse {
  const calculatedExpressionsWithValues = Object.keys(calculatedExpressions)
    .filter((key) => calculatedExpressions[key].value !== undefined)
    .reduce(
      (mapping: Record<string, CalculatedExpression>, key: string) => (
        (mapping[key] = calculatedExpressions[key]), mapping
      ),
      {}
    );

  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !populatedResponse.item ||
    populatedResponse.item.length === 0
  ) {
    return populatedResponse;
  }

  const topLevelQrItems: QuestionnaireResponseItem[] = [];
  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    const populatedTopLevelQrItem = populatedResponse.item[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text,
      item: []
    };

    const updatedTopLevelQRItem = initialiseItemCalculatedExpressionValueRecursive(
      topLevelQItem,
      populatedTopLevelQrItem,
      calculatedExpressionsWithValues
    );

    if (Array.isArray(updatedTopLevelQRItem)) {
      if (updatedTopLevelQRItem.length > 0) {
        topLevelQrItems.push(...updatedTopLevelQRItem);
      }
      continue;
    }

    if (updatedTopLevelQRItem) {
      topLevelQrItems.push(updatedTopLevelQRItem);
    }
  }

  return { ...populatedResponse, item: topLevelQrItems };
}

function initialiseItemCalculatedExpressionValueRecursive(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | undefined,
  calculatedExpressions: Record<string, CalculatedExpression>
): QuestionnaireResponseItem[] | QuestionnaireResponseItem | null {
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    // iterate through items of item recursively
    const childQrItems = qrItem?.item ?? [];
    // const updatedChildQrItems: QuestionnaireResponseItem[] = [];

    // FIXME Not implemented for repeat groups
    if (qItem.type === 'group' && qItem.repeats) {
      return qrItem ?? null;
    }

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // Otherwise loop through qItem as usual
    for (const [index, childQItem] of childQItems.entries()) {
      const childQrItem = qrItemsByIndex[index];

      // FIXME Not implemented for repeat groups
      if (Array.isArray(childQrItem)) {
        continue;
      }

      const newQrItem = initialiseItemCalculatedExpressionValueRecursive(
        childQItem,
        childQrItem,
        calculatedExpressions
      );

      // FIXME Not implemented for repeat groups
      if (Array.isArray(newQrItem)) {
        continue;
      }

      if (newQrItem) {
        updateQrItemsInGroup(
          newQrItem,
          null,
          qrItem ?? { linkId: qItem.linkId, text: qItem.text, item: [] },
          indexMap
        );
      }
    }

    return constructGroupItem(qItem, qrItem, calculatedExpressions);
  }

  return constructSingleItem(qItem, calculatedExpressions);
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | undefined,
  calculatedExpressions: Record<string, CalculatedExpression>
): QuestionnaireResponseItem | null {
  const itemCalculatedExpression = calculatedExpressions[qItem.linkId];
  let calculatedExpressionAnswer: QuestionnaireResponseItemAnswer | undefined;
  if (itemCalculatedExpression && itemCalculatedExpression.value) {
    calculatedExpressionAnswer = parseValueToAnswer(qItem, itemCalculatedExpression.value);
  }

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
  calculatedExpressions: Record<string, CalculatedExpression>
): QuestionnaireResponseItem | null {
  const itemCalculatedExpression = calculatedExpressions[qItem.linkId];
  let calculatedExpressionAnswer: QuestionnaireResponseItemAnswer | undefined;
  if (itemCalculatedExpression && itemCalculatedExpression.value) {
    calculatedExpressionAnswer = parseValueToAnswer(qItem, itemCalculatedExpression.value);
  }

  if (!calculatedExpressionAnswer) {
    return null;
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
  return moment(formattedDate, acceptedFormats, true).isValid();
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
