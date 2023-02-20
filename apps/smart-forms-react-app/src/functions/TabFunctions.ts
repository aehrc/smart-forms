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

import { Coding, QuestionnaireItem } from 'fhir/r5';
import { EnableWhenItems } from '../interfaces/Interfaces';

/**
 * Checks if any of the items in a qItem array is a tabbed item
 * Returns true if there is at least one tabbed item
 *
 * @author Sean Fong
 */
export function containsTabs(items: QuestionnaireItem[]): boolean {
  const formTabs = getTabbedItems(items);
  return formTabs.length > 0;
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
 * Get index of the first tabbed item from a qItem array
 *
 * @author Sean Fong
 */
export function getIndexOfFirstTab(items: QuestionnaireItem[]): number {
  for (let i = 0; i < items.length; i++) {
    if (isTab(items[i])) {
      return i + 1;
    }
  }
  return 1;
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
 * Create a <linkId, {isComplete: boolean}> key-value pair for all tabbed items in a qItem array
 *
 * @author Sean Fong
 */
export function constructTabsWithProperties(
  qItems: QuestionnaireItem[] | undefined
): Record<string, { tabNumber: number; isComplete: boolean }> {
  if (!qItems) return {};

  const linkIds = qItems.filter(isTab).map((qItem) => qItem.linkId);

  const tabs: Record<string, { tabNumber: number; isComplete: boolean }> = {};
  for (const [i, linkId] of linkIds.entries()) {
    tabs[linkId] = {
      tabNumber: i,
      isComplete: false
    };
  }
  return tabs;
}

/**
 * Get index of next visible tab
 * TODO WIP
 *
 * @author Sean Fong
 */
export function getNextVisibleTabIndex(
  tabs: Record<string, { tabNumber: number; isComplete: boolean }>,
  currentTabIndex: number,
  enableWhenItems: EnableWhenItems
): number {
  const tabsWithAttributes: { linkId: string; isVisible: boolean }[] = Object.entries(tabs).map(
    ([linkId]) => {
      if (enableWhenItems[linkId]) {
        return { linkId: linkId, isVisible: enableWhenItems[linkId]?.isEnabled };
      } else {
        return { linkId: linkId, isVisible: true };
      }
    }
  );

  let nextTabIndex = currentTabIndex + 1;
  const nextTabIndexIsVisible = false;
  while (!nextTabIndexIsVisible) {
    if (tabsWithAttributes[nextTabIndex].isVisible) {
      return nextTabIndex;
    }
    nextTabIndex++;
  }

  return nextTabIndex;
}
