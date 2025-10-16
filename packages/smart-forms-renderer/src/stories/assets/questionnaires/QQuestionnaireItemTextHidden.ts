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

export const qQuestionnaireItemTextHidden: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'patient-details',
      type: 'group',
      text: 'Patient Details',
      item: [
        {
          linkId: 'name',
          type: 'string',
          text: 'Full Name',
          required: true
        },
        {
          linkId: 'age',
          type: 'integer',
          text: 'Age',
          required: true
        },
        {
          linkId: 'hidden-field',
          type: 'string',
          text: 'This field should be hidden from the UI',
          _text: {
            extension: [
              {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                valueBoolean: true
              }
            ]
          }
        },
        {
          linkId: 'visible-field',
          type: 'string',
          text: 'This field should be visible',
          _text: {
            extension: [
              {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                valueBoolean: false
              }
            ]
          }
        },
        {
          linkId: 'normal-field',
          type: 'string',
          text: 'This field has no extension (should be visible)'
        }
      ]
    },
    {
      linkId: 'medical-history',
      type: 'group',
      text: 'Medical History',
      item: [
        {
          linkId: 'conditions',
          type: 'text',
          text: 'List any medical conditions'
        },
        {
          linkId: 'hidden-note',
          type: 'text',
          text: 'Internal note - should not be visible to user',
          _text: {
            extension: [
              {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                valueBoolean: true
              }
            ]
          }
        }
      ]
    }
  ]
};
