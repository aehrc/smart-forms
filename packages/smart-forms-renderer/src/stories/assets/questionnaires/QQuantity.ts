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

export const qQuantityBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QuantityBasic',
  name: 'QuantityBasic',
  title: 'Quantity Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/quantity/basic',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kg' }
        }
      ],
      linkId: 'body-weight',
      type: 'quantity',
      repeats: false,
      text: 'Body Weight'
    }
  ]
};

export const qQuantityUnitOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QuantityUnitOption',
  name: 'QuantityUnitOption',
  title: 'Quantity UnitOption',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-07-27',
  item: [
    {
      linkId: 'duration',
      text: 'Duration',
      type: 'quantity',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'd',
            display: 'Day(s)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'wk',
            display: 'Week(s)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'mo',
            display: 'Month(s)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'a',
            display: 'Year(s)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 's',
            display: 'Second(s)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'min',
            display: 'Minute(s)'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'hour',
            display: 'Hour(s)'
          }
        }
      ]
    }
  ]
};
