import { Coding, QuestionnaireItem } from 'fhir/r5';

export function containsTabs(items: QuestionnaireItem[]): boolean {
  const formTabs = getTabbedItems(items);
  return formTabs.length > 0;
}

export function getTabbedItems(items: QuestionnaireItem[]): QuestionnaireItem[] {
  return items.filter((i: QuestionnaireItem) => isTab(i));
}

export function getIndexOfFirstTab(items: QuestionnaireItem[]): number {
  for (let i = 0; i < items.length; i++) {
    if (isTab(items[i])) {
      return i + 1;
    }
  }
  return 1;
}

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
