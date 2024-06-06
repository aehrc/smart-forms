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
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control',
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
  url: 'https://smartforms.csiro.au/docs/advanced/control/choice-orientation',
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
  url: 'https://smartforms.csiro.au/docs/advanced/control/slider-step-value',
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

export const qCollapsibleSingleDefaultOpen: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CollapsibleSingleDefaultOpen',
  name: 'CollapsibleSingleDefaultOpen',
  title: 'Collapsible Single - Default Open',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/control/collapsible-single-1',
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
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        }
      ],
      linkId: 'working-collapsible',
      text: 'Are you working?',
      type: 'choice',
      repeats: false,
      answerValueSet: '#YesNoNA',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Details'
            }
          ],
          linkId: 'details-working',
          text: 'Details (occupation including occupational hazards, study, training, disability, etc)',
          type: 'text',
          repeats: false
        }
      ]
    }
  ]
};
export const qCollapsibleSingleDefaultClosed: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CollapsibleSingleDefaultClosed',
  name: 'CollapsibleSingleDefaultClosed',
  title: 'Collapsible Single - Default Closed',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/control/collapsible-single-2',
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
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-closed'
        }
      ],
      linkId: 'working-collapsible',
      text: 'Are you working?',
      type: 'choice',
      repeats: false,
      answerValueSet: '#YesNoNA',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Details'
            }
          ],
          linkId: 'details-working',
          text: 'Details (occupation including occupational hazards, study, training, disability, etc)',
          type: 'text',
          repeats: false
        }
      ]
    }
  ]
};

export const qCollapsibleGroupDefaultOpen: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CollapsibleGroupDefaultOpen',
  name: 'CollapsibleGroupDefaultOpen',
  title: 'Collapsible Group - Default Open',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/control/collapsible-group-1',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        },
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
      linkId: 'bmi-collapsible',
      text: 'BMI Calculation',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
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

export const qCollapsibleGroupDefaultClosed: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CollapsibleGroupDefaultClosed',
  name: 'CollapsibleGroupDefaultClosed',
  title: 'Collapsible Group - Default Closed',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/control/collapsible-group-2',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-closed'
        },
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
      linkId: 'bmi-collapsible',
      text: 'BMI Calculation',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
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

export const qCollapsibleGroupNested: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CollapsibleGroupNested',
  name: 'CollapsibleGroupNested',
  title: 'Collapsible Group - Nested',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-08',
  url: 'https://smartforms.csiro.au/docs/advanced/control/collapsible-group-3',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        }
      ],
      linkId: 'f1262ade-843c-4eba-a86d-51a9c97d134b',
      text: 'Home address',
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
                    code: 'check-box'
                  }
                ]
              }
            }
          ],
          linkId: '311d83bb-f22e-4f60-9b50-b6e38dd2059b',
          definition:
            'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.extension:noFixedAddress',
          text: 'No fixed address',
          type: 'boolean',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
              valueCode: 'default-open'
            }
          ],
          linkId: '4e0dc185-f83e-4027-b7a8-ecb543d42c6d',
          type: 'group',
          text: 'Address',
          enableWhen: [
            {
              question: '311d83bb-f22e-4f60-9b50-b6e38dd2059b',
              operator: '!=',
              answerBoolean: true
            }
          ],
          repeats: true,
          item: [
            {
              linkId: '2fee2d51-7828-4178-b8c1-35edd32ba338',
              definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.line',
              text: 'Street address',
              type: 'string',
              repeats: false
            },
            {
              linkId: 'ddb65ed1-f4b2-4730-af2a-2f98bc73c76f',
              definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.city',
              text: 'City',
              type: 'string',
              repeats: false
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: 'drop-down'
                      }
                    ]
                  }
                }
              ],
              linkId: 'd9a1236c-8d6e-4f20-a12a-9d5de5a1d0f6',
              definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.state',
              text: 'State',
              type: 'choice',
              repeats: false,
              answerValueSet:
                'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
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
              linkId: '3f61a1ea-1c74-4f52-8519-432ce861a74f',
              definition:
                'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
              text: 'Postcode',
              type: 'string',
              repeats: false
            }
          ]
        }
      ]
    }
  ]
};
