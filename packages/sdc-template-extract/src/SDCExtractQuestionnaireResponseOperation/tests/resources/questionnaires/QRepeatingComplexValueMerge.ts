import type { Questionnaire } from 'fhir/r4';

/**
 * Minimal questionnaire reproducing a repeating templateExtractValue whose evaluated result is a
 * complex type (a Coding) rather than a primitive, merged into an array alongside another sibling
 * value in the same context.
 *
 * `protocolApplied[0]` has two templateExtractValues: `_doseNumberPositiveInt` (single-value,
 * declared first) and `targetDisease` (repeating, evaluating to two Codings for a combined vaccine).
 * Because `doseNumberPositiveInt` is processed first and answered, the repeating `targetDisease`
 * merge goes through the object-merge path rather than a fresh array insert - the case that
 * previously collapsed repeated Codings into one instead of appending them.
 */
export const QRepeatingComplexValueMerge: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RepeatingComplexValueMerge',
  url: 'https://smartforms.csiro.au/docs/tests/RepeatingComplexValueMerge',
  name: 'RepeatingComplexValueMerge',
  title: 'Repeating complex value merge',
  status: 'draft',
  experimental: true,
  subjectType: ['Patient'],
  contained: [
    {
      resourceType: 'Bundle',
      id: 'BundleTemplate',
      type: 'transaction',
      entry: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "iif(item.where(linkId='doses').answer.value.exists(), true, {})"
            }
          ],
          fullUrl: 'urn:uuid:0f9b1a2c-3d4e-5f60-7182-93a4b5c6d7e8',
          // @ts-ignore - TS2353: `_fullUrl` carries the identity value directive.
          _fullUrl: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "'urn:uuid:0f9b1a2c-3d4e-5f60-7182-93a4b5c6d7e8'"
              }
            ]
          },
          resource: {
            resourceType: 'Immunization',
            status: 'completed',
            vaccineCode: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '1290624003'
                }
              ]
            },
            patient: {
              reference: 'Patient/example'
            },
            occurrenceDateTime: '2025-01-01',
            protocolApplied: [
              {
                // @ts-ignore - TS2353: `_doseNumberPositiveInt` carries the templateExtractValue directive.
                _doseNumberPositiveInt: {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                      valueString:
                        "%resource.descendants().where(linkId='doses').answer.value.first()"
                    }
                  ]
                },
                targetDisease: [
                  {
                    extension: [
                      {
                        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                        valueString:
                          "%resource.descendants().where(linkId='diseases').answer.valueCoding"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
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
              valueReference: {
                reference: '#BundleTemplate'
              }
            }
          ]
        }
      ],
      linkId: 'immunisation',
      text: 'Immunisation',
      type: 'group',
      item: [
        {
          linkId: 'doses',
          text: 'Total number of doses',
          type: 'integer'
        },
        {
          linkId: 'diseases',
          text: 'Diseases covered',
          type: 'choice',
          repeats: true,
          answerOption: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '14189004',
                display: 'Measles'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '36989005',
                display: 'Mumps'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '36653000',
                display: 'Rubella'
              }
            }
          ]
        }
      ]
    }
  ]
};
