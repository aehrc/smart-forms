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

import type { Questionnaire } from 'fhir/r4';

export const qParameterisedValueSetBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button',
                display: 'Radio Button'
              }
            ]
          }
        }
      ],
      linkId: 'countryCode',
      text: 'Country',
      answerValueSet: 'http://example.com/countries/vs'
    },
    {
      linkId: 'requestDisplay',
      type: 'display',
      repeats: false,
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://example.com/limited-states/vs&p-country=' + %resource.item.where(linkId = 'countryCode').answer.value.code"
            }
          }
        ]
      },
      text: 'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://example.com/limited-states/vs'
    },
    {
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'drop-down',
                display: 'Drop down'
              }
            ]
          }
        }
      ],
      linkId: 'stateCodeDropdown',
      text: 'State (Dropdown)',
      answerValueSet: 'http://example.com/limited-states/vs',
      _answerValueSet: {
        // Mimics GET request of https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&p-country={country_value}
        extension: [
          {
            url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
            extension: [
              {
                url: 'name',
                valueString: 'p-country'
              },
              {
                url: 'expression',
                valueExpression: {
                  expression: "%resource.item.where(linkId = 'countryCode').answer.value.code",
                  language: 'text/fhirpath'
                }
              }
            ]
          }
        ]
      }
    },
    {
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button',
                display: 'Radio'
              }
            ]
          }
        }
      ],
      linkId: 'stateCodeRadio',
      text: 'State (Radio)',
      answerValueSet: 'http://example.com/limited-states/vs',
      _answerValueSet: {
        // Mimics GET request of https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&p-country={country_value}
        extension: [
          {
            url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
            extension: [
              {
                url: 'name',
                valueString: 'p-country'
              },
              {
                url: 'expression',
                valueExpression: {
                  expression: "%resource.item.where(linkId = 'countryCode').answer.value.code",
                  language: 'text/fhirpath'
                }
              }
            ]
          }
        ]
      }
    }
  ]
};

export const qParameterisedValueSetMultiple: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button',
                display: 'Radio Button'
              }
            ]
          }
        }
      ],
      linkId: 'countryCode',
      text: 'Country',
      answerValueSet: 'http://example.com/countries/vs'
    },
    {
      linkId: 'requestDisplay',
      type: 'display',
      repeats: false,
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://example.com/limited-states/vs&p-country=' + %resource.item.where(linkId = 'countryCode').answer.value.code + '&includeDefinition=true'"
            }
          }
        ]
      },
      text: 'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://example.com/limited-states/vs&includeDefinition=true'
    },
    {
      linkId: 'note-multiple-params',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>This example also includes a second fixed <strong>includeDefinition</strong> parameter set to true.</p></div>'
          }
        ]
      },
      text: 'This example also includes a second fixed includeDefinition parameter set to true.',
      type: 'display',
      repeats: false
    },
    {
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'drop-down',
                display: 'Drop down'
              }
            ]
          }
        }
      ],
      linkId: 'stateCodeDropdown',
      text: 'State (drop down)',
      answerValueSet: 'http://example.com/limited-states/vs',
      _answerValueSet: {
        // Mimics GET request of https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&p-country={country_value}
        extension: [
          {
            url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
            extension: [
              {
                url: 'name',
                valueString: 'p-country'
              },
              {
                url: 'expression',
                valueExpression: {
                  expression: "%resource.item.where(linkId = 'countryCode').answer.value.code",
                  language: 'text/fhirpath'
                }
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
            extension: [
              {
                url: 'name',
                valueString: 'includeDefinition'
              },
              {
                url: 'expression',
                valueString: 'true'
              }
            ]
          }
        ]
      }
    },
    {
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button',
                display: 'Radio'
              }
            ]
          }
        }
      ],
      linkId: 'stateCodeRadio',
      text: 'State (Radio)',
      answerValueSet: 'http://example.com/limited-states/vs',
      _answerValueSet: {
        // Mimics GET request of https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&p-country={country_value}
        extension: [
          {
            url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
            extension: [
              {
                url: 'name',
                valueString: 'p-country'
              },
              {
                url: 'expression',
                valueExpression: {
                  expression: "%resource.item.where(linkId = 'countryCode').answer.value.code",
                  language: 'text/fhirpath'
                }
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/tools/StructureDefinition/binding-parameter',
            extension: [
              {
                url: 'name',
                valueString: 'includeDefinition'
              },
              {
                url: 'expression',
                valueString: 'true'
              }
            ]
          }
        ]
      }
    }
  ]
};
