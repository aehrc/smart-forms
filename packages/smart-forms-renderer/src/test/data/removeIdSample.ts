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

import type { QuestionnaireResponse } from 'fhir/r4';

export const qrRemoveIdSample: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://canshare.co.nz/questionnaire/myPatient1',
  item: [
    {
      linkId: 'myPatient1',
      text: 'myPatient1',
      item: [
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  id: 'myPatient1.name.first-repeat-000000',
                  valueString: '1st firstName 1.0'
                }
              ]
            }
          ]
        },
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  id: 'myPatient1.name.first-repeat-000000',
                  valueString: '2nd firstName 1.0'
                },
                {
                  id: 'myPatient1.name.first-repeat-O-r6YSxx81TBFf_yiHWk6',
                  valueString: '2nd firstName 2.0'
                },
                {
                  id: 'myPatient1.name.first-repeat-ZQR77gdy6utsT_JkbuHKc'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const qrRemoveIdResult: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://canshare.co.nz/questionnaire/myPatient1',
  item: [
    {
      linkId: 'myPatient1',
      text: 'myPatient1',
      item: [
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  valueString: '1st firstName 1.0'
                }
              ]
            }
          ]
        },
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  valueString: '2nd firstName 1.0'
                },
                {
                  valueString: '2nd firstName 2.0'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
