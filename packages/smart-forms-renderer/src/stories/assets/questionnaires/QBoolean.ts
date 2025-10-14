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

export const qrBooleanBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'eaten',
      text: 'Have you eaten yet?',
      answer: [
        {
          valueBoolean: true
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/boolean/basic'
};

export const qBooleanCheckbox: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BooleanCheckbox',
  name: 'BooleanCheckbox',
  title: 'Boolean Checkbox',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/boolean/checkbox',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'check-box'
              }
            ]
          }
        }
      ],
      linkId: 'eaten',
      type: 'boolean',
      repeats: false,
      text: 'Have you eaten yet?'
    }
  ]
};

export const qrBooleanCheckboxResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'eaten',
      text: 'Have you eaten yet?',
      answer: [
        {
          valueBoolean: true
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/boolean/checkbox'
};
