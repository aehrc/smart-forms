import { Coding, QuestionnaireItem } from 'fhir/r5';

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
