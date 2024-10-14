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

export const qInitialSingle: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'InitialSingle',
  name: 'InitialSingle',
  title: 'Initial Single',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/initial-1',
  item: [
    {
      linkId: 'patient-age',
      text: 'Age',
      type: 'integer',
      initial: [
        {
          valueInteger: 30
        }
      ]
    }
  ]
};

export const qInitialRepeats: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'InitialRepeats',
  name: 'InitialRepeats',
  title: 'Initial Repeats',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/initial-2',
  item: [
    {
      linkId: 'container',
      text: '',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-age',
          definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.state',
          text: 'Visited states',
          type: 'choice',
          repeats: true,
          initial: [
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'ACT',
                display: 'Australian Capital Territory'
              }
            },
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'NSW',
                display: 'New South Wales'
              }
            },
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'QLD',
                display: 'Queensland'
              }
            },
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'VIC',
                display: 'Victoria'
              }
            },
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'TAS',
                display: 'Tasmania'
              }
            }
          ],
          answerValueSet:
            'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
        }
      ]
    }
  ]
};

export const qEnableWhen: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'EnableWhen',
  name: 'EnableWhen',
  title: 'Enable When',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/enable-when',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'YesNoNA',
      url: 'https://smartforms.csiro.au/ig/ValueSet/YesNoNA',
      name: 'YesNoNA',
      title: 'Yes/No/NA',
      status: 'draft',
      experimental: false,
      description: 'Concepts for Yes, No and Not applicable',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            concept: [
              {
                code: 'Y',
                display: 'Yes'
              },
              {
                code: 'N',
                display: 'No'
              },
              {
                code: 'NA',
                display: 'N/A'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:5baa5444-e553-4412-a08c-9ce93d3271e0',
        timestamp: '2023-09-01T11:16:50+10:00',
        total: 3,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.1.0'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.1.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'Y',
            display: 'Yes'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'NA',
            display: 'N/A'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'AboriginalTorresStraitIslander',
      url: 'https://smartforms.csiro.au/ig/ValueSet/AboriginalTorresStraitIslander',
      name: 'AboriginalTorresStraitIslander',
      title: 'Aboriginal and/or Torres Strait Islander',
      status: 'draft',
      experimental: false,
      description:
        'The Aboriginal and/or Torres Strait Islander value set includes the Australian Indigenous statuses for Indigenous people.',
      compose: {
        include: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            concept: [
              {
                code: '1',
                display: 'Aboriginal'
              },
              {
                code: '2',
                display: 'Torres Strait Islander'
              },
              {
                code: '3',
                display: 'Aboriginal and Torres Strait Islander'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'e2b013bd-1725-4299-a7a5-53635d42f1be',
        timestamp: '2022-10-20T11:38:45+10:00',
        total: 3,
        offset: 0,
        parameter: [
          {
            name: 'version',
            valueUri:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1|1.0.3'
          },
          {
            name: 'count',
            valueInteger: 2147483647
          },
          {
            name: 'offset',
            valueInteger: 0
          }
        ],
        contains: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            code: '1',
            display: 'Aboriginal but not Torres Strait Islander origin'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            code: '2',
            display: 'Torres Strait Islander but not Aboriginal origin'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            code: '3',
            display: 'Both Aboriginal and Torres Strait Islander origin'
          }
        ]
      }
    }
  ],
  item: [
    {
      linkId: 'a8143230-b30d-4b85-9805-5f2f73f2dffa',
      text: 'My Aged Care',
      type: 'group',
      repeats: false,
      item: [
        {
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
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
              valueCode: 'horizontal'
            }
          ],
          linkId: 'registered-for-my-aged-care',
          text: 'Registered for My Aged Care',
          type: 'choice',
          repeats: false,
          answerValueSet: '#YesNoNA'
        },
        {
          linkId: 'my-aged-care-number',
          text: 'My Aged Care Number',
          type: 'string',
          enableWhen: [
            {
              question: 'registered-for-my-aged-care',
              operator: '=',
              answerCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0136',
                code: 'Y'
              }
            }
          ],
          repeats: false
        }
      ]
    }
  ]
};

export const qEnableWhenMultiCheckbox: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'EnableWhenMultiCheckbox',
  name: 'EnableWhenMultiCheckbox',
  title: 'EnableWhen Multi-select Checkbox',
  version: '0.1.0',
  status: 'draft',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/enable-when-multi-checkbox',
  item: [
    {
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
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Other, please specify'
        }
      ],
      linkId: 'select-conditions-list',
      text: 'Select one or more conditions',
      type: 'open-choice',
      repeats: true,
      answerOption: [
        {
          valueString: 'Condition A (Displays Clinical guidance: Condition A question)'
        },
        {
          valueString: 'Condition B (Displays Clinical guidance: Condition B question)'
        },
        {
          valueString: 'Condition C (Displays Clinical guidance: Condition C question)'
        },
        {
          valueString: 'Condition D'
        },
        {
          valueString: 'Condition E'
        },
        {
          valueString: 'Condition F'
        }
      ]
    },
    {
      linkId: 'clinical-guidance-a',
      text: 'Clinical guidance: Condition A',
      type: 'display',
      enableWhen: [
        {
          question: 'select-conditions-list',
          operator: '=',
          answerString: 'Condition A (Displays Clinical guidance: Condition A question)'
        }
      ]
    },
    {
      linkId: 'clinical-guidance-b',
      text: 'Clinical guidance: Condition B',
      type: 'display',
      enableWhen: [
        {
          question: 'select-conditions-list',
          operator: '=',
          answerString: 'Condition B (Displays Clinical guidance: Condition B question)'
        }
      ]
    },
    {
      linkId: 'clinical-guidance-c',
      text: 'Clinical guidance: Condition C',
      type: 'display',
      enableWhen: [
        {
          question: 'select-conditions-list',
          operator: '=',
          answerString: 'Condition C (Displays Clinical guidance: Condition C question)'
        }
      ]
    }
  ]
};

export const qEnableBehaviorAll: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'EnableBehaviorAll',
  name: 'EnableBehaviorAll',
  title: 'Enable Behavior All',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/enable-behavior-all',
  item: [
    {
      linkId: 'has-heart-disease',
      text: 'Do you have a history of heart disease?',
      type: 'boolean'
    },
    {
      linkId: 'has-heart-condition',
      text: 'Are you currently taking any medications?',
      type: 'boolean',
      enableWhen: [
        {
          question: 'has-heart-disease',
          operator: '=',
          answerBoolean: true
        }
      ]
    },
    {
      linkId: 'medication-list',
      text: 'What medications are you currently taking?',
      type: 'string',
      enableWhen: [
        {
          question: 'has-heart-disease',
          operator: '=',
          answerBoolean: true
        },
        {
          question: 'has-heart-condition',
          operator: '=',
          answerBoolean: true
        }
      ],
      enableBehavior: 'all'
    }
  ]
};

export const qEnableBehaviorAny: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'EnableBehaviorAny',
  name: 'EnableBehaviorAny',
  title: 'Enable Behavior Any',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/enable-behavior-any',
  item: [
    {
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
        }
      ],
      linkId: 'smoking-status',
      text: 'Smoking status',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '266919005',
            display: 'Never smoked'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '77176002',
            display: 'Smoker'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '8517006',
            display: 'Ex-smoker'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '16090371000119103',
            display: 'Exposure to second hand tobacco smoke'
          }
        },
        {
          valueString: 'Wants to quit'
        },
        {
          valueString: 'Other tobacco use'
        }
      ]
    },
    {
      linkId: 'how-long-as-a-smoker',
      text: 'How long as a smoker?',
      type: 'string',
      enableWhen: [
        {
          question: 'smoking-status',
          operator: '=',
          answerCoding: {
            system: 'http://snomed.info/sct',
            code: '77176002'
          }
        },
        {
          question: 'smoking-status',
          operator: '=',
          answerCoding: {
            system: 'http://snomed.info/sct',
            code: '8517006'
          }
        },
        {
          question: 'smoking-status',
          operator: '=',
          answerString: 'Wants to quit'
        }
      ],
      enableBehavior: 'any'
    }
  ]
};

export const qEnableWhenExpressionSimple: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'EnableWhenExpressionSimple',
  name: 'EnableWhenExpressionSimple',
  title: 'Enable When Expression Simple Example',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/enable-when-expression-1',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'age',
            language: 'text/fhirpath',
            expression: "item.where(linkId='patient-age').answer.value"
          }
        }
      ],
      linkId: 'container',
      text: 'Finalising the health check',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-age-instructions',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em">Feel free to play around with the age value according to different age groups:</p><ul style="font-size:0.875em">\r\n      <li >Less or equal to 5</li>\r\n      <li>6 to 12</li>\r\n      <li>12 to 24</li>\r\n      <li>24 to 49</li>\r\n      <li>More or equal to 49</li>\r\n</ul></div>'
              }
            ]
          },
          text: 'Feel free to play around with the age value according to different age groups i.e. <=5, 6-12, 12-24, 24-49, >49',
          type: 'display',
          repeats: false
        },
        {
          linkId: 'patient-age',
          text: 'Age',
          type: 'integer',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age <= 5'
              }
            }
          ],
          linkId: 'patient-priorities-less-than-6',
          text: 'Patient priorities and goals: What does the parent/carer say are the important things that have come out of this health check?',
          type: 'text',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age <= 12).intersect(%age > 5)'
              }
            }
          ],
          linkId: 'patient-priorities-6-to-12',
          text: 'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?',
          type: 'text',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age > 12'
              }
            }
          ],
          linkId: 'patient-priorities-more-than-12',
          text: 'Patient priorities and goals: What does the patient say are the important things that have come out of this health check?',
          type: 'text',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age <= 5'
              }
            },
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
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
              valueString: 'Other'
            }
          ],
          linkId: 'brief-intervention-less-than-6',
          text: 'Brief intervention: advice and information provided during health check',
          type: 'open-choice',
          repeats: true,
          answerOption: [
            {
              valueString: 'Sugary drinks'
            },
            {
              valueString: 'Screen use'
            },
            {
              valueString: 'Healthy eating, including breastfeeding'
            },
            {
              valueString: 'Environmental exposure to harmful elements eg tobacco smoke'
            },
            {
              valueString: 'Physical activity and exercise'
            },
            {
              valueString: 'Sun protection'
            },
            {
              valueString: 'Parenting advice'
            },
            {
              valueString: 'Safe sleeping practices'
            },
            {
              valueString: 'Developmental milestones - including language and hearing'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age <= 12).intersect(%age > 5)'
              }
            },
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
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
              valueString: 'Other'
            }
          ],
          linkId: 'brief-intervention-6-to-12',
          text: 'Brief intervention: advice and information provided during health check',
          type: 'open-choice',
          repeats: true,
          answerOption: [
            {
              valueString: 'Healthy eating'
            },
            {
              valueString: 'Screen use'
            },
            {
              valueString: 'Sun protection'
            },
            {
              valueString: 'Environmental exposure to harmful elements (e.g. tobacco smoke)'
            },
            {
              valueString: 'Sugary drinks'
            },
            {
              valueString: 'Physical activity and exercise'
            },
            {
              valueString: 'Parenting advice'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age <= 24).intersect(%age > 12)'
              }
            },
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
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
              valueString: 'Other'
            }
          ],
          linkId: 'brief-intervention-13-to-24',
          text: 'Brief intervention: advice and information provided during health check',
          type: 'open-choice',
          repeats: true,
          answerOption: [
            {
              valueString: 'Healthy eating'
            },
            {
              valueString: 'Screen use'
            },
            {
              valueString: 'Physical activity and exercise'
            },
            {
              valueString: 'Mental health and wellbeing'
            },
            {
              valueString: 'Safety/risky behaviours'
            },
            {
              valueString: 'Smoking cessation'
            },
            {
              valueString: 'Substance use/harm minimisation'
            },
            {
              valueString: 'Safe sex/contraception'
            },
            {
              valueString: 'Care of teeth and gums'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age <= 49).intersect(%age > 24)'
              }
            },
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
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
              valueString: 'Other'
            }
          ],
          linkId: 'brief-intervention-25-to-49',
          text: 'Brief intervention: advice and information provided during health check',
          type: 'open-choice',
          repeats: true,
          answerOption: [
            {
              valueString: 'Healthy eating'
            },
            {
              valueString: 'Screen use'
            },
            {
              valueString: 'Physical activity and exercise'
            },
            {
              valueString: 'Mental health and wellbeing'
            },
            {
              valueString: 'Carer support'
            },
            {
              valueString: 'Safety/risky behaviours'
            },
            {
              valueString: 'Smoking cessation'
            },
            {
              valueString: 'Substance use/harm minimisation'
            },
            {
              valueString: 'Safe sex/contraception'
            },
            {
              valueString: 'Oral and dental health'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age > 49'
              }
            },
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
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
              valueString: 'Other'
            }
          ],
          linkId: 'brief-intervention-more-than-49',
          text: 'Brief intervention: advice and information provided during health check',
          type: 'open-choice',
          repeats: true,
          answerOption: [
            {
              valueString: 'Healthy eating'
            },
            {
              valueString: 'Physical activity and exercise'
            },
            {
              valueString: 'Mental health and wellbeing'
            },
            {
              valueString: 'Carer support'
            },
            {
              valueString: 'Smoking cessation'
            },
            {
              valueString: 'Substance use/harm minimisation'
            },
            {
              valueString: 'Social support and services'
            },
            {
              valueString: 'Oral and dental health'
            }
          ]
        }
      ]
    }
  ]
};

export const qEnableWhenExpressionTabs: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'EnableWhenExpressionTabs',
  name: 'EnableWhenExpressionTabs',
  title: 'Enable When Expression Tabs',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/enable-when-expression-2',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                version: '1.0.0',
                code: 'tab-container'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'age',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='patient-details').item.where(linkId='patient-age').answer.value"
          }
        }
      ],
      linkId: 'tab-container',
      type: 'group',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age.exists()'
              }
            }
          ],
          linkId: 'about-health-check',
          text: 'About the health check',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'about-health-check-display',
              text: 'This section contains fields about the status of current and previous health checks.',
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age.exists()'
              }
            }
          ],
          linkId: 'consent',
          text: 'Consent',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'consent-display',
              text: "This section contains fields about the patient's consent to the health check.",
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'patient-age-instructions',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                    valueString:
                      '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em">Feel free to play around with the age value according to different age groups:</p><ul style="font-size:0.875em">\r\n      <li >Less or equal to 5</li>\r\n      <li>6 to 12</li>\r\n      <li>13 to 24</li>\r\n      <li>25 to 49</li>\r\n      <li>More or equal to 49</li>\r\n</ul></div>'
                  }
                ]
              },
              text: 'Feel free to play around with the age value according to different age groups i.e. <=5, 6-12, 13-24, 25-49, >49',
              type: 'display',
              repeats: false
            },
            {
              linkId: 'patient-age',
              text: 'Age',
              type: 'integer',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Current priorities'
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age.exists()'
              }
            }
          ],
          linkId: 'current-priorities',
          text: 'Current health/patient priorities',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'current-priorities-display',
              text: "This section contains fields about the patient's current health priorities.",
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age.exists()'
              }
            }
          ],
          linkId: 'medical-history',
          text: 'Medical history and current problems',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'medical-history-display',
              text: "This section contains fields about the patient's medical history and current problems.",
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age <= 5'
              }
            }
          ],
          linkId: 'red-flags-early-identification',
          text: 'Red flags early identification guide for children',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'red-flags-early-identification-display',
              text: 'This section contains fields to provide guidance on identifiying early red flags in children.',
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age >= 12'
              }
            }
          ],
          linkId: 'substance-use',
          text: 'Substance use, including tobacco',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'substance-use-display',
              text: "This section contains fields about a patient's substance and tobacco use.",
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age > 12).intersect(%age <= 24)'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Sexual health'
            }
          ],
          linkId: 'sexual-health',
          text: 'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'sexual-health-display',
              text: "This section contains fields about a patient's sexual health, including sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs.",
              type: 'display',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age >= 50'
              }
            }
          ],
          linkId: 'genitourinary-and-sexual-health',
          text: 'Genitourinary and sexual health',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'genitourinary-and-sexual-health-display',
              text: "This section contains fields about a patient's genitourinary and sexual health",
              type: 'display',
              repeats: false
            }
          ]
        }
      ]
    }
  ]
};

export const qText: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'Text',
  name: 'Text',
  title: 'Text',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/other/text',
  item: [
    {
      linkId: 'text-normal',
      text: 'This sentence is an example of a normal usage of text.',
      type: 'display',
      repeats: false
    },
    {
      linkId: 'text-xhtml',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p>This sentence is an example of a text using the rendering-xhtml extension.</p></div>'
          }
        ]
      },
      text: 'This sentence is an example of a text using the rendering-xhtml extension.',
      type: 'display',
      repeats: false
    }
  ]
};
