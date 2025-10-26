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

export const qTimeCalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'time',
        language: 'text/fhirpath',
        expression: "item.where(linkId = 'time-controller').answer.valueString"
      }
    }
  ],
  item: [
    {
      linkId: 'time-instruction',
      text: 'Enter a time in one of the supported formats:',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n  <div>\r\n    <table style="border-collapse: collapse; empty-cells: hide;">\r\n      <thead style="background-color: #f3f4f6; font-weight: 600;">\r\n        <tr>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Supported Time Format <a href="https://www.hl7.org/fhir/datatypes.html#time" target="_blank" rel="noreferrer">https://www.hl7.org/fhir/datatypes.html#time</a></th>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Example</th>\r\n        </tr>\r\n      </thead>\r\n      <tbody>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">hh:mm:ss</td><td style="padding: 8px; border: 1px solid #e5e7eb;">14:10:30</td></tr>\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: 'time-instruction-2',
      text: 'This example is mainly for demonstrating a valid time format. In a real-world environment seconds are usually omitted, however the FHIRPath expression should evaluate to the "hh:mm:ss" format.',
      type: 'display'
    },
    {
      linkId: 'time-controller',
      text: 'Time (String)',
      type: 'string'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%time'
          }
        }
      ],
      linkId: 'calculated-time',
      text: 'Calculated Time (Time)',
      type: 'time',
      readOnly: false
    }
  ]
};
