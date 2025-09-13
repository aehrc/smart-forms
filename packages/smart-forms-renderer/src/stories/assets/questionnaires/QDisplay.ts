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

export const qDisplayBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DisplayBasic',
  name: 'DisplayBasic',
  title: 'Display Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/display/basic',
  item: [
    {
      linkId: 'information-display',
      type: 'display',
      repeats: false,
      text: 'You can use the display item to show information to the user.'
    }
  ]
};

export const qDisplayCalculationStyled: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DisplayCalculationStyled',
  name: 'DisplayCalculationStyled',
  title: 'Display Calculation Styled',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/display/calculation-styled',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'gender',
        language: 'text/fhirpath',
        expression: "item.where(linkId = 'gender-controller').answer.valueCoding.code"
      }
    }
  ],
  item: [
    {
      linkId: 'gender-controller',
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        }
      ]
    },
    {
      linkId: 'gender-display',
      type: 'display',
      repeats: false,
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: "'Gender: '+ %gender"
            }
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
            valueString:
              'padding: 0.75rem; margin-bottom: 1rem; font-size: 0.875rem; color: #2E7D32; border-radius: 0.5rem; background-color: #d5e5d6; font-weight: 700;'
          }
        ]
      },
      text: ''
    }
  ]
};
