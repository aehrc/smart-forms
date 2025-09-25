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

export const qAnswerOptionToggleExpressionsBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AnswerOptionToggleExpressionsBasic',
  name: 'AnswerOptionToggleExpressionsBasic',
  title: 'Answer Option Toggle Expressions - Basic Example',
  version: '1.0.0-alpha.50',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-04-29',
  url: 'https://smartforms.csiro.au/docs/sdc/answer-option-toggle-expressions/basic',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'hasSelectedYes',
        language: 'text/fhirpath',
        expression: "%resource.item.where(linkId='has-symptoms').answer.value.code = 'yes'"
      }
    }
  ],
  item: [
    {
      linkId: 'has-symptoms',
      text: 'Do you have any symptoms?',
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
      linkId: 'symptom-details',
      text: 'Please describe your symptoms',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'fever',
            display: 'Fever'
          }
        },
        {
          valueCoding: {
            code: 'cough',
            display: 'Cough'
          }
        },
        {
          valueCoding: {
            code: 'headache',
            display: 'Headache'
          }
        },
        {
          valueCoding: {
            code: 'fatigue',
            display: 'Fatigue'
          }
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'fever',
                display: 'Fever'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasSelectedYes'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'cough',
                display: 'Cough'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasSelectedYes'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'headache',
                display: 'Headache'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasSelectedYes'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'fatigue',
                display: 'Fatigue'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasSelectedYes'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const qAnswerOptionToggleExpressionsMultipleControls: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AnswerOptionToggleExpressionsMultipleControls',
  name: 'AnswerOptionToggleExpressionsMultipleControls',
  title: 'Answer Option Toggle Expressions - Multiple Controls',
  version: '1.0.0-alpha.50',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-04-29',
  url: 'https://smartforms.csiro.au/docs/sdc/answer-option-toggle-expressions/multiple-controls',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'isAdult',
        language: 'text/fhirpath',
        expression: "%resource.item.where(linkId='age').answer.value >= 18"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'hasInsurance',
        language: 'text/fhirpath',
        expression: "%resource.item.where(linkId='insurance-status').answer.value.code = 'yes'"
      }
    }
  ],
  item: [
    {
      linkId: 'age',
      text: 'What is your age?',
      type: 'integer',
      required: true
    },
    {
      linkId: 'insurance-status',
      text: 'Do you have health insurance?',
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
      linkId: 'adult-services',
      text: 'Adult Services (Dropdown)',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'counseling',
            display: 'Counseling Services'
          }
        },
        {
          valueCoding: {
            code: 'therapy',
            display: 'Therapy Services'
          }
        },
        {
          valueCoding: {
            code: 'support-group',
            display: 'Support Group'
          }
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'drop-down',
                display: 'Drop down'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'counseling',
                display: 'Counseling Services'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isAdult'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'therapy',
                display: 'Therapy Services'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isAdult'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'support-group',
                display: 'Support Group'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isAdult'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'insurance-covered-services',
      text: 'Insurance Covered Services (Checkbox)',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'preventive-care',
            display: 'Preventive Care'
          }
        },
        {
          valueCoding: {
            code: 'emergency-care',
            display: 'Emergency Care'
          }
        },
        {
          valueCoding: {
            code: 'specialist-visit',
            display: 'Specialist Visit'
          }
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'check-box'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'preventive-care',
                display: 'Preventive Care'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasInsurance'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'emergency-care',
                display: 'Emergency Care'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasInsurance'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'specialist-visit',
                display: 'Specialist Visit'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasInsurance'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'priority-services',
      text: 'Priority Services (Radio)',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'urgent',
            display: 'Urgent Care'
          }
        },
        {
          valueCoding: {
            code: 'routine',
            display: 'Routine Care'
          }
        },
        {
          valueCoding: {
            code: 'follow-up',
            display: 'Follow-up Care'
          }
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'urgent',
                display: 'Urgent Care'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasInsurance'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'routine',
                display: 'Routine Care'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasInsurance'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                code: 'follow-up',
                display: 'Follow-up Care'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%hasInsurance'
              }
            }
          ]
        }
      ]
    }
  ]
};
