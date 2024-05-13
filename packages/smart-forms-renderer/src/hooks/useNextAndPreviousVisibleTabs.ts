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

import { useQuestionnaireStore } from '../stores';
import type { Tabs } from '../interfaces/tab.interface';
import { constructTabsWithVisibility } from '../utils/tabs';

function useNextAndPreviousVisibleTabs(
  currentTabIndex?: number,
  tabs?: Tabs
): { previousTabIndex: number | null; nextTabIndex: number | null; numOfVisibleTabs: number } {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();

  const tabsNotDefined = currentTabIndex === undefined || tabs === undefined;

  if (tabsNotDefined) {
    return { previousTabIndex: null, nextTabIndex: null, numOfVisibleTabs: 0 };
  }

  const tabsWithVisibility = constructTabsWithVisibility({
    tabs,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });

  return {
    previousTabIndex: getPreviousTabIndex(currentTabIndex, tabsWithVisibility),
    nextTabIndex: getNextTabIndex(currentTabIndex, tabsWithVisibility),
    numOfVisibleTabs: tabsWithVisibility.filter((tab) => tab.isVisible).length
  };
}

function getPreviousTabIndex(
  currentTabIndex: number,
  tabsWithVisibility: { linkId: string; isVisible: boolean }[]
): number | null {
  const previousTabs = tabsWithVisibility.slice(0, currentTabIndex);
  const foundIndex = previousTabs.reverse().findIndex((tab) => tab.isVisible);

  // Previous visible tab not found
  if (foundIndex === -1) {
    return null;
  }

  // Previous visible tab less than 0
  const previousTabIndex = currentTabIndex - foundIndex - 1;
  if (previousTabIndex < 0) {
    return null;
  }

  return previousTabIndex;
}

function getNextTabIndex(
  currentTabIndex: number,
  tabsWithVisibility: { linkId: string; isVisible: boolean }[]
): number | null {
  const subsequentTabs = tabsWithVisibility.slice(currentTabIndex + 1);
  const foundIndex = subsequentTabs.findIndex((tab) => tab.isVisible);

  // Next visible tab not found, something is wrong
  if (foundIndex === -1) {
    return null;
  }

  return currentTabIndex + foundIndex + 1;
}

export default useNextAndPreviousVisibleTabs;
