import { evaluate } from 'fhirpath';
import { questionnaireResponseStore } from '../stores';
import { expect } from 'storybook/test';

interface ExpectCodingProps {
  code: string;
  display: string;
  system: string;
}

export async function getAnswers(linkId: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  const result = await evaluate(qr, `QuestionnaireResponse.item.where(linkId='${linkId}').answer`);

  return result;
}
export async function expectContainsValueCoding(linkId: string, expectedCoding: ExpectCodingProps) {
  const result = await getAnswers(linkId);
  const codings = result.map((r) => r.valueCoding);
  expect(codings).toEqual(expect.arrayContaining([expect.objectContaining(expectedCoding)]));
}
