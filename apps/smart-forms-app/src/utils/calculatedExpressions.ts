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

import type { CalculatedExpression } from '../features/calculatedExpression/types/calculatedExpression.interface.ts';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type {
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import _isEqual from 'lodash/isEqual';
import { createFhirPathContext } from './fhirpath.ts';
import { getQrItemsIndex, mapQItemsIndex } from '../features/renderer/utils';
import { updateQrGroup } from '../features/renderer/utils/qrItem.ts';
import { emptyResponse } from './qrItem.ts';

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
  if (_isEqual(initialResponse, emptyResponse)) {
    return calculatedExpressions;
  }

  const initialExpressions: Record<string, CalculatedExpression> = { ...calculatedExpressions };

  if (Object.keys(initialExpressions).length > 0) {
    const fhirPathContext: Record<string, any> = createFhirPathContext(
      initialResponse,
      variablesFhirPath
    );

    for (const linkId in initialExpressions) {
      try {
        const result = fhirpath.evaluate(
          initialResponse,
          calculatedExpressions[linkId].expression,
          fhirPathContext,
          fhirpath_r4_model
        );

        if (calculatedExpressions[linkId].value !== result[0]) {
          initialExpressions[linkId].value = result[0];
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }
  return initialExpressions;
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
        if (calculatedExpressions[linkId].value !== result[0]) {
          isUpdated = true;
          updatedCalculatedExpressions[linkId].value = result[0];
        }
      }
    } catch (e) {
      console.warn(e);
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
        updateQrGroup(
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

function parseValueToAnswer(
  qItem: QuestionnaireItem,
  value: string | number
): QuestionnaireResponseItemAnswer {
  if (typeof value === 'number') {
    if (qItem.type === 'integer') {
      return { valueInteger: value };
    }

    return { valueDecimal: value };
  }

  return { valueString: value };
}
