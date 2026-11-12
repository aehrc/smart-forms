import type { Questionnaire } from 'fhir/r4';

/**
 * Minimal questionnaire reproducing static (non-templateExtractValue) primitive array data sitting
 * alongside sibling `templateExtractValue`s in the same `templateExtractContext`.
 *
 * Static data must only be spread into the element once, when it's first seeded - if it were
 * re-attached on every subsequent sibling merge too, a static primitive array like `prefix` here
 * would collide with itself and duplicate once per sibling value merged in after the first.
 *
 * Three siblings prove this: `_family` (seeds the element), `_use` (a second single-value merge),
 * then a repeating `_given` (a multi-value merge, to also check static data doesn't leak back in
 * per inner repeat value). The repeating value is deliberately not first, so this fixture isolates
 * the static-data duplication rather than any behaviour specific to the first value merged.
 */
export const QStaticDataNotDuplicated: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'StaticDataNotDuplicated',
  url: 'https://smartforms.csiro.au/docs/tests/StaticDataNotDuplicated',
  name: 'StaticDataNotDuplicated',
  title: 'Static data not duplicated',
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
          // Static template data - not driven by a templateExtractValue.
          prefix: ['Dr'],
          // @ts-ignore - TS2353: `_family` carries the templateExtractValue directive.
          _family: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'family').answer.value.first()"
              }
            ]
          },
          // @ts-ignore - TS2353: `_use` carries the templateExtractValue directive.
          _use: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'use').answer.value.first()"
              }
            ]
          },
          // @ts-ignore - TS2353: `_given` carries the templateExtractValue directive. Repeating,
          // and deliberately declared last so it isn't the first sibling merged for this context.
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
              linkId: 'family',
              text: 'Family/Surname',
              type: 'string'
            },
            {
              linkId: 'use',
              text: 'Name use',
              type: 'string'
            },
            {
              linkId: 'given',
              text: 'Given Name(s)',
              type: 'string',
              repeats: true
            }
          ]
        }
      ]
    }
  ]
};
