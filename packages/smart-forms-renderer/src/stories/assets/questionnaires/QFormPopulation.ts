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

export const qInitialExpressionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'InitialExpressionBasic',
  name: 'InitialExpressionBasic',
  title: 'Initial Expression Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-15',
  url: 'https://smartforms.csiro.au/docs/sdc/population/initial-expression-1',
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
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              'iif(today().toString().select(substring(5,2) & substring(8,2)).toInteger() > %patient.birthDate.toString().select(substring(5,2) & substring(8,2)).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger() - 1)'
          }
        }
      ],
      linkId: 'e2a16e4d-2765-4b61-b286-82cfc6356b30',
      text: 'Age',
      type: 'integer',
      repeats: false,
      readOnly: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%patient.gender = 'female'"
          }
        }
      ],
      linkId: 'gender-female',
      text: 'Gender Is female',
      type: 'boolean',
      repeats: false,
      readOnly: false
    }
  ]
};

export const qCalculatedExpressionBMICalculator: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CalculatedExpressionPrepop',
  name: 'CalculatedExpressionPrepop',
  title: 'CalculatedExpression - Pre-population',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTobaccoSmokingStatus',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=72166-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBMI',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=39156-5&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsHeadCircumference',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=9843-4&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsWaistCircumference',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8280-0&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBloodPressure',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=85354-9&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsHeartRate',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8867-4&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTotalCholesterol',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=14647-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsHDLCholesterol',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=14646-4&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
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
  url: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression',
  item: [
    {
      linkId: 'bmi-calculation',
      text: 'BMI Calculation',
      type: 'group',
      repeats: false,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'height',
            language: 'text/fhirpath',
            expression: "item.where(linkId='patient-height').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'weight',
            language: 'text/fhirpath',
            expression: "item.where(linkId='patient-weight').answer.value"
          }
        }
      ],
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyHeight.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'cm',
                display: 'cm'
              }
            }
          ],
          linkId: 'patient-height',
          text: 'Height',
          type: 'decimal',
          repeats: false,
          readOnly: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyWeight.entry.resource.value.value'
              }
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
          linkId: 'patient-weight',
          text: 'Weight',
          type: 'decimal',
          repeats: false,
          readOnly: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                description: 'BMI calculation',
                language: 'text/fhirpath',
                expression: '(%weight/((%height/100).power(2))).round(1)'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'kg/m2',
                display: 'kg/m2'
              }
            }
          ],
          linkId: 'bmi-result',
          text: 'Value',
          type: 'decimal',
          repeats: false,
          readOnly: true
        }
      ]
    }
  ]
};
