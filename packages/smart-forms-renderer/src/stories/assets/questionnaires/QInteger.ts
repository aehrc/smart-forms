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

import type { Questionnaire } from 'fhir/r4';
import type { QuestionnaireResponse } from 'fhir/r4';

export const qIntegerBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'IntegerBasic',
  name: 'IntegerBasic',
  title: 'Integer Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/integer/basic',
  item: [
    {
      linkId: 'age',
      type: 'integer',
      repeats: false,
      text: 'Age'
    }
  ]
};

export const qrIntegerBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'age',
      text: 'Age',
      answer: [
        {
          valueInteger: 40
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/integer/basic'
};

export const qIntegerCalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'IntegerCalculation',
  name: 'IntegerCalculation',
  title: 'Integer Calculation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/integer/calculation',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'length',
        language: 'text/fhirpath',
        expression: "item.where(linkId = 'length-controller').answer.value"
      }
    }
  ],
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
      linkId: 'length-controller',
      text: 'Length (cm)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%length.power(2)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'cm2',
            display: 'cm^2'
          }
        }
      ],
      linkId: 'length-squared',
      text: 'Length squared (cm^2)',
      type: 'integer',
      readOnly: true
    }
  ]
};
