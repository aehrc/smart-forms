import { Questionnaire } from 'fhir/r4';

export const qWidthExtensionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'WidthExtensionBasic',
  name: 'WidthExtensionBasic',
  title: 'SDC Width Extension - Basic Example',
  version: '1.0.0-alpha.101',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/width-extension/basic',
  item: [
    {
      linkId: 'patient-info',
      text: 'Patient Information',
      type: 'group',
      item: [
        {
          linkId: 'name',
          text: 'Full Name (50%)',
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
        },
        {
          linkId: 'age',
          text: 'Age (25%)',
          type: 'integer',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 25,
                code: '%'
              }
            }
          ]
        },
        {
          linkId: 'email',
          text: 'Email Address (75%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 75,
                code: '%'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'contact-info',
      text: 'Contact Information',
      type: 'group',
      item: [
        {
          linkId: 'phone',
          text: 'Phone Number (40%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 40,
                code: '%'
              }
            }
          ]
        },
        {
          linkId: 'address',
          text: 'Address (100%)',
          type: 'text',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 100,
                code: '%'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const qWidthExtensionPercentage: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'WidthExtensionPercentage',
  name: 'WidthExtensionPercentage',
  title: 'SDC Width Extension - Percentage Example',
  version: '1.0.0-alpha.101',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/width-extension/percentage',
  item: [
    {
      linkId: 'percentage-table',
      text: 'Table with Different Column Widths',
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
                code: 'table'
              }
            ]
          }
        }
      ],
      item: [
        {
          linkId: 'full-width',
          text: 'Full Width Column (100%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 100,
                code: '%'
              }
            }
          ]
        },
        {
          linkId: 'half-width',
          text: 'Half Width Column (50%)',
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
        },
        {
          linkId: 'quarter-width',
          text: 'Quarter Width Column (25%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 25,
                code: '%'
              }
            }
          ]
        },
        {
          linkId: 'three-quarter-width',
          text: 'Three Quarter Width Column (75%)',
          type: 'string',
          required: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 75,
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
              linkId: 'col1-row1',
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
              linkId: 'col2-row1',
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
              linkId: 'col1-row2',
              text: 'Phone (40%)',
              type: 'string',
              required: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
                  valueQuantity: {
                    value: 40,
                    code: '%'
                  }
                }
              ]
            },
            {
              linkId: 'col2-row2',
              text: 'Address (60%)',
              type: 'string',
              required: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
                  valueQuantity: {
                    value: 60,
                    code: '%'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
