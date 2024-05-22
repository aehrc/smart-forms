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

export const qValidateTester: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ValidateTester',
  name: 'ValidateTester',
  title: 'Validate Tester',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/validate',
  item: [
    {
      linkId: 'required',
      text: 'Required',
      type: 'boolean',
      repeats: false,
      required: true
    },
    {
      linkId: 'maxlength',
      text: 'Max Length (10)',
      type: 'string',
      repeats: false,
      maxLength: 10
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minLength',
          valueInteger: 10
        }
      ],
      linkId: 'minlength',
      text: 'Min Length (10)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: "matches('^[0-9]{4}$')"
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
          valueString: '####'
        }
      ],
      linkId: 'regex',
      text: 'Regex (####)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 65
        }
      ],
      linkId: 'maxvalue',
      text: 'Max Value (<=65)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 18
        }
      ],
      linkId: 'minvalue',
      text: 'Min Value (>=18)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',
          valueInteger: 2
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'kg',
            display: 'kg'
          }
        }
      ],
      linkId: 'maxdecimalplaces',
      text: 'Max Decimal Places (2)',
      type: 'decimal',
      repeats: false
    }
  ]
};
