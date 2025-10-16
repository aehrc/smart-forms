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

export const qCqfExpressionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'patient-greeting',
      type: 'display',
      text: 'Welcome to the form',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "'Hello, ' + %patient.name.first().given.first() + '! Welcome to your health assessment.'"
            }
          }
        ]
      }
    },
    {
      linkId: 'age-info',
      type: 'display',
      text: 'Age information will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "'Your age: ' + (2025 - %patient.birthDate.toString().substring(0,4).toInteger()).toString() + ' years old'"
            }
          }
        ]
      }
    },
    {
      linkId: 'bmi-input',
      type: 'decimal',
      text: 'Enter your BMI'
    },
    {
      linkId: 'bmi-category',
      type: 'display',
      text: 'BMI Category will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "iif(%resource.item.where(linkId='bmi-input').answer.exists(), iif(%resource.item.where(linkId='bmi-input').answer.first().valueDecimal < 18.5, 'Underweight - BMI: ' + %resource.item.where(linkId='bmi-input').answer.first().valueDecimal.toString(), iif(%resource.item.where(linkId='bmi-input').answer.first().valueDecimal < 25, 'Normal weight - BMI: ' + %resource.item.where(linkId='bmi-input').answer.first().valueDecimal.toString(), iif(%resource.item.where(linkId='bmi-input').answer.first().valueDecimal < 30, 'Overweight - BMI: ' + %resource.item.where(linkId='bmi-input').answer.first().valueDecimal.toString(), 'Obese - BMI: ' + %resource.item.where(linkId='bmi-input').answer.first().valueDecimal.toString()))), 'Please enter a BMI value above')"
            }
          }
        ]
      }
    },
    {
      linkId: 'gender-instructions',
      type: 'display',
      text: 'Gender-specific instructions will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "iif(%patient.gender = 'female', 'Please consider mammography screening.', iif(%patient.gender = 'male', 'Please consider prostate screening.', 'Please consult with your healthcare provider about appropriate screenings.'))"
            }
          }
        ]
      }
    }
  ]
};

export const qCqfExpressionAdvanced: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'patient-info',
      type: 'group',
      text: 'Patient Information',
      item: [
        {
          linkId: 'patient-name',
          type: 'string',
          text: 'Full Name'
        },
        {
          linkId: 'patient-age',
          type: 'integer',
          text: 'Age'
        },
        {
          linkId: 'patient-gender',
          type: 'choice',
          text: 'Gender',
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
            }
          ]
        }
      ]
    },
    {
      linkId: 'patient-summary',
      type: 'display',
      text: 'Patient Summary will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "'Patient Summary: ' + %patient.name.first().given.first() + ' ' + %patient.name.first().family + ', Age: ' + (2025 - %patient.birthDate.toString().substring(0,4).toInteger()).toString() + ', Gender: ' + %patient.gender"
            }
          }
        ]
      }
    },
    {
      linkId: 'form-inputs-summary',
      type: 'display',
      text: 'Form Data Summary will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "iif(%resource.item.where(linkId='patient-info').item.where(linkId='patient-name').answer.exists() and %resource.item.where(linkId='patient-info').item.where(linkId='patient-age').answer.exists() and %resource.item.where(linkId='patient-info').item.where(linkId='patient-gender').answer.exists(), 'Form Data: Name: ' + %resource.item.where(linkId='patient-info').item.where(linkId='patient-name').answer.first().valueString + ', Age: ' + %resource.item.where(linkId='patient-info').item.where(linkId='patient-age').answer.first().valueInteger.toString() + ', Gender: ' + %resource.item.where(linkId='patient-info').item.where(linkId='patient-gender').answer.first().valueCoding.display, 'Please complete the form fields above to see the summary')"
            }
          }
        ]
      }
    }
  ]
};
