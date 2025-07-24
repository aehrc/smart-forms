/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import { containsTabs, isTabContainer } from './tabs';
import { getShortText, isSpecificItemControl } from './extensions';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHiddenByEnableWhen } from './qItem';
import { questionnaireResponseStore, questionnaireStore } from '../stores';
import { createQuestionnaireResponseItemMap } from './questionnaireResponseStoreUtils/updatableResponseItems';
import { getParentItem, getQuestionnaireItem, getSectionHeading, isItemInGrid } from './misc';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import { deepEqual } from 'fast-equals';

/**
 * Represents an item within a questionnaire that can be re-populated with updated data from the patient record.
 *
 * @property qItem - QuestionnaireItem definition for this item
 *
 * @property sectionItemText - Top-level group item.text this item belongs to
 *
 * @property parentItemText - Immediate parent item.text
 * @property isInGrid - Whether this item is part of a grid
 *
 * // For non-repeating items:
 * @property serverQRItem - QuestionnaireResponseItem from server (optional)
 * @property currentQRItem - Current QuestionnaireResponseItem in form (optional)
 *
 * // For repeating groups:
 * @property serverQRItems  - Array of QuestionnaireResponseItems from server (optional)
 * @property currentQRItems - Array of current QuestionnaireResponseItems in form (optional)
 *
 * Use serverQRItem/currentQRItem for single items, and serverQRItems/currentQRItems for repeat groups.
 */
export interface ItemToRepopulate {
  /* QuestionnaireItem definition for this item */
  qItem: QuestionnaireItem | null;

  /* Top-level group item.text this item belongs to */
  sectionItemText: string | null;

  /* Immediate parent item.text and whether it is in a grid - if it is, parentItemText wil come in handy as contextual information */
  parentItemText: string | null;
  isInGrid: boolean;

  /* Server and current response item for non-repeat items */
  serverQRItem?: QuestionnaireResponseItem;
  currentQRItem?: QuestionnaireResponseItem;

  /* Server and current response items for repeat groups */
  serverQRItems?: QuestionnaireResponseItem[];
  currentQRItems?: QuestionnaireResponseItem[];
}

interface getItemsToRepopulateParams {
  sourceQuestionnaire: Questionnaire;
  tabs: Tabs;
  populatedResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

/**
 * Compare latest data from the server with the current QuestionnaireResponse and decide items to re-populate
 *
 * @author Sean Fong
 */
export function generateItemsToRepopulate(populatedResponse: QuestionnaireResponse) {
  const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
  const tabs = questionnaireStore.getState().tabs;
  const updatableResponse = questionnaireResponseStore.getState().updatableResponse;
  const updatableResponseItems = questionnaireResponseStore.getState().updatableResponseItems;
  const enableWhenIsActivated = questionnaireStore.getState().enableWhenIsActivated;
  const enableWhenItems = questionnaireStore.getState().enableWhenItems;
  const enableWhenExpressions = questionnaireStore.getState().enableWhenExpressions;
  const initialExpressions = questionnaireStore.getState().initialExpressions;

  // This function is able to capture additions, however it is not able to capture deletions
  const itemsToRepopulate = getItemsToRepopulate({
    sourceQuestionnaire,
    tabs,
    populatedResponse,
    updatableResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });

  // Get linkIds that are different between current QRItems and populated QRItems
  // Doesn't work with repeat groups, but at the same time I'm not sure if it's needed, given you can't delete completely the first repeat group
  const populatedResponseItemMap = createQuestionnaireResponseItemMap(
    sourceQuestionnaire,
    populatedResponse
  );
  const diffLinkIds = difference(
    Object.keys(updatableResponseItems),
    Object.keys(populatedResponseItemMap)
  );
  const diffLinkIdsWithInitialExpressions = intersection(
    Object.keys(initialExpressions),
    diffLinkIds
  );
  for (const linkId of diffLinkIdsWithInitialExpressions) {
    if (linkId in updatableResponseItems) {
      const parentItem = getParentItem(sourceQuestionnaire, linkId);
      itemsToRepopulate[linkId] = {
        qItem: getQuestionnaireItem(sourceQuestionnaire, linkId),
        sectionItemText: getSectionHeading(sourceQuestionnaire, linkId, tabs),
        parentItemText: parentItem?.text ?? null,
        isInGrid: isItemInGrid(sourceQuestionnaire, linkId),
        currentQRItem: updatableResponseItems[linkId][0]
      };
    }
  }

  return itemsToRepopulate;
}

export function getItemsToRepopulate(
  params: getItemsToRepopulateParams
): Record<string, ItemToRepopulate> {
  const {
    sourceQuestionnaire,
    tabs,
    populatedResponse,
    updatableResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

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

  const topLevelQItems = sourceQuestionnaire.item;
  const populatedTopLevelQRItems = populatedResponse.item;

  const qItemsIndexMap = mapQItemsIndex(sourceQuestionnaire);
  const populatedTopLevelQRItemsByIndex = getQrItemsIndex(
    topLevelQItems,
    populatedTopLevelQRItems,
    qItemsIndexMap
  );

  const itemsToRepopulate: Record<string, ItemToRepopulate> = {};
  for (const [index, topLevelQItem] of topLevelQItems.entries()) {
    const populatedQrItemOrItems = populatedTopLevelQRItemsByIndex[index];
    if (!populatedQrItemOrItems) {
      continue;
    }

    const itemText = topLevelQItem.text ?? null;
    const hasTabs = isTabContainer(topLevelQItem) || containsTabs(topLevelQItem);
    const itemIsGrid = isSpecificItemControl(topLevelQItem, 'grid');

    getItemsToRepopulateRecursive({
      qItem: topLevelQItem,
      qrItemOrItems: populatedQrItemOrItems,
      sectionItemText: itemText,
      parentItemText: itemText,
      isInGrid: itemIsGrid,
      tabs,
      hasTabs,
      itemsToRepopulate,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });
  }

  const oldTopLevelQRItemsByIndex = getQrItemsIndex(
    topLevelQItems,
    updatableResponse.item,
    qItemsIndexMap
  );
  for (const [index, topLevelQItem] of topLevelQItems.entries()) {
    const currentQRItemOrItems = oldTopLevelQRItemsByIndex[index];
    if (!currentQRItemOrItems) {
      continue;
    }

    checkCorrespondingOldItemsRecursive(topLevelQItem, currentQRItemOrItems, itemsToRepopulate);
  }

  return itemsToRepopulate;
}

interface getItemsToRepopulateRecursiveParams {
  qItem: QuestionnaireItem;
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[];
  sectionItemText: string | null;
  parentItemText: string | null;
  isInGrid: boolean;
  tabs: Tabs;
  hasTabs: boolean;
  itemsToRepopulate: Record<string, ItemToRepopulate>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

// 1. Get items to repopulate (only new items)
// 2. Get corresponding old items from updatableResponse (if they are different)
// 3. Compare old and new items in dialog - if there are none, show a dialog saying there is no new data
// 4. Have checkboxes in dialog to update response
// 5. Replace old answers with new answers
function getItemsToRepopulateRecursive(params: getItemsToRepopulateRecursiveParams) {
  const {
    qItem,
    qrItemOrItems,
    parentItemText,
    tabs,
    hasTabs,
    itemsToRepopulate,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;
  let { sectionItemText, isInGrid } = params;

  if (!qrItemOrItems) {
    return;
  }

  // Return nothing if corresponding qItem is hidden
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

  // For repeat groups
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    if (qrItemOrItems.length > 0) {
      getRepeatGroupToRepopulate(
        qItem,
        qrItemOrItems,
        sectionItemText,
        parentItemText,
        isInGrid,
        itemsToRepopulate
      );
    }
    return;
  }

  const childQItems = qItem.item;
  const childQRItems = qrItemOrItems.item;

  // Iterate through child items
  if (childQItems && childQItems.length > 0 && childQRItems) {
    // If parent item is a tab, use shortText if available, otherwise use text
    const parentIsTab = !!tabs[qItem.linkId];
    if (parentIsTab) {
      sectionItemText = getShortText(qItem) ?? qItem.text ?? null;
    }

    // Get parent item text
    const parentItemText = qItem.text ?? null;

    // Check if parent item is a grid if it is not already "true"
    if (!isInGrid) {
      isInGrid = isSpecificItemControl(qItem, 'grid');
    }

    const qItemsIndexMap = mapQItemsIndex(qItem);
    const populatedQRItemsByIndex = getQrItemsIndex(childQItems, childQRItems, qItemsIndexMap);

    // For normal groups with children
    for (const [index, childQItem] of childQItems.entries()) {
      const childQrItemOrItems = populatedQRItemsByIndex[index];
      if (!childQrItemOrItems) {
        continue;
      }

      getItemsToRepopulateRecursive({
        qItem: childQItem,
        qrItemOrItems: childQrItemOrItems,
        sectionItemText,
        parentItemText,
        isInGrid,
        tabs,
        hasTabs,
        itemsToRepopulate,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      });
    }

    const hasSingleAnswer = !Array.isArray(qrItemOrItems);
    if (hasSingleAnswer && qrItemOrItems.answer) {
      getSingleItemToRepopulate(
        qItem,
        qrItemOrItems,
        sectionItemText,
        parentItemText,
        isInGrid,
        itemsToRepopulate
      );
    }
    return;
  }

  // For single items without children
  getSingleItemToRepopulate(
    qItem,
    qrItemOrItems,
    sectionItemText,
    parentItemText,
    isInGrid,
    itemsToRepopulate
  );
}

function getSingleItemToRepopulate(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  sectionItemText: string | null,
  parentItemText: string | null,
  isInGrid: boolean,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  itemsToRepopulate[qItem.linkId] = {
    qItem: qItem,
    sectionItemText: sectionItemText,
    parentItemText: parentItemText,
    isInGrid: isInGrid,
    serverQRItem: qrItem,
    serverQRItems: []
  };
}

function getRepeatGroupToRepopulate(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  sectionItemText: string | null,
  parentItemText: string | null,
  isInGrid: boolean,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  itemsToRepopulate[qItem.linkId] = {
    qItem: qItem,
    sectionItemText: sectionItemText,
    parentItemText: parentItemText,
    isInGrid: isInGrid,
    serverQRItem: {
      linkId: qItem.linkId
    },
    serverQRItems: qrItems
  };
}

function checkCorrespondingOldItemsRecursive(
  qItem: QuestionnaireItem,
  currentQRItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[],
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(currentQRItemOrItems);
  if (hasMultipleAnswers) {
    retrieveRepeatGroupCurrentQRItems(qItem, currentQRItemOrItems, itemsToRepopulate);
    return;
  }

  const childQItems = qItem.item;
  const oldChildQRItems = currentQRItemOrItems.item;

  if (childQItems && childQItems.length > 0 && oldChildQRItems) {
    const qItemsIndexMap = mapQItemsIndex(qItem);
    const currentQRItemsByIndex = getQrItemsIndex(childQItems, oldChildQRItems, qItemsIndexMap);

    // For normal groups with children
    for (const [index, childQItem] of childQItems.entries()) {
      const oldChildQrItemOrItems = currentQRItemsByIndex[index];
      if (!oldChildQrItemOrItems) {
        continue;
      }

      checkCorrespondingOldItemsRecursive(childQItem, oldChildQrItemOrItems, itemsToRepopulate);
    }

    const hasSingleAnswer = !Array.isArray(currentQRItemOrItems);
    if (hasSingleAnswer && currentQRItemOrItems.answer) {
      retrieveSingleCurrentQRItem(qItem, currentQRItemOrItems, itemsToRepopulate);
    }
    return;
  }

  // For single items without children
  retrieveSingleCurrentQRItem(qItem, currentQRItemOrItems, itemsToRepopulate);
}

function retrieveSingleCurrentQRItem(
  qItem: QuestionnaireItem,
  currentQRItem: QuestionnaireResponseItem,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  const serverQRItem = itemsToRepopulate[qItem.linkId]?.serverQRItem;

  if (!serverQRItem) {
    return;
  }

  if (deepEqual(currentQRItem, serverQRItem)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete itemsToRepopulate[qItem.linkId];
    return;
  }

  itemsToRepopulate[qItem.linkId].currentQRItem = currentQRItem;
}

function retrieveRepeatGroupCurrentQRItems(
  qItem: QuestionnaireItem,
  currentQRItems: QuestionnaireResponseItem[],
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  if (!(qItem && currentQRItems && currentQRItems.length > 0)) {
    return;
  }

  const serverQRItems = itemsToRepopulate[qItem.linkId]?.serverQRItems;
  if (!serverQRItems) {
    return;
  }

  if (deepEqual(currentQRItems, serverQRItems)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete itemsToRepopulate[qItem.linkId];
    return;
  }

  itemsToRepopulate[qItem.linkId].currentQRItems = currentQRItems;
}
