/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const qItemControlDisplayContextDisplay: Questionnaire = {
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
      text: 'Tab Container',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'tab-section-1',
          text: 'Tab section 1',
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system:
                          'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                        code: 'context-display'
                      }
                    ]
                  }
                }
              ],
              linkId: 'CD-in-progress-1',
              text: 'In progress',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div title="In progress" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,\r\n\t\tPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiM3NTc1NzUiIGQ9Im0xNS44NCAxMC4ybC0xLjAxIDEuMDFsLTIuMDctMi4wM2wxLjAxLTEuMDJjLjItLjIxLjU0LS4yMi43OCAwbDEuMjkgMS4yNWMuMjEuMjEuMjIuNTUgMCAuNzlNOCAxMy45MWw0LjE3LTQuMTlsMi4wNyAyLjA4bC00LjE2IDQuMkg4di0yLjA5TTEzIDJ2MmM0LjM5LjU0IDcuNSA0LjUzIDYuOTYgOC45MkE4LjAxNCA4LjAxNCAwIDAgMSAxMyAxOS44OHYyYzUuNS0uNiA5LjQ1LTUuNTQgOC44NS0xMS4wM0MyMS4zMyA2LjE5IDE3LjY2IDIuNSAxMyAybS0yIDBjLTEuOTYuMTgtMy44MS45NS01LjMzIDIuMkw3LjEgNS43NGMxLjEyLS45IDIuNDctMS40OCAzLjktMS42OHYtMk00LjI2IDUuNjdBOS44MSA5LjgxIDAgMCAwIDIuMDUgMTFoMmMuMTktMS40Mi43NS0yLjc3IDEuNjQtMy45TDQuMjYgNS42N00yLjA2IDEzYy4yIDEuOTYuOTcgMy44MSAyLjIxIDUuMzNsMS40Mi0xLjQzQTguMDAyIDguMDAyIDAgMCAxIDQuMDYgMTNoLTJtNSA1LjM3bC0xLjM5IDEuMzdBOS45OTQgOS45OTQgMCAwIDAgMTEgMjJ2LTJhOC4wMDIgOC4wMDIgMCAwIDEtMy45LTEuNjNoLS4wNFoiLz48L3N2Zz4=\' \r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
                  }
                ]
              },
              type: 'display',
              enableWhen: [
                {
                  question: 'MarkComplete-1',
                  operator: '!=',
                  answerBoolean: true
                }
              ]
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system:
                          'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                        code: 'context-display'
                      }
                    ]
                  }
                }
              ],
              linkId: 'CD-complete-1',
              text: 'Complete',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div title="Section completed" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMyZTdkMzIiIGQ9Ik0yMCAxMmE4IDggMCAwIDEtOCA4YTggOCAwIDAgMS04LThhOCA4IDAgMCAxIDgtOGMuNzYgMCAxLjUuMTEgMi4yLjMxbDEuNTctMS41N0E5LjgyMiA5LjgyMiAwIDAgMCAxMiAyQTEwIDEwIDAgMCAwIDIgMTJhMTAgMTAgMCAwIDAgMTAgMTBhMTAgMTAgMCAwIDAgMTAtMTBNNy45MSAxMC4wOEw2LjUgMTEuNUwxMSAxNkwyMSA2bC0xLjQxLTEuNDJMMTEgMTMuMTdsLTMuMDktMy4wOVoiLz48L3N2Zz4=\'\r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
                  }
                ]
              },
              type: 'display',
              enableWhen: [
                {
                  question: 'MarkComplete-1',
                  operator: '=',
                  answerBoolean: true
                }
              ]
            },
            {
              linkId: 'MarkComplete-1',
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
        },
        {
          linkId: 'tab-section-2',
          text: 'Tab section 2',
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system:
                          'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                        code: 'context-display'
                      }
                    ]
                  }
                }
              ],
              linkId: 'CD-in-progress-2',
              text: 'In progress',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div title="In progress" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,\r\n\t\tPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiM3NTc1NzUiIGQ9Im0xNS44NCAxMC4ybC0xLjAxIDEuMDFsLTIuMDctMi4wM2wxLjAxLTEuMDJjLjItLjIxLjU0LS4yMi43OCAwbDEuMjkgMS4yNWMuMjEuMjEuMjIuNTUgMCAuNzlNOCAxMy45MWw0LjE3LTQuMTlsMi4wNyAyLjA4bC00LjE2IDQuMkg4di0yLjA5TTEzIDJ2MmM0LjM5LjU0IDcuNSA0LjUzIDYuOTYgOC45MkE4LjAxNCA4LjAxNCAwIDAgMSAxMyAxOS44OHYyYzUuNS0uNiA5LjQ1LTUuNTQgOC44NS0xMS4wM0MyMS4zMyA2LjE5IDE3LjY2IDIuNSAxMyAybS0yIDBjLTEuOTYuMTgtMy44MS45NS01LjMzIDIuMkw3LjEgNS43NGMxLjEyLS45IDIuNDctMS40OCAzLjktMS42OHYtMk00LjI2IDUuNjdBOS44MSA5LjgxIDAgMCAwIDIuMDUgMTFoMmMuMTktMS40Mi43NS0yLjc3IDEuNjQtMy45TDQuMjYgNS42N00yLjA2IDEzYy4yIDEuOTYuOTcgMy44MSAyLjIxIDUuMzNsMS40Mi0xLjQzQTguMDAyIDguMDAyIDAgMCAxIDQuMDYgMTNoLTJtNSA1LjM3bC0xLjM5IDEuMzdBOS45OTQgOS45OTQgMCAwIDAgMTEgMjJ2LTJhOC4wMDIgOC4wMDIgMCAwIDEtMy45LTEuNjNoLS4wNFoiLz48L3N2Zz4=\' \r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
                  }
                ]
              },
              type: 'display',
              enableWhen: [
                {
                  question: 'MarkComplete-2',
                  operator: '!=',
                  answerBoolean: true
                }
              ]
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system:
                          'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                        code: 'context-display'
                      }
                    ]
                  }
                }
              ],
              linkId: 'CD-complete-2',
              text: 'Complete',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div title="Section completed" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMyZTdkMzIiIGQ9Ik0yMCAxMmE4IDggMCAwIDEtOCA4YTggOCAwIDAgMS04LThhOCA4IDAgMCAxIDgtOGMuNzYgMCAxLjUuMTEgMi4yLjMxbDEuNTctMS41N0E5LjgyMiA5LjgyMiAwIDAgMCAxMiAyQTEwIDEwIDAgMCAwIDIgMTJhMTAgMTAgMCAwIDAgMTAgMTBhMTAgMTAgMCAwIDAgMTAtMTBNNy45MSAxMC4wOEw2LjUgMTEuNUwxMSAxNkwyMSA2bC0xLjQxLTEuNDJMMTEgMTMuMTdsLTMuMDktMy4wOVoiLz48L3N2Zz4=\'\r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
                  }
                ]
              },
              type: 'display',
              enableWhen: [
                {
                  question: 'MarkComplete-2',
                  operator: '=',
                  answerBoolean: true
                }
              ]
            },
            {
              linkId: 'MarkComplete-2',
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
        },
        {
          linkId: 'tab-section-3',
          text: 'Tab section 3',
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system:
                          'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                        code: 'context-display'
                      }
                    ]
                  }
                }
              ],
              linkId: 'CD-in-progress-3',
              text: 'In progress',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div title="In progress" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,\r\n\t\tPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiM3NTc1NzUiIGQ9Im0xNS44NCAxMC4ybC0xLjAxIDEuMDFsLTIuMDctMi4wM2wxLjAxLTEuMDJjLjItLjIxLjU0LS4yMi43OCAwbDEuMjkgMS4yNWMuMjEuMjEuMjIuNTUgMCAuNzlNOCAxMy45MWw0LjE3LTQuMTlsMi4wNyAyLjA4bC00LjE2IDQuMkg4di0yLjA5TTEzIDJ2MmM0LjM5LjU0IDcuNSA0LjUzIDYuOTYgOC45MkE4LjAxNCA4LjAxNCAwIDAgMSAxMyAxOS44OHYyYzUuNS0uNiA5LjQ1LTUuNTQgOC44NS0xMS4wM0MyMS4zMyA2LjE5IDE3LjY2IDIuNSAxMyAybS0yIDBjLTEuOTYuMTgtMy44MS45NS01LjMzIDIuMkw3LjEgNS43NGMxLjEyLS45IDIuNDctMS40OCAzLjktMS42OHYtMk00LjI2IDUuNjdBOS44MSA5LjgxIDAgMCAwIDIuMDUgMTFoMmMuMTktMS40Mi43NS0yLjc3IDEuNjQtMy45TDQuMjYgNS42N00yLjA2IDEzYy4yIDEuOTYuOTcgMy44MSAyLjIxIDUuMzNsMS40Mi0xLjQzQTguMDAyIDguMDAyIDAgMCAxIDQuMDYgMTNoLTJtNSA1LjM3bC0xLjM5IDEuMzdBOS45OTQgOS45OTQgMCAwIDAgMTEgMjJ2LTJhOC4wMDIgOC4wMDIgMCAwIDEtMy45LTEuNjNoLS4wNFoiLz48L3N2Zz4=\' \r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
                  }
                ]
              },
              type: 'display',
              enableWhen: [
                {
                  question: 'MarkComplete-3',
                  operator: '!=',
                  answerBoolean: true
                }
              ]
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system:
                          'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                        code: 'context-display'
                      }
                    ]
                  }
                }
              ],
              linkId: 'CD-complete-3',
              text: 'Complete',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div title="Section completed" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMyZTdkMzIiIGQ9Ik0yMCAxMmE4IDggMCAwIDEtOCA4YTggOCAwIDAgMS04LThhOCA4IDAgMCAxIDgtOGMuNzYgMCAxLjUuMTEgMi4yLjMxbDEuNTctMS41N0E5LjgyMiA5LjgyMiAwIDAgMCAxMiAyQTEwIDEwIDAgMCAwIDIgMTJhMTAgMTAgMCAwIDAgMTAgMTBhMTAgMTAgMCAwIDAgMTAtMTBNNy45MSAxMC4wOEw2LjUgMTEuNUwxMSAxNkwyMSA2bC0xLjQxLTEuNDJMMTEgMTMuMTdsLTMuMDktMy4wOVoiLz48L3N2Zz4=\'\r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
                  }
                ]
              },
              type: 'display',
              enableWhen: [
                {
                  question: 'MarkComplete-3',
                  operator: '=',
                  answerBoolean: true
                }
              ]
            },
            {
              linkId: 'MarkComplete-3',
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
        }
      ]
    }
  ]
};

export const qQuestionnaireItemTextHidden: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'note-1',
      text: 'This group has its group heading hidden via the usage of custom extension https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This group has its group heading hidden via the usage of custom extension https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden.</b>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: 'home-address-1',
      text: 'Home address',
      _text: {
        extension: [
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
            valueBoolean: true
          }
        ]
      },
      type: 'group',
      item: [
        {
          linkId: 'home-address-1-street',
          text: 'Street address',
          type: 'string'
        },
        {
          linkId: 'home-address-1-city',
          text: 'City',
          type: 'string'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/regex',
              valueString: "matches('^[0-9]{4}$')"
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
              valueString: '####'
            }
          ],
          linkId: 'home-address-1-postcode',
          text: 'Postcode',
          type: 'string'
        }
      ]
    },
    {
      linkId: 'note-2',
      text: 'This group has its group heading shown (default).',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This group has its group heading shown (default).</b>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: 'home-address-2',
      text: 'Home address',
      type: 'group',
      item: [
        {
          linkId: 'home-address-2-street',
          text: 'Street address',
          type: 'string'
        },
        {
          linkId: 'home-address-2-city',
          text: 'City',
          type: 'string'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/regex',
              valueString: "matches('^[0-9]{4}$')"
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
              valueString: '####'
            }
          ],
          linkId: 'home-address-2-postcode',
          definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
          text: 'Postcode',
          type: 'string',
          repeats: false
        }
      ]
    }
  ]
};

export const qGroupHideAddItemButton: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'MedicalHistory',
      url: 'https://smartforms.csiro.au/ig/ValueSet/MedicalHistory',
      name: 'MedicalHistory',
      title: 'Medical History',
      status: 'draft',
      experimental: false,
      description:
        'The Medical History value set includes values that may be used to represent medical history, operations and hospital admissions.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^32570581000036105|Problem/Diagnosis reference set| OR ^32570141000036105|Procedure foundation reference set|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'condition-clinical',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pc'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'trial-use'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 3
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/condition-clinical',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.164'
        }
      ],
      version: '4.0.1',
      name: 'ConditionClinicalStatusCodes',
      title: 'Condition Clinical Status Codes',
      status: 'draft',
      experimental: false,
      publisher: 'FHIR Project team',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            }
          ]
        }
      ],
      description: 'Preferred value set for Condition Clinical Status.',
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:79d21cca-9f34-4cfa-9020-17eee95eeed8',
        timestamp: '2024-04-02T14:17:12+10:00',
        total: 6,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'warning-draft',
            valueUri: 'http://hl7.org/fhir/ValueSet/condition-clinical|4.0.1'
          },
          {
            name: 'warning-trial-use',
            valueUri: 'http://hl7.org/fhir/ValueSet/condition-clinical|4.0.1'
          },
          {
            name: 'warning-trial-use',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'warning-draft',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'recurrence',
            display: 'Recurrence'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'relapse',
            display: 'Relapse'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'remission',
            display: 'Remission'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved',
            display: 'Resolved'
          }
        ]
      }
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression:
          'Condition?patient={{%patient.id}}&category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item'
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
          valueBoolean: true
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'gtable'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'ConditionRepeat',
            language: 'text/fhirpath',
            expression:
              "%Condition.entry.resource.where(verificationStatus.coding.all(code.empty() or code='confirmed'))"
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#ConditionPatchTemplate'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl',
              valueString: "'Condition/' + item.where(linkId='conditionId').answer.value"
            }
          ]
        }
      ],
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      _text: {
        extension: [
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
            valueBoolean: true
          }
        ]
      },
      type: 'group',
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.id'
              }
            }
          ],
          linkId: 'conditionId',
          type: 'string'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'autocomplete'
                  }
                ]
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width',
              valueQuantity: {
                value: 40,
                system: 'http://unitsofmeasure.org',
                code: '%'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ConditionRepeat.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
              }
            }
          ],
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          type: 'open-choice',
          readOnly: true,
          answerValueSet: '#clinical-condition-1'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'drop-down'
                  }
                ]
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.clinicalStatus.coding'
              }
            }
          ],
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          type: 'choice',
          answerValueSet: '#condition-clinical'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.clinicalStatus.coding'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            }
          ],
          linkId: 'medicalhistory-status-hidden',
          type: 'choice',
          answerValueSet: '#condition-clinical'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.onset.ofType(dateTime).toDate()'
              }
            }
          ],
          linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
          text: 'Onset date',
          type: 'date',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.abatement.ofType(dateTime).toDate()'
              }
            }
          ],
          linkId: 'e4524654-f6de-4717-b288-34919394d46b',
          text: 'Abatement date',
          type: 'date'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.abatement.ofType(dateTime).toDate()'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            }
          ],
          linkId: 'medicalhistory-abatementdate-hidden',
          type: 'date'
        }
      ]
    }
  ]
};

export const qrGroupHideAddItemButton: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      item: [
        {
          linkId: 'conditionId',
          answer: [
            {
              valueString: 'ckd-pat-sf'
            }
          ]
        },
        {
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          answer: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '700379002',
                display: 'Chronic kidney disease stage 3B (disorder)'
              }
            }
          ]
        },
        {
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            }
          ]
        },
        {
          linkId: 'medicalhistory-status-hidden',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      item: [
        {
          linkId: 'conditionId',
          answer: [
            {
              valueString: 'coronary-syndrome-pat-sf'
            }
          ]
        },
        {
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          answer: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '394659003',
                display: 'Acute coronary syndrome'
              }
            }
          ]
        },
        {
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            }
          ]
        },
        {
          linkId: 'medicalhistory-status-hidden',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      item: [
        {
          linkId: 'conditionId',
          answer: [
            {
              valueString: 'diabetes-pat-sf'
            }
          ]
        },
        {
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          answer: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '44054006',
                display: 'Type 2 diabetes mellitus'
              }
            }
          ]
        },
        {
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            }
          ]
        },
        {
          linkId: 'medicalhistory-status-hidden',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
                display: 'Active'
              }
            }
          ]
        },
        {
          linkId: 'e4524654-f6de-4717-b288-34919394d46b',
          text: 'Abatement date',
          answer: [
            {
              valueDate: '2025-06-30'
            }
          ]
        },
        {
          linkId: 'medicalhistory-abatementdate-hidden',
          answer: [
            {
              valueDate: '2025-06-30'
            }
          ]
        }
      ]
    },
    {
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      item: [
        {
          linkId: 'conditionId',
          answer: [
            {
              valueString: 'fever-pat-sf'
            }
          ]
        },
        {
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          answer: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '63993003',
                display: 'Remittent fever'
              }
            }
          ]
        },
        {
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            }
          ]
        },
        {
          linkId: 'medicalhistory-status-hidden',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            }
          ]
        },
        {
          linkId: 'e4524654-f6de-4717-b288-34919394d46b',
          text: 'Abatement date',
          answer: [
            {
              valueDate: '2025-08-15'
            }
          ]
        },
        {
          linkId: 'medicalhistory-abatementdate-hidden',
          answer: [
            {
              valueDate: '2025-08-15'
            }
          ]
        }
      ]
    },
    {
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      item: [
        {
          linkId: 'conditionId',
          answer: [
            {
              valueString: 'uti-pat-sf'
            }
          ]
        },
        {
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          answer: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '68566005',
                display: 'Urinary tract infection'
              }
            }
          ]
        },
        {
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            }
          ]
        },
        {
          linkId: 'medicalhistory-status-hidden',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            }
          ]
        },
        {
          linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
          text: 'Onset date',
          answer: [
            {
              valueDate: '2020-05-10'
            }
          ]
        },
        {
          linkId: 'e4524654-f6de-4717-b288-34919394d46b',
          text: 'Abatement date',
          answer: [
            {
              valueDate: '2025-08-15'
            }
          ]
        },
        {
          linkId: 'medicalhistory-abatementdate-hidden',
          answer: [
            {
              valueDate: '2025-08-15'
            }
          ]
        }
      ]
    }
  ]
};

export const qInitialExpressionRepopulatable: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form.'
        }
      ]
    }
  ],
  item: [
    {
      linkId: 'height-weight-group',
      text: 'Height and Weight',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyHeight.entry.resource.value.value'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ],
          linkId: 'height-latestresult',
          text: 'Height',
          type: 'string',
          repeats: false,
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyWeight.entry.resource.value.value'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ],
          linkId: 'weight-latestresult',
          text: 'Weight',
          type: 'string',
          repeats: false,
          readOnly: true
        }
      ]
    }
  ]
};

export const qQuestionnaireItemTextAriaLabelExpression: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'aria-note',
      text: 'This extension allows setting of custom ARIA labels for item.text via the usage of custom extension https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextAriaLabelExpression. It works on all item labels, display items and tab buttons.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b><div>This extension allows setting of custom ARIA labels for item.text via the usage of custom extension https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextAriaLabelExpression.</div><br/><div>It works on all item labels, display items and tab buttons.</div></b>\r\n</div>'
          }
        ]
      },
      type: 'display',
      repeats: false
    },
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
          linkId: 'tab-about-health-check',
          text: 'About the health check',
          _text: {
            extension: [
              {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextAriaLabelExpression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: "'Section 1: About the health check'"
                }
              }
            ]
          },
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'health-check-eligible',
              text: 'Eligible for health check',
              type: 'boolean',
              repeats: false
            },
            {
              linkId: 'health-check-in-progress',
              text: 'Health check already in progress?',
              type: 'boolean',
              repeats: false
            },
            {
              linkId: 'health-check-last-completed',
              text: 'Date of last completed health check',
              type: 'date',
              repeats: false
            },
            {
              linkId: 'health-check-this-commenced',
              text: 'Date and time this health check commenced',
              type: 'dateTime',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Current priorities'
            }
          ],
          linkId: 'tab-current-priorities',
          text: 'Current health/patient priorities',
          _text: {
            extension: [
              {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextAriaLabelExpression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: "'Section 2: Current health and patient priorities'"
                }
              }
            ]
          },
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
                  valueString: 'Enter details'
                }
              ],
              linkId: 'current-priorities-important-things',
              text: 'What are the important things for you in this health check today?',
              type: 'text',
              repeats: false
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
                  valueString: 'Enter details'
                }
              ],
              linkId: 'current-priorities-worried-things',
              text: 'Is there anything you are worried about?',
              type: 'text',
              repeats: false
            }
          ]
        }
      ]
    }
  ]
};
