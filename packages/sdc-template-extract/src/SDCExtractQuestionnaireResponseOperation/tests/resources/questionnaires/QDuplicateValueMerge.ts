import type { Questionnaire } from 'fhir/r4';

/**
 * Minimal questionnaire reproducing a repeating `templateExtractValue` whose evaluated values
 * contain a genuine duplicate (the same given name answered twice).
 *
 * `buildValuesToInsert` splits a multi-value result into one object per value (e.g. `given: ['Alex']`,
 * `given: ['Alex']`), which are merged into the same array one after another via `mergeArrayByIndex`.
 * If a duplicate value is mistaken for the same static data being re-attached and dropped instead of
 * appended, the second occurrence would be silently lost.
 */
export const QDuplicateValueMerge: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DuplicateValueMerge',
  url: 'https://smartforms.csiro.au/docs/tests/DuplicateValueMerge',
  name: 'DuplicateValueMerge',
  title: 'Duplicate value merge',
  status: 'draft',
  experimental: true,
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
          // @ts-ignore - TS2353: `_family` carries the templateExtractValue directive.
          _family: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'family').answer.value.first()"
              }
            ]
          },
          // @ts-ignore - TS2353: `_given` carries the templateExtractValue directive.
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
                reference: '#patTemplate'
              }
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
            {
              linkId: 'given',
              text: 'Given Name(s)',
              type: 'string',
              repeats: true
            },
            {
              linkId: 'family',
              text: 'Family/Surname',
              type: 'string'
            }
          ]
        }
      ]
    }
  ]
};
