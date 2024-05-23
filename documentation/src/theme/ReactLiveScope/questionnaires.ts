/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { Questionnaire } from 'fhir/r4';

export const qItemControlDisplayContextDisplay: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlDisplayContextDisplay',
  name: 'ItemControlDisplayContextDisplay',
  title: 'Item Control Display Context Display',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-15',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-display-context-display',
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

export const qCalculatedExpressionBMICalculator: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CalculatedExpressionBMICalculator',
  name: 'CalculatedExpressionBMICalculator',
  title: 'Calculated Expression BMI Calculator',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/calculated-expression-1',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'height',
        language: 'text/fhirpath',
        expression: "item.where(linkId='patient-height').answer.value"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'weight',
        language: 'text/fhirpath',
        expression: "item.where(linkId='patient-weight').answer.value"
      }
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',
          valueInteger: 2
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'cm',
            display: 'cm'
          }
        }
      ],
      linkId: 'patient-height',
      text: 'Height',
      type: 'decimal',
      repeats: false,
      readOnly: false,
      required: true
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',
          valueInteger: 2
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'kg',
            display: 'kg'
          }
        }
      ],
      linkId: 'patient-weight',
      text: 'Weight',
      type: 'decimal',
      repeats: false,
      readOnly: false,
      required: true
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            description: 'BMI calculation',
            language: 'text/fhirpath',
            expression: '(%weight/((%height/100).power(2))).round(1)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'kg/m2',
            display: 'kg/m2'
          }
        }
      ],
      linkId: 'bmi-result',
      text: 'Value',
      type: 'decimal',
      repeats: false,
      readOnly: true
    }
  ]
};

export const qBooleanBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BooleanBasic',
  name: 'BooleanBasic',
  title: 'Boolean Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/boolean/basic',
  item: [
    {
      linkId: 'eaten',
      type: 'boolean',
      repeats: false,
      text: 'Have you eaten yet?'
    }
  ]
};

export const qChoiceAnswerValueSetBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerValueSetBasic',
  name: 'ChoiceAnswerValueSetBasic',
  title: 'Choice AnswerValueSet Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answervalueset-basic',
  item: [
    {
      linkId: 'gender',
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
    }
  ]
};
