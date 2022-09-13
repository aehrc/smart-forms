import { fhirclient } from 'fhirclient/lib/types';
import { QuestionnaireItem, ItemExtension } from '../../questionnaire/QuestionnaireModel';

export function isSpecificItemControl(qItem: QuestionnaireItem, itemControlCode: string): boolean {
  const itemControl = qItem.extension?.find(
    (extension: ItemExtension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );
  if (itemControl) {
    const code = itemControl.valueCodeableConcept?.coding?.find(
      (coding: fhirclient.FHIR.Coding) => coding.code === itemControlCode
    );
    if (code) {
      return true;
    }
  }
  return false;
}

export function isHidden(qItem: QuestionnaireItem): boolean {
  const itemControl = qItem.extension?.find(
    (extension: ItemExtension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden'
  );
  return !!itemControl;
}
