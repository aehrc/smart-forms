import { readInitialExpressions } from './ReadInitialExpressions';
import type { Questionnaire } from 'fhir/r5';
import Q715XFhirQuery from './resources/715-v.json';

describe('read initial expressions', () => {
  const questionnaire = Q715XFhirQuery as Questionnaire;
  const initialExpressions = readInitialExpressions(questionnaire);

  test('getting an initial expression with a linkId key should return an object containing its expression', () => {
    const prePopQuery0 = {
      expression:
        "%PrePopQuery0.entry.resource.select(relationship.coding.display + ' - ' + condition.code.coding.display).join(' ')"
    };

    expect(initialExpressions['cfdc0b14-7271-4145-b57a-9c1faffd6516']).toEqual(prePopQuery0);
  });
});
