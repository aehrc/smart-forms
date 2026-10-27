import type { Questionnaire } from 'fhir/r4';

// No external ValueSets or clinical server are needed for these public-API checks.
export const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'toolkit-regression',
  status: 'draft',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        { url: 'name', valueCoding: { code: 'user' } },
        { url: 'type', valueCode: 'Practitioner' }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        { url: 'name', valueCoding: { code: 'practitionerrole' } },
        { url: 'type', valueCode: 'PractitionerRole' }
      ]
    }
  ],
  item: [
    {
      linkId: 'tabs',
      type: 'group',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              { system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'tab-container' }
            ]
          }
        }
      ],
      item: [
        {
          linkId: 'user-tab',
          text: 'User tab',
          type: 'group',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              extension: [
                {
                  url: 'template',
                  valueReference: { reference: '#name-observation-template' }
                }
              ]
            }
          ],
          item: [
            {
              linkId: 'user-name',
              text: 'Practitioner name',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: { language: 'text/fhirpath', expression: '%user.name.family' }
                }
              ]
            }
          ]
        },
        {
          linkId: 'context-tab',
          text: 'Context tab',
          type: 'group',
          item: [
            {
              linkId: 'role-location',
              text: 'Role location',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%practitionerrole.location.reference'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  contained: [
    {
      resourceType: 'Observation',
      id: 'name-observation-template',
      status: 'final',
      code: { text: 'Practitioner name' },
      valueString: '',
      _valueString: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId='user-name').answer.value"
          }
        ]
      }
    }
  ]
};
