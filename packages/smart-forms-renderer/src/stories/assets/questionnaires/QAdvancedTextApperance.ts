import type { Questionnaire } from 'fhir/r4';

export const qRenderingStyleBooleanItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingStyle-1',
  name: 'RenderingStyle-1',
  title: 'Rendering Style 1',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-style-1',
  item: [
    {
      linkId: 'mark-complete',
      text: 'Mark section as complete',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
            valueString:
              'padding: 0.75rem; margin-bottom: 1rem; font-size: 0.875rem; color: #2E7D32; border-radius: 0.5rem; background-color: #d5e5d6; font-weight: 700;'
          }
        ]
      },
      type: 'boolean',
      repeats: false
    }
  ]
};

export const qRenderingXhtmlBooleanItem: Questionnaire = {
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
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n<head>\r\n    ' +
              '<style type="text/css">\r\n        ' +
              '.alert {\r\n            ' +
              'padding: 0.875rem;\r\n            ' +
              'margin-bottom: 1rem;\r\n            ' +
              'font-size: 0.875rem;\r\n            ' +
              'color: #29712D;\r\n            ' +
              'border-radius: 0.5rem;\r\n            ' +
              'background-color: #D9E8DA;\r\n            ' +
              'font-weight: 700;\r\n        ' +
              'max-width: 205px;\r\n        ' +
              '}\r\n    ' +
              '</style>\r\n' +
              '</head>\r\n' +
              '<body>\r\n' +
              '<div class="alert">Mark section as complete</div>\r\n' +
              '</body>\r\n' +
              '</div>'
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

export const qDisplayCategoryInstructionsString: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DisplayCategoryInstructionsString',
  name: 'DisplayCategoryInstructionsString',
  title: 'Display Category Instructions - String Field',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/display-category-string',
  item: [
    {
      linkId: 'phone-number',
      text: 'Phone Number',
      type: 'string',
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
          linkId: 'phone-number-instructions',
          text: 'Please enter a valid Australian phone number (e.g. 0412 345 678)',
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

export const qRenderingXhtmlGroupPropagationNested: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingXhtmlGroupPropagation',
  name: 'RenderingXhtmlGroupPropagation',
  title: 'Rendering XHTML Group Propagation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-xhtml-3',
  item: [
    {
      linkId: 'styled-group',
      text: 'Styled Group with XHTML',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml" style="color: blue; background-color: #f0f8ff; padding: 10px; border-radius: 5px;">\r\n<p>Styled Group with XHTML</p>\r\n</div>'
          }
        ]
      },
      type: 'group',
      item: [
        {
          linkId: 'child-question-1',
          text: 'Child Question 1',
          type: 'string'
        },
        {
          linkId: 'child-question-2',
          text: 'Child Question 2',
          type: 'string'
        },
        {
          linkId: 'child-subgroup',
          text: 'Child Subgroup',
          type: 'group',
          item: [
            {
              linkId: 'subgroup-question-1',
              text: 'Subgroup Question 1',
              type: 'string'
            },
            {
              linkId: 'nested-level-2',
              text: 'Nested Level 2 Group',
              type: 'group',
              item: [
                {
                  linkId: 'level-2-question-1',
                  text: 'Level 2 Question 1',
                  type: 'string'
                },
                {
                  linkId: 'level-2-question-2',
                  text: 'Level 2 Question 2',
                  type: 'string'
                },
                {
                  linkId: 'nested-level-3',
                  text: 'Nested Level 3 Group',
                  type: 'group',
                  item: [
                    {
                      linkId: 'level-3-question-1',
                      text: 'Level 3 Question 1',
                      type: 'string'
                    },
                    {
                      linkId: 'level-3-question-2',
                      text: 'Level 3 Question 2',
                      type: 'string'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const qRenderingXhtmlGroupPropagationInlineStyles: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingXhtmlGroupPropagationCalcExpression',
  name: 'RenderingXhtmlGroupPropagationCalcExpression',
  title: 'RenderingXhtmlGroupPropagationCalcExpression',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-xhtml-4',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'patientToRefer',
        language: 'text/fhirpath',
        expression:
          "%resource.item.where(linkId='referral-group').item.where(linkId='referral-patient-picker').answer.value"
      }
    }
  ],
  item: [
    {
      linkId: 'referral-group',
      text: 'Referral',
      type: 'group',
      item: [
        {
          linkId: 'referral-patient-picker',
          text: 'Select patient to refer',
          type: 'choice',
          answerOption: [
            {
              valueString: 'Adam'
            },
            {
              valueString: 'Alan'
            },

            {
              valueString: 'Ben'
            }
          ]
        },
        {
          linkId: 'referral-group-info',
          type: 'group',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
              valueString:
                '<div style="background-color: #E9F2FF;" role="status" xmlns="http://www.w3.org/1999/xhtml"><img alt="Information" src="https://www.digitalhealth.gov.au/chap/info.svg" /><div><h2>Consider a referral</h2></div></div>'
            }
          ],
          item: [
            {
              linkId: '3-BasicExaminations-visiontest-Infopanel-referral4',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                    valueExpression: {
                      description: "Display the patient's first name",
                      language: 'text/fhirpath',
                      expression:
                        "'You may need a referral if ' + %patientToRefer + '\\'s screening result is abnormal, or you\\'re uncertain, and unable to test.'"
                    }
                  }
                ]
              },
              type: 'display'
            }
          ],
          enableWhen: [
            {
              question: 'referral-patient-picker',
              operator: 'exists',
              answerBoolean: true
            }
          ]
        }
      ]
    }
  ]
};

export const qRenderingXhtmlGroupPropagationClassStyles: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RenderingXhtmlGroupPropagationCalcExpression',
  name: 'RenderingXhtmlGroupPropagationCalcExpression',
  title: 'RenderingXhtmlGroupPropagationCalcExpression',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/rendering-xhtml-4',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'patientToRefer',
        language: 'text/fhirpath',
        expression:
          "%resource.item.where(linkId='referral-group').item.where(linkId='referral-patient-picker').answer.value"
      }
    }
  ],
  item: [
    {
      linkId: 'referral-group',
      text: 'Referral',
      type: 'group',
      item: [
        {
          linkId: 'referral-patient-picker',
          text: 'Select patient to refer',
          type: 'choice',
          answerOption: [
            {
              valueString: 'Adam'
            },
            {
              valueString: 'Alan'
            },

            {
              valueString: 'Ben'
            }
          ]
        },
        {
          linkId: 'referral-group-info',
          type: 'group',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
              valueString:
                '<div class="group-custom-bg bold" role="status" xmlns="http://www.w3.org/1999/xhtml"><img alt="Information" src="https://www.digitalhealth.gov.au/chap/info.svg" /><div><h2>Consider a referral</h2></div></div>'
            }
          ],
          item: [
            {
              linkId: '3-BasicExaminations-visiontest-Infopanel-referral4',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                    valueExpression: {
                      description: "Display the patient's first name",
                      language: 'text/fhirpath',
                      expression:
                        "'You may need a referral if ' + %patientToRefer + '\\'s screening result is abnormal, or you\\'re uncertain, and unable to test.'"
                    }
                  }
                ]
              },
              type: 'display'
            }
          ],
          enableWhen: [
            {
              question: 'referral-patient-picker',
              operator: 'exists',
              answerBoolean: true
            }
          ]
        }
      ]
    }
  ]
};
