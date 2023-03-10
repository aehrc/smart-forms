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

import type { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import type { QrRepeatGroup } from '../interfaces/Interfaces';

/**
 * Create a questionnaireResponse from a given questionnaire fprm item
 * A questionnaire form item is the first item of a questionnaire
 *
 * @author Sean Fong
 */
export function createQuestionnaireResponse(
  questionnaireId: string | undefined,
  questionnaireFormItem: QuestionnaireItem
): QuestionnaireResponse {
  const qResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: questionnaireFormItem.linkId,
        text: questionnaireFormItem.text,
        item: []
      }
    ]
  };

  if (questionnaireId) {
    qResponse.questionnaire = `Questionnaire/${questionnaireId}`;
  }

  return qResponse;
}

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
export function createQrGroup(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text,
    item: []
  };
}

/**
 * Create an empty qrItem from a given qItem
 *
 * @author Sean Fong
 */
export function createEmptyQrItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text
  };
}

/**
 * Create an empty qrItem from a given qItem with its display unit
 *
 * @author Sean Fong
 */
export function createEmptyQrItemWithUnit(
  qItem: QuestionnaireItem,
  unit: string
): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: unit !== '' ? `${qItem.text} (${unit})` : qItem.text
  };
}

/**
 * Updates the QuestionnaireResponseItem group by adding/removing a new/modified child QuestionnaireResponseItem into/from a qrGroup
 * Takes either a single newQrItem or an array of newQrItems
 *
 * @author Sean Fong
 */
export function updateLinkedItem(
  newQrItem: QuestionnaireResponseItem | null,
  newQrRepeatGroup: QrRepeatGroup | null,
  qrGroup: QuestionnaireResponseItem,
  qItemsIndexMap: Record<string, number>
): void {
  if (qrGroup['item']) {
    // Get actual sequence indexes of qrItems present within a qrGroup
    // e.g. qrGroup has 4 fields but only the 2nd and 3rd field have values - resulting array is [1, 2]
    const qrItemsRealIndexArr = qrGroup.item.map((qrItem) => qItemsIndexMap[qrItem.linkId]);

    if (newQrItem && newQrItem.linkId in qItemsIndexMap) {
      if (qrGroup.item.length === 0) {
        qrGroup.item.push(newQrItem);
      } else {
        // Get actual sequence index of qrItem within qrGroup
        const newQrItemIndex = qItemsIndexMap[newQrItem.linkId];

        for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
          // Add qrItem at the end of qrGroup if it is larger than the other indexes
          if (newQrItemIndex > qrItemsRealIndexArr[i]) {
            if (i === qrItemsRealIndexArr.length - 1) {
              qrGroup.item.push(newQrItem);
            }
            continue;
          }

          // Replace or delete qrItem at its supposed position if its index is already present within qrGroup
          if (newQrItemIndex === qrItemsRealIndexArr[i]) {
            if (newQrItem.item?.length || newQrItem.answer?.length) {
              // newQrItem has answer value
              qrGroup.item[i] = newQrItem;
            } else {
              // newQrItem has no answer value
              qrGroup.item.splice(i, 1);
            }
            break;
          }

          // Add qrItem at its supposed position if its index is not present within qrGroup
          if (newQrItemIndex < qrItemsRealIndexArr[i]) {
            qrGroup.item.splice(i, 0, newQrItem);
            break;
          }
        }
      }
    } else if (newQrRepeatGroup && newQrRepeatGroup.linkId in qItemsIndexMap) {
      const newQrItems = newQrRepeatGroup.qrItems;
      if (qrGroup.item.length === 0) {
        qrGroup.item.push(...newQrItems);
      } else {
        // Get actual sequence index of qrItems within qrGroup
        const newQrItemIndex = qItemsIndexMap[newQrRepeatGroup.linkId];

        for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
          // Add qrItem at the end of qrGroup if it is larger than the other indexes
          if (newQrItemIndex > qrItemsRealIndexArr[i]) {
            if (i === qrItemsRealIndexArr.length - 1) {
              qrGroup.item.push(...newQrItems);
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
                qrGroup.item[i + j] = newQrItems[j];
              }
              break;
            } else if (newQrItems.length > repeatGroupItemCount) {
              // Replace each repeat group qrItem with their new counterparts,
              // followed by adding an extra newQrItem behind the newly replaced qrItems
              for (let j = 0, k = repeatGroupItemCount; j < newQrItems.length; j++, k--) {
                if (k > 0) {
                  qrGroup.item[i + j] = newQrItems[j];
                } else {
                  qrGroup.item.splice(i + j, 0, newQrItems[j]);
                }
              }
              break;
            } else if (newQrItems.length < repeatGroupItemCount) {
              // Replace each repeat group qrItem with their new counterparts (except the last one),
              // followed by deleting the last newQrItem which wasn't replaced
              for (let j = 0; j < repeatGroupItemCount; j++) {
                if (j <= newQrItems.length - 1) {
                  qrGroup.item[i + j] = newQrItems[j];
                } else {
                  qrGroup.item.splice(i + j, 1);
                }
              }
              break;
            }
          }

          // Add qrItem at its supposed position if its index is not present within qrGroup
          if (newQrItemIndex < qrItemsRealIndexArr[i]) {
            for (let j = 0; j < newQrItems.length; j++) {
              qrGroup.item.splice(i + j, 0, newQrItems[j]);
            }
            break;
          }
        }
      }
    }
  }
}
