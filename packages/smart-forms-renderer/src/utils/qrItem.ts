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

import type { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

import type { QrRepeatGroup } from '../interfaces/repeatGroup.interface';

/**
 * Remove items with no answers from a given questionnaireResponse
 * Also remove any starting or trailing whitespace from valueStrings
 * Generated questionnaireResponse only has items with answers
 *
 * @author Sean Fong
 */
export function removeNoAnswerQrItem(
  qrItem: QuestionnaireResponseItem
): QuestionnaireResponseItem | undefined {
  const items = qrItem.item;
  if (items && items.length > 0) {
    const itemsCleaned: QuestionnaireResponseItem[] = [];

    // only get items with answers
    items.forEach((item) => {
      const QrItemCleaned = removeNoAnswerQrItem(item);
      if (QrItemCleaned) {
        itemsCleaned.push(QrItemCleaned);
      }
    });

    return itemsCleaned.length > 0 ? { ...qrItem, item: itemsCleaned } : undefined;
  }

  // remove starting or trailing whitespace
  if (qrItem['answer'] && qrItem['answer'][0]['valueString']) {
    qrItem['answer'][0]['valueString'] = qrItem['answer'][0]['valueString'].trim();
  }

  // check answer when qrItem is a single question
  return qrItem['answer'] ? qrItem : undefined;
}

/**
 * Create an empty group qrItem from a given group qItem
 *
 * @author Sean Fong
 */
export function createEmptyQrGroup(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text,
    item: []
  };
}

/**
 * Create an empty qrItem from a given qItem, optionally with an answer key
 *
 * @author Sean Fong
 */
export function createEmptyQrItem(
  qItem: QuestionnaireItem,
  answerKey: string | undefined
): QuestionnaireResponseItem {
  const qrItem: QuestionnaireResponseItem = {
    linkId: qItem.linkId,
    text: qItem.text
  };

  if (answerKey) {
    qrItem.answer = [{ id: answerKey }];
  }

  return qrItem;
}

/**
 * Updates the QuestionnaireResponseItem group by adding/removing a new/modified child QuestionnaireResponseItem into/from a qrGroup
 * Takes either a single newQrItem or an array of newQrItems
 *
 * @author Sean Fong
 */
export function updateQrItemsInGroup(
  newQrItem: QuestionnaireResponseItem | null,
  newQrRepeatGroup: QrRepeatGroup | null,
  questionnaireResponseOrQrItem: QuestionnaireResponseItem | QuestionnaireResponse,
  qItemsIndexMap: Record<string, number>
): void {
  let qrItems = questionnaireResponseOrQrItem.item;
  if (!qrItems) {
    qrItems = [];
  }

  // Get actual sequence indexes of qrItems present within a qrGroup
  // e.g. qrGroup has 4 fields but only the 2nd and 3rd field have values - resulting array is [1, 2]
  const qrItemsRealIndexArr = qrItems.map((qrItem) => qItemsIndexMap[qrItem.linkId]);

  if (newQrItem && newQrItem.linkId in qItemsIndexMap) {
    if (qrItems.length === 0) {
      qrItems.push(newQrItem);
      return;
    }

    // Get actual sequence index of qrItem within qrGroup
    const newQrItemIndex = qItemsIndexMap[newQrItem.linkId];
    for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
      // Add qrItem at the end of qrGroup if it is larger than the other indexes
      if (newQrItemIndex > qrItemsRealIndexArr[i]) {
        if (i === qrItemsRealIndexArr.length - 1) {
          qrItems.push(newQrItem);
        }
        continue;
      }

      // Replace or delete qrItem at its supposed position if its index is already present within qrGroup
      if (newQrItemIndex === qrItemsRealIndexArr[i]) {
        // newQrItem has answer value
        if (newQrItem.item?.length || newQrItem.answer?.length) {
          qrItems[i] = newQrItem;
          break;
        }

        // newQrItem has no answer value
        qrItems.splice(i, 1);
        break;
      }

      // Add qrItem at its supposed position if its index is not present within qrGroup
      if (newQrItemIndex < qrItemsRealIndexArr[i]) {
        qrItems.splice(i, 0, newQrItem);
        break;
      }
    }
  }

  if (newQrRepeatGroup && newQrRepeatGroup.linkId in qItemsIndexMap) {
    const newQrItems = newQrRepeatGroup.qrItems;
    if (qrItems.length === 0) {
      qrItems.push(...newQrItems);
      return;
    }

    // Get actual sequence index of qrItems within qrGroup
    const newQrItemIndex = qItemsIndexMap[newQrRepeatGroup.linkId];
    for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
      // Add qrItem at the end of qrGroup if it is larger than the other indexes
      if (newQrItemIndex > qrItemsRealIndexArr[i]) {
        if (i === qrItemsRealIndexArr.length - 1) {
          qrItems.push(...newQrItems);
        }
        continue;
      }

      // Replace or delete qrItem at its supposed position if its index is already present within qrGroup
      if (newQrItemIndex === qrItemsRealIndexArr[i]) {
        // Get number of repeatGroupItems that has the same linkId present in qrGroup
        let repeatGroupItemCount = 0;
        while (newQrItemIndex === qrItemsRealIndexArr[i + repeatGroupItemCount]) {
          repeatGroupItemCount++;
        }

        // Replace each repeat group qrItem with their new counterparts
        if (newQrItems.length === repeatGroupItemCount) {
          for (let j = 0; j < newQrItems.length; j++) {
            qrItems[i + j] = newQrItems[j];
          }
          break;
        }

        if (newQrItems.length > repeatGroupItemCount) {
          // Replace each repeat group qrItem with their new counterparts,
          // followed by adding an extra newQrItem behind the newly replaced qrItems
          for (let j = 0, k = repeatGroupItemCount; j < newQrItems.length; j++, k--) {
            if (k > 0) {
              qrItems[i + j] = newQrItems[j];
            } else {
              qrItems.splice(i + j, 0, newQrItems[j]);
            }
          }
          break;
        }

        if (newQrItems.length < repeatGroupItemCount) {
          // Replace each repeat group qrItem with their new counterparts (except the last one),
          // followed by deleting the last newQrItem which wasn't replaced
          for (let j = 0; j < repeatGroupItemCount; j++) {
            if (j <= newQrItems.length - 1) {
              qrItems[i + j] = newQrItems[j];
            } else {
              qrItems.splice(i + j, 1);
            }
          }
          break;
        }
      }

      // Add qrItem at its supposed position if its index is not present within qrGroup
      if (newQrItemIndex < qrItemsRealIndexArr[i]) {
        for (let j = 0; j < newQrItems.length; j++) {
          qrItems.splice(i + j, 0, newQrItems[j]);
        }
        break;
      }
    }
  }
}
