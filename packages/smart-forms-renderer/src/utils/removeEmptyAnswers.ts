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
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHiddenByEnableWhen } from './qItem';
import { qrItemHasItemsOrAnswer } from './manageForm';

interface removeEmptyAnswersParams {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

/**
 * Recursively go through the questionnaireResponse and remove qrItems whose qItems are empty in the form
 *
 * @author Sean Fong
 */
export function removeEmptyAnswers(params: removeEmptyAnswersParams): QuestionnaireResponse {
  const {
    questionnaire,
    questionnaireResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  const topLevelQItems = questionnaire.item;
  const topLevelQRItems = questionnaireResponse.item;
  if (
    !topLevelQItems ||
    topLevelQItems.length === 0 ||
    !topLevelQRItems ||
    topLevelQRItems.length === 0
  ) {
    const updatedQuestionnaireResponse = structuredClone(questionnaireResponse);
    delete updatedQuestionnaireResponse.item;
    return updatedQuestionnaireResponse;
  }

  const newQuestionnaireResponse: QuestionnaireResponse = { ...questionnaireResponse, item: [] };
  for (const [i, topLevelQRItem] of topLevelQRItems.entries()) {
    const qItem = topLevelQItems[i];
    if (!qItem) {
      continue;
    }

    // If QR item don't have either item.item and item.answer, continue
    if (!qrItemHasItemsOrAnswer(topLevelQRItem)) {
      continue;
    }

    const newTopLevelQRItem = removeEmptyAnswersFromItemRecursive({
      qItem,
      qrItem: topLevelQRItem,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });
    if (newTopLevelQRItem && newQuestionnaireResponse.item) {
      newQuestionnaireResponse.item.push(newTopLevelQRItem);
    }
  }

  return newQuestionnaireResponse;
}

interface removeEmptyAnswersFromItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

function removeEmptyAnswersFromItemRecursive(
  params: removeEmptyAnswersFromItemRecursiveParams
): QuestionnaireResponseItem | null {
  const { qItem, qrItem, enableWhenIsActivated, enableWhenItems, enableWhenExpressions } = params;

  // If QR item don't have either item.item and item.answer, return null
  if (!qrItemHasItemsOrAnswer(qrItem)) {
    return null;
  }

  const qItems = qItem.item;
  const qrItems = qrItem.item;

  // Process group items
  if (qItems && qItems.length > 0) {
    // Return nothing if corresponding qItem is hidden via enableWhen
    if (
      isHiddenByEnableWhen({
        linkId: qItem.linkId,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      })
    ) {
      return null;
    }

    if (qrItems && qrItems.length > 0) {
      const newQrItems: QuestionnaireResponseItem[] = [];

      // Loop over qItems - but end loop if we either reach the end of qItems or qrItems
      // Under normal circumstances we will reach the end of both arrays together
      for (
        let qItemIndex = 0, qrItemIndex = 0;
        qItemIndex < qItems.length || qrItemIndex < qrItems.length;
        qItemIndex++
      ) {
        // Save qrItem if linkIds of current qItem and qrItem are the same
        if (qrItems[qrItemIndex] && qItems[qItemIndex].linkId === qrItems[qrItemIndex].linkId) {
          const newQrItem = removeEmptyAnswersFromItemRecursive({
            qItem: qItems[qItemIndex],
            qrItem: qrItems[qrItemIndex],
            enableWhenIsActivated,
            enableWhenItems,
            enableWhenExpressions
          });

          if (newQrItem) {
            newQrItems.push(newQrItem);
          }

          // Decrement qItem index if the next qrItem is an answer from a repeatGroup
          // Essentially persisting the current qItem linked to be matched up with the next qrItem linkId
          if (
            qrItems.length !== qrItemIndex + 1 &&
            qrItems[qrItemIndex].linkId === qrItems[qrItemIndex + 1].linkId
          ) {
            qItemIndex--;
          }

          // Only Increment qrItem index whenever the current qrItem linkId matches up with the current qItem
          qrItemIndex++;
        }
      }
      return { ...qrItem, item: newQrItems };
    }

    // Also perform checks if answer exists
    return answerIsEmpty(
      qItem,
      qrItem,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    )
      ? null
      : qrItem;
  }

  // Process non-group items
  return answerIsEmpty(qItem, qrItem, enableWhenIsActivated, enableWhenItems, enableWhenExpressions)
    ? null
    : { ...qrItem };
}

function answerIsEmpty(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  enableWhenIsActivated: boolean,
  enableWhenItems: EnableWhenItems,
  enableWhenExpressions: EnableWhenExpressions
) {
  if (
    isHiddenByEnableWhen({
      linkId: qItem.linkId,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    })
  ) {
    return true;
  }

  if (!qrItem.answer) {
    return true;
  }

  if (qrItem.answer.length === 0) {
    return true;
  }

  if (qrItem.answer[0]?.valueString === '') {
    return true;
  }

  return false;
}
