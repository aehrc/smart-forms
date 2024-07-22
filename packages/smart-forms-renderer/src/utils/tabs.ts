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

import type { Tabs } from '../interfaces/tab.interface';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import { isSpecificItemControl } from './itemControl';
import { isHiddenByEnableWhen } from './qItem';
import { structuredDataCapture } from 'fhir-sdc-helpers';

export function getFirstVisibleTab(
  tabs: Tabs,
  enableWhenItems: EnableWhenItems,
  enableWhenExpressions: EnableWhenExpressions
) {
  // Only singleEnableWhenItems are relevant for tab operations
  const { singleItems } = enableWhenItems;
  const { singleExpressions } = enableWhenExpressions;

  return Object.entries(tabs)
    .sort(([, tabA], [, tabB]) => tabA.tabIndex - tabB.tabIndex)
    .findIndex(([tabLinkId, tab]) => {
      if (tab.isHidden) {
        return false;
      }

      const singleItem = singleItems[tabLinkId];
      if (singleItem) {
        return singleItem.isEnabled;
      }

      const singleExpression = singleExpressions[tabLinkId];
      if (singleExpression) {
        return singleExpression.isEnabled;
      }

      return true;
    });
}

/**
 * Checks if any of the items in a qItem array is a tabbed item
 * Returns true if there is at least one tabbed item
 *
 * @author Sean Fong
 */
export function containsTabs(topLevelQItem: QuestionnaireItem): boolean {
  if (!topLevelQItem.item) {
    return false;
  }

  const tabs = getTabbedItems(topLevelQItem.item);
  return tabs.length > 0;
}

/**
 * Checks if a top-level QItem is a tab container
 * All items within a tab container are tabbed items
 *
 * @author Sean Fong
 */
export function isTabContainer(topLevelQItem: QuestionnaireItem): boolean {
  return isSpecificItemControl(topLevelQItem, 'tab-container');
}

/**
 * Get tabbed items from a qItem array
 *
 * @author Sean Fong
 */
export function getTabbedItems(items: QuestionnaireItem[]): QuestionnaireItem[] {
  return items.filter((i: QuestionnaireItem) => isTab(i));
}

/**
 * Check if a qItem is a tabbed item
 *
 * @author Sean Fong
 */
export function isTab(item: QuestionnaireItem) {
  const itemControl = item.extension?.find(
    (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );

  if (itemControl) {
    const tabCoding = itemControl.valueCodeableConcept?.coding?.find(
      (c: Coding) => c.code === 'tab'
    );
    if (tabCoding) {
      return true;
    }
  }
  return false;
}

/**
 * Create a `Record<linkId, {isComplete: boolean}>` key-value pair for all tabbed items in a qItem array
 *
 * @author Sean Fong
 */
export function constructTabsWithProperties(
  qItems: QuestionnaireItem[] | undefined,
  hasTabContainer: boolean
): Tabs {
  if (!qItems) return {};

  const qItemTabs = hasTabContainer ? qItems : qItems.filter(isTab);

  const tabs: Tabs = {};
  for (const [i, qItem] of qItemTabs.entries()) {
    tabs[qItem.linkId] = {
      tabIndex: i,
      isComplete: false,
      isHidden: structuredDataCapture.getHidden(qItem) ?? false
    };
  }
  return tabs;
}

interface constructTabsWithVisibilityParams {
  tabs: Tabs;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

export function constructTabsWithVisibility(
  params: constructTabsWithVisibilityParams
): { linkId: string; isVisible: boolean }[] {
  const { tabs, enableWhenIsActivated, enableWhenItems, enableWhenExpressions } = params;

  return Object.entries(tabs).map(([linkId]) => {
    const isVisible = !isHiddenByEnableWhen({
      linkId,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });

    return {
      linkId,
      isVisible
    };
  });
}

export function getContextDisplays(item: QuestionnaireItem): QuestionnaireItem[] {
  if (!item.item || item.item.length === 0) {
    return [];
  }

  return item.item.filter(
    (childItem) =>
      isSpecificItemControl(childItem, 'context-display') && childItem.type === 'display'
  );
}

interface IsTabHiddenParams {
  qItem: QuestionnaireItem;
  contextDisplayItems: QuestionnaireItem[];
  isTab: boolean;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  completedTabsCollapsed: boolean;
}

export function isTabHidden(params: IsTabHiddenParams): boolean {
  const {
    qItem,
    contextDisplayItems,
    isTab,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions,
    completedTabsCollapsed
  } = params;

  if (
    !isTab ||
    isHiddenByEnableWhen({
      linkId: qItem.linkId,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    }) ||
    structuredDataCapture.getHidden(qItem)
  ) {
    return true;
  }

  if (completedTabsCollapsed) {
    const completedDisplayItem = contextDisplayItems.find(
      (contextDisplayItem) => contextDisplayItem.text === 'Complete'
    );
    const isHidden =
      (completedDisplayItem &&
        isHiddenByEnableWhen({
          linkId: completedDisplayItem.linkId,
          enableWhenIsActivated,
          enableWhenItems,
          enableWhenExpressions
        })) ||
      structuredDataCapture.getHidden(completedDisplayItem);

    if (!isHidden) {
      return true;
    }
  }

  return false;
}
