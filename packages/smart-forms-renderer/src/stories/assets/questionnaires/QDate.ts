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

export const qDateBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DateBasic',
  name: 'DateBasic',
  title: 'Date Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/date/basic',
  item: [
    {
      linkId: 'dob',
      type: 'date',
      repeats: false,
      text: 'Date of birth'
    }
  ]
};

export const qrDateBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'dob',
      text: 'Date of birth',
      answer: [
        {
          valueDate: '1990-01-01'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/date/basic'
};
