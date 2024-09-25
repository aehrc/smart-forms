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
import type { Tabs } from '../interfaces/tab.interface';
import { containsTabs, isTabContainer } from './tabs';
import { getShortText, isSpecificItemControl } from './itemControl';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHiddenByEnableWhen } from './qItem';
import { questionnaireResponseStore, questionnaireStore } from '../stores';
import { createQuestionnaireResponseItemMap } from './questionnaireResponseStoreUtils/updatableResponseItems';
import { getQuestionnaireItem, getSectionHeading } from './misc';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import isEqual from 'lodash.isequal';

/**
 * ItemToRepopulate interface
 *
 * @property qItem - The QuestionnaireItem to repopulate
 * @property heading - The heading of the group to repopulate
 * @property newQRItem - The new QuestionnaireResponseItem to replace the old one
 * @property oldQRItem - The old QuestionnaireResponseItem to be replaced
 * @property newQRItems - The new QuestionnaireResponseItems to replace the old ones
 * @property oldQRItems - The old QuestionnaireResponseItems to be replaced
 *
 * @author Sean Fong
 */
export interface ItemToRepopulate {
  qItem: QuestionnaireItem | null;
  heading: string | null;

  // for non-repeat groups
  newQRItem?: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;

  // for repeat groups
  newQRItems?: QuestionnaireResponseItem[];
  oldQRItems?: QuestionnaireResponseItem[];
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
  const populatedResponseItemMap = createQuestionnaireResponseItemMap(populatedResponse);
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
      itemsToRepopulate[linkId] = {
        qItem: getQuestionnaireItem(sourceQuestionnaire, linkId),
        heading: getSectionHeading(sourceQuestionnaire, linkId, tabs),
        oldQRItem: updatableResponseItems[linkId][0]
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

    const heading = topLevelQItem.text ?? null;
    const hasTabs = isTabContainer(topLevelQItem) || containsTabs(topLevelQItem);

    getItemsToRepopulateRecursive({
      qItem: topLevelQItem,
      qrItemOrItems: populatedQrItemOrItems,
      heading,
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
    const oldQrItemOrItems = oldTopLevelQRItemsByIndex[index];
    if (!oldQrItemOrItems) {
      continue;
    }

    checkCorrespondingOldItemsRecursive(topLevelQItem, oldQrItemOrItems, itemsToRepopulate);
  }

  return itemsToRepopulate;
}

interface getItemsToRepopulateRecursiveParams {
  qItem: QuestionnaireItem;
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[];
  heading: string | null;
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
    tabs,
    hasTabs,
    itemsToRepopulate,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;
  let { heading } = params;

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
      getRepeatGroupToRepopulate(qItem, qrItemOrItems, heading, itemsToRepopulate);
    }
    return;
  }

  const childQItems = qItem.item;
  const childQRItems = qrItemOrItems.item;

  if (childQItems && childQItems.length > 0 && childQRItems) {
    const isTab = !!tabs[qItem.linkId];
    if (isTab) {
      heading = getShortText(qItem) ?? qItem.text ?? null;
    }

    const qItemsIndexMap = mapQItemsIndex(qItem);
    const populatedQRItemsByIndex = getQrItemsIndex(childQItems, childQRItems, qItemsIndexMap);

    // For grid groups
    const itemIsGrid = isSpecificItemControl(qItem, 'grid');
    if (itemIsGrid) {
      getGridTableToRepopulate({
        qItem,
        gridChildQItems: childQItems,
        gridChildQRItemsByIndex: populatedQRItemsByIndex,
        heading,
        itemsToRepopulate,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      });
      return;
    }

    // For normal groups with children
    for (const [index, childQItem] of childQItems.entries()) {
      const childQrItemOrItems = populatedQRItemsByIndex[index];
      if (!childQrItemOrItems) {
        continue;
      }

      getItemsToRepopulateRecursive({
        qItem: childQItem,
        qrItemOrItems: childQrItemOrItems,
        heading,
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
      getSingleItemToRepopulate(qItem, qrItemOrItems, heading, itemsToRepopulate);
    }
    return;
  }

  // For single items without children
  getSingleItemToRepopulate(qItem, qrItemOrItems, heading, itemsToRepopulate);
}

function getSingleItemToRepopulate(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  heading: string | null,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  if (qItem.linkId === 'encounter-reason') {
    console.log(
      structuredClone({
        qItem: qItem,
        heading: heading,
        newQRItem: qrItem,
        newQRItems: []
      })
    );
  }

  itemsToRepopulate[qItem.linkId] = {
    qItem: qItem,
    heading: heading,
    newQRItem: qrItem,
    newQRItems: []
  };
}

function getRepeatGroupToRepopulate(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  heading: string | null,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  itemsToRepopulate[qItem.linkId] = {
    qItem: qItem,
    heading: heading,
    newQRItem: {
      linkId: qItem.linkId
    },
    newQRItems: qrItems
  };
}

interface getGridTableToRepopulateParams {
  qItem: QuestionnaireItem;
  gridChildQItems: QuestionnaireItem[];
  gridChildQRItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[] | undefined)[];
  heading: string | null;
  itemsToRepopulate: Record<string, ItemToRepopulate>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

function getGridTableToRepopulate(params: getGridTableToRepopulateParams) {
  const {
    qItem,
    gridChildQItems,
    gridChildQRItemsByIndex,
    heading,
    itemsToRepopulate,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (gridChildQItems.length === 0) {
    return;
  }

  const gridChildQRItemsToRepopulate = gridChildQItems
    .map((qItem, index) => {
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

      const gridChildQrItemOrItems = gridChildQRItemsByIndex?.[index];
      if (gridChildQrItemOrItems && !Array.isArray(gridChildQrItemOrItems)) {
        return gridChildQrItemOrItems;
      }

      return null;
    })
    .filter((item) => item !== null) as QuestionnaireResponseItem[];

  itemsToRepopulate[qItem.linkId] = {
    qItem: qItem,
    heading: heading,
    newQRItem: {
      linkId: qItem.linkId,
      text: qItem.text,
      item: gridChildQRItemsToRepopulate
    },
    newQRItems: []
  };
}

function checkCorrespondingOldItemsRecursive(
  qItem: QuestionnaireItem,
  oldQrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[],
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(oldQrItemOrItems);
  if (hasMultipleAnswers) {
    retrieveRepeatGroupOldQRItems(qItem, oldQrItemOrItems, itemsToRepopulate);
    return;
  }

  const childQItems = qItem.item;
  const oldChildQRItems = oldQrItemOrItems.item;

  if (childQItems && childQItems.length > 0 && oldChildQRItems) {
    const qItemsIndexMap = mapQItemsIndex(qItem);
    const oldQRItemsByIndex = getQrItemsIndex(childQItems, oldChildQRItems, qItemsIndexMap);

    // For grid groups
    const itemIsGrid = isSpecificItemControl(qItem, 'grid');
    if (itemIsGrid) {
      retrieveGridGroupOldQRItems(qItem, childQItems, oldQRItemsByIndex, itemsToRepopulate);
      return;
    }

    // For normal groups with children
    for (const [index, childQItem] of childQItems.entries()) {
      const oldChildQrItemOrItems = oldQRItemsByIndex[index];
      if (!oldChildQrItemOrItems) {
        continue;
      }

      checkCorrespondingOldItemsRecursive(childQItem, oldChildQrItemOrItems, itemsToRepopulate);
    }

    const hasSingleAnswer = !Array.isArray(oldQrItemOrItems);
    if (hasSingleAnswer && oldQrItemOrItems.answer) {
      retrieveSingleOldQRItem(qItem, oldQrItemOrItems, itemsToRepopulate);
    }
    return;
  }

  // For single items without children
  retrieveSingleOldQRItem(qItem, oldQrItemOrItems, itemsToRepopulate);
}

function retrieveSingleOldQRItem(
  qItem: QuestionnaireItem,
  oldQRItem: QuestionnaireResponseItem,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  const newQRItem = itemsToRepopulate[qItem.linkId]?.newQRItem;

  if (!newQRItem) {
    return;
  }

  if (isEqual(oldQRItem, newQRItem)) {
    delete itemsToRepopulate[qItem.linkId];
    return;
  }

  itemsToRepopulate[qItem.linkId].oldQRItem = oldQRItem;
}

function retrieveRepeatGroupOldQRItems(
  qItem: QuestionnaireItem,
  oldQRItems: QuestionnaireResponseItem[],
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  if (!(qItem && oldQRItems && oldQRItems.length > 0)) {
    return;
  }

  const newQRItems = itemsToRepopulate[qItem.linkId]?.newQRItems;
  if (!newQRItems) {
    return;
  }

  if (isEqual(oldQRItems, newQRItems)) {
    delete itemsToRepopulate[qItem.linkId];
    return;
  }

  itemsToRepopulate[qItem.linkId].oldQRItems = oldQRItems;
}

function retrieveGridGroupOldQRItems(
  qItem: QuestionnaireItem,
  gridChildQItems: QuestionnaireItem[],
  oldGridQRItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[] | undefined)[],
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  if (gridChildQItems.length === 0) {
    return;
  }

  const newGridQRItem = itemsToRepopulate[qItem.linkId]?.newQRItem;
  if (!newGridQRItem || !newGridQRItem.item) {
    return;
  }

  const newGridChildQRItemMap = new Map<string, QuestionnaireResponseItem>();

  for (const newGridChildQRItem of newGridQRItem.item) {
    newGridChildQRItemMap.set(newGridChildQRItem.linkId, newGridChildQRItem);
  }

  // Get old qr items that are different from the new qr items
  const oldGridChildQRItems: QuestionnaireResponseItem[] = [];
  for (const [index, gridChildQItem] of gridChildQItems.entries()) {
    const oldGridChildQrItemOrItems = oldGridQRItemsByIndex[index];
    if (!oldGridChildQrItemOrItems || Array.isArray(oldGridChildQrItemOrItems)) {
      continue;
    }

    // At this point we have a single qrItem
    const oldGridChildQrItem = oldGridChildQrItemOrItems;
    const newGridChildQRItem = newGridChildQRItemMap.get(gridChildQItem.linkId);

    if (!newGridChildQRItem) {
      continue;
    }

    if (isEqual(oldGridChildQrItem, newGridChildQRItem)) {
      newGridChildQRItemMap.delete(gridChildQItem.linkId);
    } else {
      oldGridChildQRItems.push(oldGridChildQrItem);
    }
  }

  const newGridChildQRItemsToRepopulate = [...newGridChildQRItemMap.values()];
  // Nothing to repopulate, delete whole item
  if (newGridChildQRItemsToRepopulate.length === 0) {
    delete itemsToRepopulate[qItem.linkId];
    return;
  }

  // Otherwise create both old and new grid qr item
  itemsToRepopulate[qItem.linkId].newQRItem = {
    linkId: qItem.linkId,
    text: qItem.text,
    item: newGridChildQRItemsToRepopulate
  };
  itemsToRepopulate[qItem.linkId].oldQRItem = {
    linkId: qItem.linkId,
    text: qItem.text,
    item: oldGridChildQRItems
  };
}
