import type { Questionnaire } from 'fhir/r4';

export const qRenderingXhtmlBooleanCheckboxItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingXhtml-1',
  name: 'RenderingXhtml-1',
  title: 'Rendering XHTML 1',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-xhtml-1',
  item: [
    {
      linkId: 'mark-complete',
      text: 'Mark section as complete',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n<head>\r\n    <style type="text/css">\r\n        .alert {\r\n            padding: 0.75rem;\r\n            margin-bottom: 1rem;\r\n            font-size: 0.875rem;\r\n            color: #2E7D32;\r\n            border-radius: 0.5rem;\r\n            background-color: #d5e5d6;\r\n            font-weight: 700;\r\n        }\r\n    </style>\r\n</head>\r\n<body>\r\n<div class="alert">Mark section as complete</div>\r\n</body>\r\n</div>'
          }
        ]
      },
      type: 'boolean',
      repeats: false
    }
  ]
};

export const qRenderingXhtmlDisplayListItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingXhtml-2',
  name: 'RenderingXhtml-2',
  title: 'Rendering XHTML 2',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-xhtml-2',
  item: [
    {
      linkId: 'record-update-med-history',
      text: 'Important: The patient record may not be updated with information entered here. Information intended for the patient record should be entered there first.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <div>For older people with chronic disease and/or conditions associated with ageing, consider assessing:</div>\r\n    <ul>\r\n      <li>Osteoporosis risk</li>\r\n      <li>Falls risk</li>\r\n      <li>Balance, coordination and mobility</li>\r\n      <li>Pain</li>\r\n      <li>Nutrition</li>\r\n      <li>Regularity of chronic disease management and review</li>\r\n    </ul>\r\n    </div>'
          }
        ]
      },
      type: 'display'
    }
  ]
};

export const qRenderingXhtmlDisplayBase64ImageItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingXhtml-3',
  name: 'RenderingXhtml-3',
  title: 'Rendering XHTML 3',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-xhtml-3',
  item: [
    {
      linkId: 'CD-in-progress-1',
      text: 'In progress',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div title="Section completed" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'64\' height=\'64\' src=\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMyZTdkMzIiIGQ9Ik0yMCAxMmE4IDggMCAwIDEtOCA4YTggOCAwIDAgMS04LThhOCA4IDAgMCAxIDgtOGMuNzYgMCAxLjUuMTEgMi4yLjMxbDEuNTctMS41N0E5LjgyMiA5LjgyMiAwIDAgMCAxMiAyQTEwIDEwIDAgMCAwIDIgMTJhMTAgMTAgMCAwIDAgMTAgMTBhMTAgMTAgMCAwIDAgMTAtMTBNNy45MSAxMC4wOEw2LjUgMTEuNUwxMSAxNkwyMSA2bC0xLjQxLTEuNDJMMTEgMTMuMTdsLTMuMDktMy4wOVoiLz48L3N2Zz4=\'\r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
          }
        ]
      },
      type: 'display'
    }
  ]
};

export const qDisplayCategoryInstructions: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DisplayCategoryInstructions',
  name: 'DisplayCategoryInstructions',
  title: 'Display Category Instructions',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/display-category-1',
  item: [
    {
      linkId: 'eligible-health-check',
      text: 'Eligible for health check',
      type: 'boolean',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-display-category',
                    code: 'instructions'
                  }
                ]
              }
            }
          ],
          linkId: 'eligible-health-check-instructions',
          text: 'Have not claimed a health check in the past nine months',
          type: 'display'
        }
      ]
    }
  ]
};

export const qOpenLabel: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenLabel',
  name: 'OpenLabel',
  title: 'Open Label',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/open-label',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Other, please specify'
        }
      ],
      linkId: 'health-check-location',
      text: 'Location of health check',
      type: 'open-choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '257585005',
            display: 'Clinic'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '264362003',
            display: 'Home'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '257698009',
            display: 'School'
          }
        }
      ]
    }
  ]
};

export const qHidden: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'Hidden',
  name: 'Hidden',
  title: 'Hidden',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/hidden',
  item: [
    {
      linkId: 'display-about',
      type: 'display',
      text: "If hidden works, you wouldn't see the question below!"
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
          valueBoolean: true
        }
      ],
      linkId: 'string-hidden',
      type: 'string',
      text: 'Hidden string field'
    }
  ]
};
