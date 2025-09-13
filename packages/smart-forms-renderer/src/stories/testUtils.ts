import { evaluate } from 'fhirpath';
import { questionnaireResponseStore } from '../stores';
import type {
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';

export async function getAnswers(linkId: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  const result = await evaluate(qr, `QuestionnaireResponse.item.where(linkId='${linkId}').answer`);
  return result;
}
export async function getGroupAnswers(groupLinkid: string, answerLinkid: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;

  const result = await evaluate(
    qr,
    groupLinkid
      ? `QuestionnaireResponse.item.where(linkId='${groupLinkid}').item.where(linkId='${answerLinkid}').answer`
      : `QuestionnaireResponse.item.where(linkId='${answerLinkid}').answer`
  );

  return result;
}

export function questionnaireFactory(
  items: QuestionnaireItem[],
  extra?: Omit<Questionnaire, 'resourceType' | 'status' | 'item'>
): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: items,
    ...extra
  };
}

export function qrFactory(items: QuestionnaireResponseItem[]): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: items
  };
}
export function itemControlExtFactory(code: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCodeableConcept: {
      coding: [
        {
          system: 'http://hl7.org/fhir/questionnaire-item-control',
          code: code
        }
      ]
    }
  };
}
export function openLabelExtFactory(text: string): Extension {
  return {
    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
    valueString: text
  };
}

export function calculatedExpressionExtFactory(text: string): Extension {
  return {
    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
    valueExpression: {
      language: 'text/fhirpath',
      expression: text
    }
  };
}

export function variableExtFactory(name: string, text: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/variable',
    valueExpression: {
      name: name,
      language: 'text/fhirpath',
      expression: text
    }
  };
}

export function сqfExpressionFactory(text: string) {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
    valueExpression: {
      language: 'text/fhirpath',
      expression: text
    }
  };
}
