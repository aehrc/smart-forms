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

export const qItemControl: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControl',
  name: 'ItemControl',
  title: 'Item Control',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/text/item-control',
  item: [
    {
      linkId: 'item-control-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em"> Please refer to the respective itemControl sections for group, display and question items.</p></div>'
          }
        ]
      },
      text: 'Please refer to the respective itemControl sections for group, display and question items.',
      type: 'display',
      repeats: false
    }
  ]
};

export const qChoiceOrientation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceOrientation',
  name: 'ChoiceOrientation',
  title: 'Choice Orientation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/text/choice-orientation',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'administrative-gender',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/shareablevalueset']
      },
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pa'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'normative'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 5
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-normative-version',
          valueCode: '4.0.0'
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/administrative-gender',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.1'
        }
      ],
      version: '4.0.1',
      name: 'AdministrativeGender',
      title: 'AdministrativeGender',
      status: 'active',
      experimental: false,
      date: '2019-11-01T09:29:23+11:00',
      publisher: 'HL7 (FHIR Project)',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            },
            {
              system: 'email',
              value: 'fhir@lists.hl7.org'
            }
          ]
        }
      ],
      description: 'The gender of a person used for administrative purposes.',
      immutable: true,
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://hl7.org/fhir/administrative-gender'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:50f050c9-3975-48d6-bdb7-baae4ebc70cd',
        timestamp: '2024-04-05T12:31:27+10:00',
        total: 4,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        ]
      }
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
          valueCode: 'vertical'
        },
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
      linkId: 'administrative-gender-vertical',
      text: 'Administrative gender (vertical)',
      type: 'choice',
      repeats: false,
      answerValueSet: '#administrative-gender'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
          valueCode: 'horizontal'
        },
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
      linkId: 'administrative-gender-horizontal',
      text: 'Administrative gender (horizontal)',
      type: 'choice',
      repeats: false,
      answerValueSet: '#administrative-gender'
    }
  ]
};

export const qSliderStepValue: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'SliderStepValue',
  name: 'SliderStepValue',
  title: 'Slider Step Value',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/text/slider-step-value',
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
      linkId: 'pain-measure',
      text: 'Pain measure',
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
          linkId: 'pain-measure-lower',
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
          linkId: 'pain-measure-upper',
          text: 'Unbearable pain',
          type: 'display'
        }
      ]
    }
  ]
};
