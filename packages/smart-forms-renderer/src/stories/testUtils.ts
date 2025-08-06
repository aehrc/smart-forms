import { evaluate } from 'fhirpath';
import { questionnaireResponseStore } from '../stores';

export async function getAnswers(linkId: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  const result = await evaluate(qr, `QuestionnaireResponse.item.where(linkId='${linkId}').answer`);

  return result;
}
export async function expectContainsValueCoding(linkId, expectedCoding) {
  const result = await getAnswers(linkId);
  const codings = result.map((r) => r.valueCoding);
  expect(codings).toEqual(expect.arrayContaining([expect.objectContaining(expectedCoding)]));
}
