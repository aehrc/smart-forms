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
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';

export function removeInternalRepeatIdsRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // Process repeating group items separately
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    return removeInternalRepeatIdsFromRepeatGroup(qItem, qrItemOrItems);
  }

  // At this point qrItemOrItems is a single QuestionnaireResponseItem
  const qrItem = qrItemOrItems;

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

      const updatedChildQRItemOrItems = removeInternalRepeatIdsRecursive(
        childQItem,
        childQRItemOrItems ?? null
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
  return removeInternalRepeatIdsFromItem(qItem, qrItem, updatedChildQrItems);
}

function removeInternalRepeatIdsFromRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[]
) {
  if (!qItem.item) {
    return [];
  }

  return qrItems
    .flatMap((childQrItem) => removeInternalRepeatIdsRecursive(qItem, childQrItem))
    .filter((childQRItem): childQRItem is QuestionnaireResponseItem => !!childQRItem);
}

function removeInternalRepeatIdsFromItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  childQrItems: QuestionnaireResponseItem[]
): QuestionnaireResponseItem | null {
  if (!qrItem) {
    return null;
  }

  // Remove internal repeatId from all answers
  const updatedAnswers: QuestionnaireResponseItemAnswer[] =
    qrItem.answer
      ?.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, ...rest }) => {
          return {
            ...rest
          };
        }
      )
      .filter((answer) => !!answer && Object.keys(answer).length > 0) ?? [];

  return {
    linkId: qItem.linkId,
    ...(qItem.text && { text: qItem.text }),
    ...(childQrItems.length > 0 && { item: childQrItems }),
    ...(updatedAnswers.length > 0 && { answer: updatedAnswers })
  };
}
