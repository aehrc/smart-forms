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

export const qDateTimeBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DateTimeBasic',
  name: 'DateTimeBasic',
  title: 'DateTime Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/datetime/basic',
  item: [
    {
      linkId: 'dob',
      type: 'dateTime',
      repeats: false,
      text: 'Datetime of birth'
    }
  ]
};

export const qrDateTimeBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'dob',
      text: 'Date of birth',
      answer: [
        {
          valueDateTime: '1990-01-01T00:53:00Z'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/datetime/basic'
};

export const qDateTimeCalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DateTimeCalculation',
  name: 'DateTimeCalculation',
  title: 'DateTime Calculation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/datetime/calculation',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'datetime',
        language: 'text/fhirpath',
        expression: "item.where(linkId = 'datetime-controller').answer.valueString"
      }
    }
  ],
  item: [
    {
      linkId: 'datetime-instruction',
      text: 'Enter a date/datetime in one of the supported formats:',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n  <div>\r\n    <table style="border-collapse: collapse; empty-cells: hide;">\r\n      <thead style="background-color: #f3f4f6; font-weight: 600;">\r\n        <tr>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Supported DateTime Formats <a href="https://www.hl7.org/fhir/datatypes.html#dateTime" target="_blank" rel="noreferrer">https://www.hl7.org/fhir/datatypes.html#dateTime</a></th>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Example</th>\r\n        </tr>\r\n      </thead>\r\n      <tbody>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM-DD</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09-19</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM-DDTHH:mm:ssZ</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09-19T14:30:00 (without TZ)<br>2025-09-19T14:30:00+1000 (with TZ)</td></tr>\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: 'datetime-controller',
      text: 'DateTime (String)',
      type: 'string'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%datetime'
          }
        }
      ],
      linkId: 'calculated-datetime',
      text: 'Calculated DateTime (DateTime)',
      type: 'dateTime',
      readOnly: true
    }
  ]
};
