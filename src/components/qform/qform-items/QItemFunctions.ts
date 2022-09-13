import { fhirclient } from 'fhirclient/lib/types';
import { QuestionnaireItem, ItemExtension } from '../../questionnaire/QuestionnaireModel';
import { QItemChoiceOrientation } from '../FormModel';

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

export function getChoiceOrientation(qItem: QuestionnaireItem): QItemChoiceOrientation {
  const itemControl = qItem.extension?.find(
    (extension: ItemExtension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation'
  );
  if (itemControl) {
    const code = itemControl.valueCode;
    if (code) {
      if (code === 'horizontal') {
        return QItemChoiceOrientation.Horizontal;
      } else if (code === 'vertical') {
        return QItemChoiceOrientation.Vertical;
      }
    }
  }
  return QItemChoiceOrientation.Vertical;
}
