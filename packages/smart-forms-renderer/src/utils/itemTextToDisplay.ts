import type { QuestionnaireItem } from 'fhir/r4';
import { isItemTextHidden } from './extensions';

export function getItemTextToDisplay(qItem: QuestionnaireItem): string | null {
  // Return null if qItem.text is falsy
  if (!qItem.text) {
    return null;
  }

  // Return null if qItem.text exists but https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden extension is present
  if (isItemTextHidden(qItem)) {
    return null;
  }

  return qItem.text;
}

/** True if the item has text, prefix, or rendering extensions that can produce a visible label (e.g. group heading). */
export function itemHasLabelHeadingContent(qItem: QuestionnaireItem): boolean {
  if (getItemTextToDisplay(qItem)) {
    return true;
  }
  if (qItem.prefix) {
    return true;
  }
  if (qItem._prefix?.extension && qItem._prefix.extension.length > 0) {
    return true;
  }
  return false;
}
