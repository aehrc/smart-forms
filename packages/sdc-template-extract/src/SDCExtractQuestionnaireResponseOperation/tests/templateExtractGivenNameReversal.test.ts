import { extract } from '../utils';
import type { OutputParameters, ReturnParameter } from '../interfaces';
import { createInputParameters } from '../utils/createInputParameters';
import type { Bundle, Patient, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

// Mock the fetchQuestionnaire callback function
const mockFetchQuestionnaire = jest.fn();
const mockFetchQuestionnaireConfig = {
  sourceServerUrl: 'https://example.com/fhir',
  headers: { Authorization: 'Bearer token' }
};

// Regression test for https://github.com/aehrc/smart-forms/issues/2107
// Within a single templateExtractContext, a first-declared templateExtractValue evaluating to
// an empty result (unanswered "family") must not cause a later-declared repeating
// templateExtractValue ("given") to be split into separate, reversed-order array elements.
const QGivenNameReversal: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'GivenNameReversal',
  url: 'https://smartforms.csiro.au/docs/tests/GivenNameReversal',
  status: 'draft',
  subjectType: ['Patient'],
  contained: [
    {
      resourceType: 'Patient',
      id: 'patTemplate',
      name: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId = 'name')"
            }
          ],
          _family: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'family').answer.value.first()"
              }
            ]
          },
          _given: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                  valueString: "item.where(linkId = 'given').answer.value"
                }
              ]
            }
          ]
        } as any
      ]
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: { reference: '#patTemplate' }
            }
          ]
        }
      ],
      linkId: 'patient',
      text: 'Patient Information',
      type: 'group',
      item: [
        {
          linkId: 'name',
          text: 'Name',
          type: 'group',
          repeats: true,
          item: [
            { linkId: 'given', text: 'Given Name(s)', type: 'string', repeats: true },
            { linkId: 'family', text: 'Family/Surname', type: 'string' }
          ]
        }
      ]
    }
  ]
};

function buildQR(givenAnswers: string[], familyAnswer?: string): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    questionnaire: 'https://smartforms.csiro.au/docs/tests/GivenNameReversal',
    item: [
      {
        linkId: 'patient',
        item: [
          {
            linkId: 'name',
            item: [
              {
                linkId: 'given',
                answer: givenAnswers.map((value) => ({ valueString: value }))
              },
              ...(familyAnswer !== undefined
                ? [{ linkId: 'family', answer: [{ valueString: familyAnswer }] }]
                : [])
            ]
          }
        ]
      }
    ]
  };
}

// Same template as above, but with the repeating value (_given) declared BEFORE the
// single value (_family). This is the case a naive "declaration order" fix would miss:
// the repeating value is the very first entry evaluated for the context, so the outer
// isNewInsert flag is true regardless of whether family has an answer.
const QGivenDeclaredFirst: Questionnaire = {
  ...QGivenNameReversal,
  id: 'GivenNameReversalGivenFirst',
  contained: [
    {
      resourceType: 'Patient',
      id: 'patTemplate',
      name: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId = 'name')"
            }
          ],
          _given: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                  valueString: "item.where(linkId = 'given').answer.value"
                }
              ]
            }
          ],
          _family: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'family').answer.value.first()"
              }
            ]
          }
        } as any
      ]
    }
  ]
};

describe('extract GivenNameReversal (issue #2107)', () => {
  it('merges a repeating value into a single array element in order when an earlier sibling value is empty', async () => {
    const result = await extract(
      createInputParameters(buildQR(['a', 'b']), QGivenNameReversal, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    const extracted = returnParam?.resource as Bundle;
    const patient = extracted.entry?.[0]?.resource as Patient;

    expect(patient.name).toEqual([{ given: ['a', 'b'] }]);
  });

  it('preserves order and merges into one element for three repeating values', async () => {
    const result = await extract(
      createInputParameters(buildQR(['a', 'b', 'c']), QGivenNameReversal, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    const extracted = returnParam?.resource as Bundle;
    const patient = extracted.entry?.[0]?.resource as Patient;

    expect(patient.name).toEqual([{ given: ['a', 'b', 'c'] }]);
  });

  it('still merges correctly when the repeating value is declared before the single value and both are answered', async () => {
    const result = await extract(
      createInputParameters(buildQR(['a', 'b'], 'Smith'), QGivenDeclaredFirst, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    const extracted = returnParam?.resource as Bundle;
    const patient = extracted.entry?.[0]?.resource as Patient;

    expect(patient.name).toEqual([{ given: ['a', 'b'], family: 'Smith' }]);
  });
});
