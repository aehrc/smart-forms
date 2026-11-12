import type { Questionnaire } from 'fhir/r4';

/**
 * Minimal questionnaire reproducing a `templateExtractValue` that targets a field of an element
 * which ALREADY EXISTS in the template's array, underneath a `templateExtractContext`.
 *
 * The template is a Bundle whose `entry[0]` is context-gated, which is how a whole resource is made
 * conditional. The engine deletes that gated entry and re-inserts it per context result, seeding it
 * from the static template and then merging each evaluated value into it.
 *
 * Inside the gated entry, `protocolApplied[0]` is declared statically with a `targetDisease`, and
 * the value expression writes `protocolApplied[0].doseNumberPositiveInt`. Because the value path
 * names index 0, the evaluated value belongs in that same element, next to `targetDisease`.
 */
export const QArrayElementMerge: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ArrayElementMerge',
  url: 'https://smartforms.csiro.au/docs/tests/ArrayElementMerge',
  name: 'ArrayElementMerge',
  title: 'Array element merge',
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
          // @ts-ignore - TS2353: `_fullUrl` carries the identity value directive. A context-gated
          // entry is seeded with a shallow spread of its first evaluated value, so the first value
          // must be one at depth 1 (here `fullUrl` overwritten with itself), otherwise a value
          // under `resource.…` would replace the whole static resource.
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
                targetDisease: [
                  {
                    coding: [
                      {
                        system: 'http://snomed.info/sct',
                        code: '67924001'
                      }
                    ]
                  }
                ],
                // @ts-ignore - TS2353: `_doseNumberPositiveInt` is the primitive extension sibling,
                // which carries the templateExtractValue directive. Only present in templates.
                _doseNumberPositiveInt: {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                      valueString:
                        "%resource.descendants().where(linkId='doses').answer.value.first()"
                    }
                  ]
                }
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
        }
      ]
    }
  ]
};
