import { Questionnaire } from 'fhir/r4';

export const qWidthExtensionTable: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'WidthExtensionTable',
  name: 'WidthExtensionTable',
  title: 'SDC Width Extension - Table Layout Example',
  version: '1.0.0-alpha.101',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/width-extension/table',
  item: [
    {
      linkId: 'table-layout',
      text: 'Table Layout with Width Controls',
      type: 'group',
      repeats: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                version: '1.0.0',
                code: 'gtable'
              }
            ]
          }
        }
      ],
      item: [
        {
          linkId: 'name',
          text: 'Full Name (30%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 30,
                code: '%'
              }
            }
          ]
        },
        {
          linkId: 'age',
          text: 'Age (20%)',
          type: 'integer',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 20,
                code: '%'
              }
            }
          ]
        },
        {
          linkId: 'email',
          text: 'Email (50%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 50,
                code: '%'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const qWidthExtensionGrid: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'WidthExtensionGrid',
  name: 'WidthExtensionGrid',
  title: 'SDC Width Extension - Grid Layout Example',
  version: '1.0.0-alpha.101',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/width-extension/grid',
  item: [
    {
      linkId: 'grid-layout',
      text: 'Grid Layout with Width Controls',
      type: 'group',
      repeats: false,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                version: '1.0.0',
                code: 'grid'
              }
            ]
          }
        }
      ],
      item: [
        {
          linkId: 'row1',
          text: 'Row 1',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'col1',
              text: 'Name (30%)',
              type: 'string',
              required: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
                  valueQuantity: {
                    value: 30,
                    code: '%'
                  }
                }
              ]
            },
            {
              linkId: 'col2',
              text: 'Email (70%)',
              type: 'string',
              required: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
                  valueQuantity: {
                    value: 70,
                    code: '%'
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'row2',
          text: 'Row 2',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'col1',
              text: 'Name (30%)',
              type: 'string',
              required: true
            },
            {
              linkId: 'col2',
              text: 'Email (70%)',
              type: 'string',
              required: true
            }
          ]
        }
      ]
    }
  ]
};
