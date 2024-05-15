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

export const qTextBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TextBasic',
  name: 'TextBasic',
  title: 'Text Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/text/basic',
  item: [
    {
      linkId: 'details',
      type: 'text',
      repeats: false,
      text: 'Details of intermittent fasting'
    }
  ]
};

export const qrTextBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'details',
      text: 'Details of intermittent fasting',
      answer: [
        {
          valueString:
            '- 8 hour eating window\n- Cup of black coffee in the morning\n- Small portions of lunch and dinner'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/text/basic'
};

export const qTextCalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TextCalculation',
  name: 'TextCalculation',
  title: 'Text Calculation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/text/calculation',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'earHealthDetails',
        language: 'text/fhirpath',
        expression:
          "item.where(linkId = 'ear-health-group').item.where(linkId = 'ear-health-details').answer.value"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'medicationDetails',
        language: 'text/fhirpath',
        expression:
          "item.where(linkId = 'medications-group').item.where(linkId = 'medications-details').answer.value"
      }
    }
  ],
  item: [
    {
      linkId: 'ear-health-group',
      text: 'Ear Health',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'ear-health-other',
          text: '... (other questions)',
          type: 'display',
          readOnly: false
        },
        {
          linkId: 'ear-health-details',
          text: 'Details',
          type: 'text',
          readOnly: false
        }
      ]
    },
    {
      linkId: 'medications-group',
      text: 'Medications',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'medications-other',
          text: '... (other questions)',
          type: 'display',
          readOnly: false
        },
        {
          linkId: 'medications-details',
          text: 'Details',
          type: 'text',
          readOnly: false
        }
      ]
    },
    {
      linkId: 'summaries-group',
      text: 'Health Check Summaries',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%earHealthDetails'
              }
            }
          ],
          linkId: 'ear-health-summary',
          text: 'Ear Health',
          type: 'text',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%medicationDetails'
              }
            }
          ],
          linkId: 'medication-summary',
          text: 'Medications',
          type: 'text',
          readOnly: true
        }
      ]
    }
  ]
};
