import { evaluate } from 'fhirpath';
import { questionnaireResponseStore } from '../stores';
import type {
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

export function questionnaireFactory(items: QuestionnaireItem[]): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: items
  };
}

export function qrFactory(items: QuestionnaireResponseItem[]): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: items
  };
}
