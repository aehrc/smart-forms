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

export const qTargetConstraintBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TargetConstraintBasic',
  name: 'TargetConstraintBasic',
  title: 'Target Constraint - Basic Example',
  version: '1.0.0-alpha.22',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/target-constraint/basic',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'age-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'age').answer.valueInteger >= 18"
          }
        },
        {
          url: 'human',
          valueString: 'Age must be 18 or older to proceed'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='age')"
        }
      ]
    }
  ],
  item: [
    {
      linkId: 'age',
      text: 'What is your age?',
      type: 'integer',
      required: true
    }
  ]
};

export const qTargetConstraintComplex: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TargetConstraintComplex',
  name: 'TargetConstraintComplex',
  title: 'Target Constraint - Complex Example',
  version: '1.0.0-alpha.22',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/target-constraint/complex',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'height-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'height').answer.valueDecimal > 0"
          }
        },
        {
          url: 'human',
          valueString: 'Height must be greater than 0'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='height')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'weight-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'weight').answer.valueDecimal > 0"
          }
        },
        {
          url: 'human',
          valueString: 'Weight must be greater than 0'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='weight')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'bmi-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'bmi').answer.valueDecimal >= 18.5"
          }
        },
        {
          url: 'human',
          valueString: 'BMI must be at least 18.5'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='bmi')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'bmi-max-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'bmi').answer.valueDecimal <= 24.9"
          }
        },
        {
          url: 'human',
          valueString: 'BMI must be at most 24.9'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='bmi')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'systolic-positive-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'systolic').answer.valueInteger > 0"
          }
        },
        {
          url: 'human',
          valueString: 'Systolic blood pressure must be greater than 0'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='systolic')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'diastolic-positive-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'diastolic').answer.valueInteger > 0"
          }
        },
        {
          url: 'human',
          valueString: 'Diastolic blood pressure must be greater than 0'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='diastolic')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'blood-pressure-validation'
        },
        {
          url: 'severity',
          valueCode: 'warning'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "%resource.item.where(linkId = 'systolic').answer.valueInteger <= 120"
          }
        },
        {
          url: 'human',
          valueString:
            'Blood pressure readings suggest elevated levels. Please consult with a healthcare provider.'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='systolic')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'phone-format-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              "%resource.item.where(linkId = 'phone').answer.valueString.matches('^\\\\+[0-9]+$')"
          }
        },
        {
          url: 'human',
          valueString: 'Phone number must be in international format (e.g., +1234567890)'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='phone')"
        }
      ]
    }
  ],
  item: [
    {
      linkId: 'height',
      text: 'Height (cm)',
      type: 'decimal',
      required: true
    },
    {
      linkId: 'weight',
      text: 'Weight (kg)',
      type: 'decimal',
      required: true
    },
    {
      linkId: 'bmi',
      text: 'BMI (calculated)',
      type: 'decimal',
      required: true
    },
    {
      linkId: 'systolic',
      text: 'Systolic Blood Pressure (mmHg)',
      type: 'integer',
      required: true
    },
    {
      linkId: 'diastolic',
      text: 'Diastolic Blood Pressure (mmHg)',
      type: 'integer',
      required: true
    },
    {
      linkId: 'phone',
      text: 'Phone Number',
      type: 'string',
      required: true
    }
  ]
};

export const qTargetConstraintConditional: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TargetConstraintConditional',
  name: 'TargetConstraintConditional',
  title: 'Target Constraint - Conditional Example',
  version: '1.0.0-alpha.22',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-21',
  url: 'https://smartforms.csiro.au/docs/sdc/target-constraint/conditional',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'pregnancy-weight-validation'
        },
        {
          url: 'severity',
          valueCode: 'warning'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              "%resource.item.where(linkId = 'pregnant').answer.valueCoding.code = 'yes' implies %resource.item.where(linkId = 'weight').answer.valueDecimal >= 45"
          }
        },
        {
          url: 'human',
          valueString: 'Pregnant patients should have a minimum weight of 45kg for safety'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='weight')"
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
      extension: [
        {
          url: 'key',
          valueId: 'diabetes-hba1c-validation'
        },
        {
          url: 'severity',
          valueCode: 'error'
        },
        {
          url: 'expression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              "%resource.item.where(linkId = 'diabetes').answer.valueCoding.code = 'yes' implies %resource.item.where(linkId = 'hba1c').exists() and %resource.item.where(linkId = 'hba1c').answer.valueString.length() > 0 and %resource.item.where(linkId = 'hba1c').answer.valueString != '0'"
          }
        },
        {
          url: 'human',
          valueString: 'HbA1c level is required for diabetic patients'
        },
        {
          url: 'location',
          valueString: "item.where(linkId='hba1c')"
        }
      ]
    }
  ],
  item: [
    {
      linkId: 'pregnant',
      text: 'Are you currently pregnant?',
      type: 'choice',
      required: true,
      answerOption: [
        {
          valueCoding: {
            code: 'yes',
            display: 'Yes'
          }
        },
        {
          valueCoding: {
            code: 'no',
            display: 'No'
          }
        }
      ]
    },
    {
      linkId: 'weight',
      text: 'Current weight (kg)',
      type: 'decimal',
      required: true
    },
    {
      linkId: 'diabetes',
      text: 'Do you have diabetes?',
      type: 'choice',
      required: true,
      answerOption: [
        {
          valueCoding: {
            code: 'yes',
            display: 'Yes'
          }
        },
        {
          valueCoding: {
            code: 'no',
            display: 'No'
          }
        }
      ]
    },
    {
      linkId: 'hba1c',
      text: 'HbA1c level (%)',
      type: 'string',
      required: false
    }
  ]
};
