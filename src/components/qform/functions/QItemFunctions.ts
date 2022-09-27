import { Coding, Expression, Extension, QuestionnaireItem } from 'fhir/r5';
import { EnableWhenLinkedItem, EnableWhenProperties } from '../../Interfaces';

export function isSpecificItemControl(qItem: QuestionnaireItem, itemControlCode: string): boolean {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );
  if (itemControl) {
    const code = itemControl.valueCodeableConcept?.coding?.find(
      (coding: Coding) => coding.code === itemControlCode
    );
    if (code) {
      return true;
    }
  }
  return false;
}

export function isHidden(qItem: QuestionnaireItem): boolean {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden'
  );

  if (itemControl) {
    if (itemControl.valueBoolean) {
      return true;
    }
  }
  return false;
}

export function getCalculatedExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression'
  );
  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}

export function getEnableWhenProperties(qItem: QuestionnaireItem): EnableWhenProperties | null {
  const enableWhen = qItem.enableWhen;
  if (enableWhen) {
    const enableWhenProperties: EnableWhenProperties = { linked: [] };
    enableWhenProperties.linked = enableWhen.map((linkedItem): EnableWhenLinkedItem => {
      return { enableWhen: linkedItem };
    });

    if (qItem.enableBehavior) {
      enableWhenProperties.enableBehavior = qItem.enableBehavior;
    }

    return enableWhenProperties;
  }
  return null;
}
