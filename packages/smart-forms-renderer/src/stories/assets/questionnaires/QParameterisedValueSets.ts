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
  id: 'ParameterisedValueSetBasic',
  name: 'ParameterisedValueSetBasic',
  title: 'Parameterised ValueSet Basic - States',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-03-01',
  url: 'https://smartforms.csiro.au/docs/pvs/basic',
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
      linkId: 'stateCode',
      text: 'State',
      answerValueSet: 'https://example.com/limited-states',
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
                url: 'value',
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
                "'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&p-country=' + %resource.item.where(linkId = 'countryCode').answer.value.code"
            }
          }
        ]
      },
      text: 'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states'
    }
  ]
};

export const qParameterisedValueSetMultiple: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ParameterisedValueSetMultiple',
  name: 'ParameterisedValueSetMultiple',
  title: 'Parameterised ValueSet Multiple Params - States',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-03-01',
  url: 'https://smartforms.csiro.au/docs/pvs/multiple',
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
      linkId: 'stateCode',
      text: 'State',
      answerValueSet: 'https://example.com/limited-states',
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
                url: 'value',
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
                url: 'value',
                valueBoolean: true
              }
            ]
          }
        ]
      }
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
                "'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&p-country=' + %resource.item.where(linkId = 'countryCode').answer.value.code + '&includeDefinition=true'"
            }
          }
        ]
      },
      text: 'State GET request url: https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://example.com/limited-states&includeDefinition=true'
    }
  ]
};
