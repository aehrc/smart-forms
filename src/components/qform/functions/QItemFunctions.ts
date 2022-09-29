import { Coding, Expression, Extension, QuestionnaireItem } from 'fhir/r5';
import { EnableWhenLinkedItem, EnableWhenItemProperties } from '../../Interfaces';

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

export function getEnableWhenItemProperties(
  qItem: QuestionnaireItem
): EnableWhenItemProperties | null {
  const enableWhen = qItem.enableWhen;
  if (enableWhen) {
    const EnableWhenItemProperties: EnableWhenItemProperties = { linked: [] };
    EnableWhenItemProperties.linked = enableWhen.map((linkedItem): EnableWhenLinkedItem => {
      return { enableWhen: linkedItem };
    });

    if (qItem.enableBehavior) {
      EnableWhenItemProperties.enableBehavior = qItem.enableBehavior;
    }

    return EnableWhenItemProperties;
  }
  return null;
}

export function getTextDisplayPrompt(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    const childItem = qItem.item[0];
    if (childItem.type === 'display' && isSpecificItemControl(childItem, 'prompt')) {
      const promptText = `${childItem.text}`;
      return promptText[0].toUpperCase() + promptText.substring(1);
    }
  }
  return '';
}
