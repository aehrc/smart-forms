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

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { qrItemHasItemsOrAnswer } from './manageForm';

export type RecursiveUpdateFunction<T> = (
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  extraData: T
) => QuestionnaireResponseItem | QuestionnaireResponseItem[] | null;

/**
 * A generic (and safe) way to update a QuestionnaireResponse given a recursive function and a set of data i.e. Record<linkId, calculated expression values>, Record<linkId, re-populated values>
 * This function relies heavily on mapQItemsIndex() and getQrItemsIndex() to accurately pinpoint the locations of QR items based on their positions in the Q, taking into account repeating group answers, non-filled questions, etc
 *
 * @author Sean Fong
 */
export function updateQuestionnaireResponse<T>(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  recursiveUpdateFunction: RecursiveUpdateFunction<T>,
  extraData: T
) {
  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !questionnaireResponse.item ||
    questionnaireResponse.item.length === 0
  ) {
    return questionnaireResponse;
  }

  const qItemsIndexMap = mapQItemsIndex(questionnaire);
  const topLevelQRItemsByIndex = getQrItemsIndex(
    questionnaire.item,
    questionnaireResponse.item,
    qItemsIndexMap
  );

  const topLevelQrItems = [];
  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    const topLevelQRItemOrItems = topLevelQRItemsByIndex[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text,
      item: []
    };

    const updatedTopLevelQRItem = recursiveUpdateFunction(
      topLevelQItem,
      topLevelQRItemOrItems,
      extraData
    );

    if (Array.isArray(updatedTopLevelQRItem)) {
      if (updatedTopLevelQRItem.length > 0) {
        topLevelQrItems.push(...updatedTopLevelQRItem);
      }
      continue;
    }

    if (updatedTopLevelQRItem && qrItemHasItemsOrAnswer(updatedTopLevelQRItem)) {
      topLevelQrItems.push(updatedTopLevelQRItem);
    }
  }

  return { ...questionnaireResponse, item: topLevelQrItems };
}

export type RecursiveReadArrayFunction<T> = (
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null
) => T[] | null;

/**
 * A generic (and safe) way to read an array of element(s) i.e. QuestionnaireResponseItem[], extracted Observation[] from a QuestionnaireResponse given a recursive function.
 * This function relies heavily on mapQItemsIndex() and getQrItemsIndex() to accurately pinpoint the locations of QR items based on their positions in the Q, taking into account repeating group answers, non-filled questions, etc
 *
 * @author Sean Fong
 */
export function readQuestionnaireResponse<T>(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  recursiveReadFunction: RecursiveReadArrayFunction<T>
): T[] {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return [];
  }

  const qItemsIndexMap = mapQItemsIndex(questionnaire);
  const topLevelQRItemsByIndex = getQrItemsIndex(
    questionnaire.item,
    questionnaireResponse.item ?? [],
    qItemsIndexMap
  );

  const readValueArray = [];
  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    const topLevelQRItemOrItems = topLevelQRItemsByIndex[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text,
      item: []
    };

    const readValue = recursiveReadFunction(topLevelQItem, topLevelQRItemOrItems);

    if (readValue) {
      readValueArray.push(...readValue);
    }
  }

  return readValueArray;
}
