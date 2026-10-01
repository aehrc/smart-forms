import type { Questionnaire } from 'fhir/r4';

/**
 * Minimal questionnaire whose templateExtractValues read answers in two ways:
 * - `Observation.valueString` uses the root-level `%resource`
 * - `Observation.code.text` uses a path relative to the templateExtract item
 *
 * In a modified-only extract, the comparison response is extracted with the same templates. `%resource`
 * must then point at the comparison response, not the current one. Otherwise `valueString` evaluates to
 * the same value in both extracts and a change to the `resourceAnswer` item is never detected.
 */
export const QResourceContextComparison: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ResourceContextComparison',
  url: 'https://smartforms.csiro.au/docs/tests/ResourceContextComparison',
  name: 'ResourceContextComparison',
  title: 'Resource context comparison',
  status: 'draft',
  experimental: true,
  subjectType: ['Patient'],
  contained: [
    {
      resourceType: 'Observation',
      id: 'obsTemplate',
      status: 'final',
      code: {
        // @ts-ignore - TS2353: `_text` carries the templateExtractValue directive.
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "item.where(linkId = 'relativeAnswer').answer.value.first()"
            }
          ]
        }
      },
      // @ts-ignore - TS2353: `_valueString` carries the templateExtractValue directive.
      _valueString: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString:
              "%resource.descendants().where(linkId = 'resourceAnswer').answer.value.first()"
          }
        ]
      }
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
                reference: '#obsTemplate'
              }
            }
          ]
        }
      ],
      linkId: 'observation',
      text: 'Observation',
      type: 'group',
      item: [
        {
          linkId: 'resourceAnswer',
          text: 'Answer read via %resource',
          type: 'string'
        },
        {
          linkId: 'relativeAnswer',
          text: 'Answer read via a relative path',
          type: 'string'
        }
      ]
    }
  ]
};
