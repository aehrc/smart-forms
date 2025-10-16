import type { Questionnaire } from 'fhir/r4';

export const qEntryFormat: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
          valueString: '####'
        }
      ],
      linkId: 'postcode',
      definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
      text: 'Postcode',
      type: 'string',
      repeats: false
    }
  ]
};

export const qShortText: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                version: '1.0.0',
                code: 'tab-container'
              }
            ]
          }
        }
      ],
      linkId: 'tab-container',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Regular medications'
            }
          ],
          linkId: 'tab-regular-medications',
          text: 'Regular medications: check if still required, appropriate dose, understanding of medication and adherence',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'highlight-short-text',
              text: 'Notice the short text is used in the tab. The group title still displays the full text.',
              type: 'display',
              repeats: false
            }
          ]
        }
      ]
    }
  ]
};

export const qQuestionnaireUnit: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'cm',
            display: 'cm'
          }
        }
      ],
      linkId: 'height',
      text: 'Height',
      type: 'decimal',
      repeats: false
    }
  ]
};
