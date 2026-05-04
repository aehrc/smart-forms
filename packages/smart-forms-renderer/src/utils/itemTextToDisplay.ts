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

/**
 * Extension URLs on `_prefix` that indicate visible rendering or dynamic content.
 * Used to avoid false positives from unrelated extensions (e.g. translation).
 */
const PREFIX_RENDERING_EXTENSION_URLS = new Set([
  'http://hl7.org/fhir/StructureDefinition/rendering-style',
  'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
  'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
  'http://hl7.org/fhir/StructureDefinition/cqf-expression'
]);

/** True if the item has text, prefix, or rendering extensions that can produce a visible label (e.g. group heading). */
export function itemHasLabelHeadingContent(qItem: QuestionnaireItem): boolean {
  if (getItemTextToDisplay(qItem)) {
    return true;
  }
  if (qItem.prefix) {
    return true;
  }
  if (qItem._prefix?.extension?.some((ext) => PREFIX_RENDERING_EXTENSION_URLS.has(ext.url ?? ''))) {
    return true;
  }
  return false;
}
