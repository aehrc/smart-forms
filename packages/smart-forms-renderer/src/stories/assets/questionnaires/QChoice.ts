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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const qChoiceAnswerOptionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerOptionBasic',
  name: 'ChoiceAnswerOptionBasic',
  title: 'Choice AnswerOption Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answeroption-basic',
  item: [
    {
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
    }
  ]
};

export const qrChoiceAnswerOptionBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'smoking-status',
      text: 'Smoking status',
      answer: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '16090371000119103',
            display: 'Exposure to second hand tobacco smoke'
          }
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/choice/answeroption-basic'
};

export const qChoiceAnswerValueSetBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerValueSetBasic',
  name: 'ChoiceAnswerValueSetBasic',
  title: 'Choice AnswerValueSet Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answervalueset-basic',
  item: [
    {
      linkId: 'gender',
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
    }
  ]
};

export const qrChoiceAnswerValueSetBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'gender',
      text: 'Gender',
      answer: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/choice/answervalueset-basic'
};

export const qChoiceAnswerOptionCalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerOptionCalculation',
  name: 'ChoiceAnswerOptionCalculation',
  title: 'Choice AnswerOption Calculation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answeroption-calculation',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'painLevel',
        language: 'text/fhirpath',
        expression: "item.where(linkId = 'pain-level').answer.value"
      }
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'slider'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
          valueInteger: 1
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 0
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        }
      ],
      linkId: 'pain-level',
      text: 'Pain level',
      type: 'integer',
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
                    code: 'lower'
                  }
                ]
              }
            }
          ],
          linkId: 'pain-level-lower',
          text: 'No pain',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'upper'
                  }
                ]
              }
            }
          ],
          linkId: 'pain-level-upper',
          text: 'Unbearable pain',
          type: 'display'
        }
      ]
    },
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
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "iif(%painLevel.empty(), 'Y', iif(%painLevel < 5, 'Y', 'N'))"
          }
        }
      ],
      linkId: 'pain-low',
      text: 'Low pain (Level < 5)',
      type: 'choice',
      repeats: false,
      readOnly: true,
      answerOption: [
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'Y',
            display: 'Yes'
          }
        },
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          }
        }
      ]
    }
  ]
};

export const qChoiceAnswerValueSetCalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerValueSetCalculation',
  name: 'ChoiceAnswerValueSetCalculation',
  title: 'Choice AnswerValueSet Calculation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answervalueset-calculation',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'australian-states-territories-2',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10026'
        }
      ],
      version: '2.0.2',
      name: 'AustralianStatesAndTerritories',
      title: 'Australian States and Territories',
      status: 'active',
      experimental: false,
      date: '2020-05-31',
      publisher: 'Australian Digital Health Agency',
      contact: [
        {
          telecom: [
            {
              system: 'email',
              value: 'help@digitalhealth.gov.au'
            }
          ]
        }
      ],
      description:
        'The Australian States and Territories value set includes values that represent the Australian states and territories.',
      copyright:
        'Copyright © 2018 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes material that is based on Australian Institute of Health and Welfare material. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            concept: [
              {
                code: 'ACT'
              },
              {
                code: 'NSW'
              },
              {
                code: 'NT'
              },
              {
                code: 'OTHER'
              },
              {
                code: 'QLD'
              },
              {
                code: 'SA'
              },
              {
                code: 'TAS'
              },
              {
                code: 'VIC'
              },
              {
                code: 'WA'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'e9439195-c1d8-4069-a349-98c1d552a351',
        timestamp: '2023-06-20T04:20:58+00:00',
        total: 9,
        offset: 0,
        parameter: [
          {
            name: 'version',
            valueUri:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1|1.1.3'
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
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'ACT',
            display: 'Australian Capital Territory'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NSW',
            display: 'New South Wales'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NT',
            display: 'Northern Territory'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'OTHER',
            display: 'Other territories'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'QLD',
            display: 'Queensland'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'SA',
            display: 'South Australia'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'TAS',
            display: 'Tasmania'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'VIC',
            display: 'Victoria'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'WA',
            display: 'Western Australia'
          }
        ]
      }
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'stateCode',
        language: 'text/fhirpath',
        expression: "item.where(linkId = 'state-controller').answer.value"
      }
    }
  ],
  item: [
    {
      linkId: 'state-controller-instructions',
      text: 'Feel free to play around with the following state codes: ACT, NSW, NT, OTHER, QLD, SA, TAS, VIC, WA',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <div style="font-size:0.875em">Feel free to play around with the following state codes:</div>\r\n    <ul style="font-size:0.875em">\r\n      <li>ACT</li>\r\n      <li>NSW</li>\r\n      <li>NT</li>\r\n      <li>OTHER</li>\r\n      <li>QLD</li>\r\n      <li>SA</li>\r\n      <li>TAS</li>\r\n      <li>VIC</li>\r\n      <li>WA</li>\r\n    </ul>\r\n    </div>'
          }
        ]
      },
      type: 'display',
      repeats: false
    },
    {
      linkId: 'state-controller',
      text: 'State (string)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%stateCode'
          }
        }
      ],
      linkId: 'state-choice',
      text: 'State (choice)',
      type: 'choice',
      repeats: false,
      readOnly: true,
      answerValueSet: '#australian-states-territories-2'
    }
  ]
};
