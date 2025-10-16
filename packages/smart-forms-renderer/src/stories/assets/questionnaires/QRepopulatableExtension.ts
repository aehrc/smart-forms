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

export const qRepopulatableExtension: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    }
  ],
  item: [
    {
      linkId: 'instructions',
      type: 'display',
      text: 'This form demonstrates the questionnaire-initialExpression-repopulatable extension. Fields with this extension will show a sync button that allows manual repopulation of individual fields.'
    },
    {
      linkId: 'patient-info',
      type: 'group',
      text: 'Patient Information',
      item: [
        {
          linkId: 'patient-name',
          type: 'string',
          text: 'Patient Name',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%patient.name.first().given.first() + " " + %patient.name.first().family'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ]
        },
        {
          linkId: 'patient-age',
          type: 'integer',
          text: 'Patient Age',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '(2025 - %patient.birthDate.toString().substring(0,4).toInteger()).toString()'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ]
        },
        {
          linkId: 'patient-gender',
          type: 'choice',
          text: 'Patient Gender',
          answerOption: [
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/administrative-gender',
                code: 'male',
                display: 'Male'
              }
            },
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/administrative-gender',
                code: 'female',
                display: 'Female'
              }
            },
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/administrative-gender',
                code: 'other',
                display: 'Other'
              }
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.gender'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ]
        }
      ]
    },
    {
      linkId: 'medical-info',
      type: 'group',
      text: 'Medical Information',
      item: [
        {
          linkId: 'bmi',
          type: 'decimal',
          text: 'BMI (Body Mass Index)',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '22.5'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ]
        },
        {
          linkId: 'blood-pressure',
          type: 'string',
          text: 'Blood Pressure',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '"120/80"'
              }
            },
            {
              url: 'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable',
              valueCode: 'manual'
            }
          ]
        },
        {
          linkId: 'normal-field',
          type: 'string',
          text: 'Normal Field (No Repopulation)',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '"This field has initial expression but no repopulate button"'
              }
            }
          ]
        }
      ]
    }
  ]
};
