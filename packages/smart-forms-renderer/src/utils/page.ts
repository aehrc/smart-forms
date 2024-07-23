import type { Coding, QuestionnaireItem } from 'fhir/r4';
import { isSpecificItemControl } from './itemControl';

/**
 * Checks if a top-level QItem is a page
 *
 * @author Riza Nafis
 */
export function isPageTopLevel(topLevelQItem: QuestionnaireItem): boolean {
  return isSpecificItemControl(topLevelQItem, 'tab-container');
}

/**
 * Checks if any of the items in a qItem array is a page item
 * Returns true if there is at least one page item
 *
 * @author Riza Nafis
 */
export function containsPages(topLevelQItem: QuestionnaireItem): boolean {
  if (!topLevelQItem.item) {
    return false;
  }

  const tabs = getPageItems(topLevelQItem.item);
  return tabs.length > 0;
}

/**
 * Get page items from a qItem array
 *
 * @author Riza Nafis
 */
export function getPageItems(items: QuestionnaireItem[]): QuestionnaireItem[] {
  return items.filter((i: QuestionnaireItem) => isPage(i));
}

/**
 * Check if a qItem is a page item
 *
 * @author Riza Nafis
 */
export function isPage(item: QuestionnaireItem) {
  const itemControl = item.extension?.find(
    (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );

  if (itemControl) {
    const tabCoding = itemControl.valueCodeableConcept?.coding?.find(
      (c: Coding) => c.code === 'page'
    );
    if (tabCoding) {
      return true;
    }
  }
  return false;
}
