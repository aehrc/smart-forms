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

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import type { Tabs } from '../interfaces/tab.interface';
import { getShortText } from './itemControl';
import _isEqual from 'lodash/isEqual';

export interface ItemToRepopulate {
  qItem: QuestionnaireItem | null;
  tabName: string | null;
  newQRItem: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
}

export function getItemsToRepopulate(
  sourceQuestionnaire: Questionnaire,
  itemTypes: Record<string, string>,
  tabs: Tabs,
  populatedResponse: QuestionnaireResponse,
  updatableResponse: QuestionnaireResponse
): Record<string, ItemToRepopulate> {
  if (
    !sourceQuestionnaire.item ||
    sourceQuestionnaire.item.length === 0 ||
    !populatedResponse.item ||
    populatedResponse.item.length === 0 ||
    !updatableResponse.item ||
    updatableResponse.item.length === 0
  ) {
    return {};
  }

  const populatedItems: QuestionnaireResponseItem[] = [];
  for (const topLevelItem of populatedResponse.item) {
    populatedItems.push(...getPopulatedItemsRecursive(topLevelItem, itemTypes));
  }

  const itemsToRepopulate = populatedItems.reduce(
    (mapping: Record<string, ItemToRepopulate>, item) => {
      mapping[item.linkId] = {
        qItem: null,
        tabName: null,
        newQRItem: item
      };
      return mapping;
    },
    {}
  );

  // Get corresponding old items from updatableResponse if they are different
  for (const topLevelItem of sourceQuestionnaire.item) {
    const isTab = !!tabs[topLevelItem.linkId];
    let tabName: string | null = null;
    if (isTab) {
      tabName = getShortText(topLevelItem) ?? topLevelItem.text ?? null;
    }

    getCorrespondingQuestionnaireItemsRecursive(topLevelItem, tabName, itemsToRepopulate);
  }

  // Get corresponding old items from updatableResponse if they are different
  for (const topLevelItem of updatableResponse.item) {
    checkCorrespondingOldItemsRecursive(topLevelItem, itemTypes, itemsToRepopulate);
  }

  return itemsToRepopulate;
}

// 1. Get items to repopulate (only new items)
// 2. Get corresponding old items from updatableResponse (if they are different)
// 3. Compare old and new items in dialog - if there are none, show a dialog saying there is no new data
// 4. Have checkboxes in dialog to update response
// 5. Replace old answers with new answers

function getCorrespondingQuestionnaireItemsRecursive(
  qItem: QuestionnaireItem,
  tabName: string | null,
  itemsToRepopulate: Record<string, ItemToRepopulate>
): void {
  if (qItem.type === 'group' && qItem.item && qItem.item.length > 0) {
    for (const childItem of qItem.item) {
      getCorrespondingQuestionnaireItemsRecursive(childItem, tabName, itemsToRepopulate);
    }

    return;
  }

  if (!itemsToRepopulate[qItem.linkId]) {
    return;
  }

  itemsToRepopulate[qItem.linkId].qItem = qItem;
  itemsToRepopulate[qItem.linkId].tabName = tabName;
}

function getPopulatedItemsRecursive(
  qrItem: QuestionnaireResponseItem,
  itemTypes: Record<string, string>
): QuestionnaireResponseItem[] {
  const itemType = itemTypes[qrItem.linkId];
  if (itemType === 'group' && qrItem.item && qrItem.item.length > 0) {
    const populatedChildItems: QuestionnaireResponseItem[] = [];
    for (const childItem of qrItem.item) {
      populatedChildItems.push(...getPopulatedItemsRecursive(childItem, itemTypes));
    }

    return populatedChildItems;
  }

  // record item if it is not a group item
  return [qrItem];
}

function checkCorrespondingOldItemsRecursive(
  qrItem: QuestionnaireResponseItem,
  itemTypes: Record<string, string>,
  itemsToRepopulate: Record<string, ItemToRepopulate>
): void {
  const itemType = itemTypes[qrItem.linkId];
  if (itemType === 'group' && qrItem.item && qrItem.item.length > 0) {
    for (const childItem of qrItem.item) {
      checkCorrespondingOldItemsRecursive(childItem, itemTypes, itemsToRepopulate);
    }

    return;
  }

  const oldItem = qrItem;
  const newItem = itemsToRepopulate[qrItem.linkId]?.newQRItem;

  if (!newItem) {
    return;
  }

  if (_isEqual(oldItem, newItem)) {
    delete itemsToRepopulate[qrItem.linkId];
    return;
  }

  itemsToRepopulate[qrItem.linkId].oldQRItem = qrItem;
}