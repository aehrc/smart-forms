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
