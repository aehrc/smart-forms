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
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHiddenByEnableWhen } from './qItem';
import { qrItemHasItemsOrAnswer } from './manageForm';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';

/**
 * Recursively go through the questionnaireResponse and remove qrItems whose qItems are empty in the form
 *
 * @author Sean Fong
 */
export function removeEmptyAnswersFromItemRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  enableWhenContext: {
    enableWhenIsActivated: boolean;
    enableWhenItems: EnableWhenItems;
    enableWhenExpressions: EnableWhenExpressions;
  }
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // Process repeating group items separately
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    return removeEmptyAnswersFromRepeatGroup(qItem, qrItemOrItems, enableWhenContext);
  }

  // At this point, qrItemOrItems is a single QuestionnaireResponseItem
  const qrItem = qrItemOrItems;

  // If QR item is null, return null
  if (qrItem === null) {
    return null;
  }

  // If QR item don't have either item.item and item.answer, return null
  if (!qrItemHasItemsOrAnswer(qrItem)) {
    return null;
  }

  // If qItem is hidden by enableWhen, return null
  if (
    isHiddenByEnableWhen({
      linkId: qItem.linkId,
      enableWhenIsActivated: enableWhenContext.enableWhenIsActivated,
      enableWhenItems: enableWhenContext.enableWhenItems,
      enableWhenExpressions: enableWhenContext.enableWhenExpressions
    })
  ) {
    return null;
  }

  // Process items with child items
  const childQItems = qItem.item ?? [];
  const childQrItems = qrItem?.item ?? [];
  const updatedChildQrItems: QuestionnaireResponseItem[] = [];
  if (childQItems.length > 0) {
    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // Iterate child items
    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      const updatedChildQRItemOrItems = removeEmptyAnswersFromItemRecursive(
        childQItem,
        childQRItemOrItems ?? null,
        enableWhenContext
      );

      if (Array.isArray(updatedChildQRItemOrItems)) {
        if (updatedChildQRItemOrItems.length > 0) {
          updatedChildQrItems.push(...updatedChildQRItemOrItems);
        }
        continue;
      }

      if (updatedChildQRItemOrItems) {
        updatedChildQrItems.push(updatedChildQRItemOrItems);
      }
    }
  }

  // Construct updated qrItem
  return removeEmptyAnswersFromItem(qItem, qrItem, updatedChildQrItems);
}

function removeEmptyAnswersFromRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  enableWhenContext: {
    enableWhenIsActivated: boolean;
    enableWhenItems: EnableWhenItems;
    enableWhenExpressions: EnableWhenExpressions;
  }
) {
  if (!qItem.item) {
    return [];
  }

  return qrItems
    .flatMap((childQrItem) =>
      removeEmptyAnswersFromItemRecursive(qItem, childQrItem, enableWhenContext)
    )
    .filter((childQRItem): childQRItem is QuestionnaireResponseItem => !!childQRItem);
}

function removeEmptyAnswersFromItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  childQrItems: QuestionnaireResponseItem[]
): QuestionnaireResponseItem | null {
  if (!qrItem) {
    return null;
  }

  // Remove empty answers
  const updatedAnswers: QuestionnaireResponseItemAnswer[] =
    qrItem.answer?.filter((answer) => !isEmptyAnswer(answer)) ?? [];

  // Remove item if it has no answers and no children
  if (updatedAnswers.length === 0 && childQrItems.length === 0) {
    return null;
  }

  return {
    linkId: qItem.linkId,
    ...(qItem.text && { text: qItem.text }),
    ...(childQrItems.length > 0 && { item: childQrItems }),
    ...(updatedAnswers.length > 0 && { answer: updatedAnswers })
  };
}

function isEmptyAnswer(answer: QuestionnaireResponseItemAnswer): boolean {
  return answer?.valueString?.trim() === '' || answer?.item?.length === 0;
}
