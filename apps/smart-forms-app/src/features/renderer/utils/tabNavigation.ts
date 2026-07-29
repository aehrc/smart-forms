import type { QuestionnaireItem } from 'fhir/r4';
import type { Tabs } from '@aehrc/smart-forms-renderer';

/**
 * Finds the tab index of the first visible tab (by tab order) that contains any of the given linkIds.
 * Returns null if no matching visible tab is found or if there are no tabs.
 */
export function findFirstErrorTabIndex(
  invalidLinkIds: string[],
  questionnaireItems: QuestionnaireItem[],
  tabs: Tabs
): number | null {
  let minTabIndex: number | null = null;

  for (const linkId of invalidLinkIds) {
    const tabIndex = findTabIndexForLinkId(linkId, questionnaireItems, tabs);
    if (tabIndex !== null && (minTabIndex === null || tabIndex < minTabIndex)) {
      minTabIndex = tabIndex;
    }
  }

  return minTabIndex;
}

function findTabIndexForLinkId(
  targetLinkId: string,
  items: QuestionnaireItem[],
  tabs: Tabs
): number | null {
  for (const item of items) {
    const tab = tabs[item.linkId];
    if (tab !== undefined) {
      // This item is a tab — skip hidden tabs, otherwise check if it contains the target
      if (
        !tab.isHidden &&
        (item.linkId === targetLinkId || containsLinkId(targetLinkId, item.item ?? []))
      ) {
        return tab.tabIndex;
      }
    } else if (item.item) {
      // Not a tab — recurse into children
      const found = findTabIndexForLinkId(targetLinkId, item.item, tabs);
      if (found !== null) return found;
    }
  }
  return null;
}

function containsLinkId(targetLinkId: string, items: QuestionnaireItem[]): boolean {
  for (const item of items) {
    if (item.linkId === targetLinkId) return true;
    if (item.item && containsLinkId(targetLinkId, item.item)) return true;
  }
  return false;
}
