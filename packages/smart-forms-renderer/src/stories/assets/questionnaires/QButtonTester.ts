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

export const qButtonTester: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ButtonTester',
  name: 'ButtonTester',
  title: 'Button Tester',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/button',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'AllConditions',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'DecimalObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'IntegerObsBloodPressure',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=85354-9&_count=1&_sort=-date&patient={{%patient.id}}'
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
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%DecimalObsBodyWeight.entry.resource.value.value'
          }
        }
      ],
      linkId: 'decimal',
      type: 'decimal',
      repeats: false,
      text: 'Decimal Test'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              "%IntegerObsBloodPressure.entry.resource.component.where(code.coding.exists(code='8480-6')).value.value"
          }
        }
      ],
      linkId: 'integer',
      type: 'integer',
      repeats: false,
      text: 'Integer Test'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: "(%patient.name.where(use='official').select(family) | text).first()"
          }
        }
      ],
      linkId: 'string',
      type: 'string',
      repeats: false,
      text: 'String Test'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              "%patient.address.where(use='home' and (type.empty() or type!='postal')).select(line.join(', '))"
          }
        }
      ],
      linkId: 'text',
      type: 'text',
      repeats: false,
      text: 'Text Test'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%patient.birthDate'
          }
        }
      ],
      linkId: 'date',
      type: 'date',
      repeats: false,
      text: 'Date Test'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%patient.birthDate'
          }
        }
      ],
      linkId: 'dateTime',
      type: 'dateTime',
      repeats: false,
      text: 'DateTime Test'
    },
    {
      linkId: 'repeats-container',
      type: 'group',
      repeats: false,
      text: '',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: "%patient.telecom.where(system = 'phone' and use = 'home').value"
              }
            }
          ],
          linkId: 'repeats-string',
          type: 'string',
          repeats: true,
          text: 'Repeats Test (String)'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'PostalAddressRepeat',
            language: 'text/fhirpath',
            expression: "%patient.address.where(type='postal')"
          }
        }
      ],
      linkId: 'repeats-group',
      type: 'group',
      repeats: true,
      text: 'Repeats Group Test',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PostalAddressRepeat.city'
              }
            }
          ],
          linkId: 'repeats-group-string',
          text: 'String',
          type: 'string',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PostalAddressRepeat.state'
              }
            }
          ],
          linkId: 'repeats-group-choice',
          text: 'Choice',
          type: 'choice',
          repeats: false,
          answerValueSet:
            'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'PostalAddressRepeat',
            language: 'text/fhirpath',
            expression: "%patient.address.where(type='postal')"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'gtable'
              }
            ]
          }
        }
      ],
      linkId: 'repeats-gtable',
      type: 'group',
      repeats: true,
      text: 'Repeats Group Table Test',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PostalAddressRepeat.city'
              }
            }
          ],
          linkId: 'repeats-gtable-string',
          text: 'String',
          type: 'string',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PostalAddressRepeat.state'
              }
            }
          ],
          linkId: 'repeats-gtable-choice',
          text: 'Choice',
          type: 'choice',
          repeats: false,
          answerValueSet:
            'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
        }
      ]
    }
  ]
};

export const qrButtonTesterResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'decimal',
      text: 'Decimal Test',
      answer: [
        {
          valueDecimal: 123.45
        }
      ]
    },
    {
      linkId: 'integer',
      text: 'Integer Test',
      answer: [
        {
          valueInteger: 123
        }
      ]
    },
    {
      linkId: 'string',
      text: 'String Test',
      answer: [
        {
          valueString: 'Sample String'
        }
      ]
    },
    {
      linkId: 'text',
      text: 'Text Test',
      answer: [
        {
          valueString: 'Sample Text'
        }
      ]
    },
    {
      linkId: 'date',
      text: 'Date Test',
      answer: [
        {
          valueDate: '2024-05-20'
        }
      ]
    },
    {
      linkId: 'dateTime',
      text: 'DateTime Test',
      answer: [
        {
          valueDateTime: '2024-05-20T15:30:00Z'
        }
      ]
    },
    {
      linkId: 'repeats-container',
      text: '',
      item: [
        {
          linkId: 'repeats-string',
          text: 'Repeats Test (String)',
          answer: [
            {
              valueString: 'First String'
            },
            {
              valueString: 'Second String'
            }
          ]
        }
      ]
    },
    {
      linkId: 'repeats-group',
      text: 'Repeats Group Test',
      item: [
        {
          linkId: 'repeats-group-string',
          text: 'String',
          answer: [
            {
              valueString: 'Nested String 1'
            }
          ]
        },
        {
          linkId: 'repeats-group-choice',
          text: 'Choice',
          answer: [
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'NSW'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'repeats-group',
      text: 'Repeats Group Test',
      item: [
        {
          linkId: 'repeats-group-string',
          text: 'String',
          answer: [
            {
              valueString: 'Nested String 2'
            }
          ]
        },
        {
          linkId: 'repeats-group-choice',
          text: 'Choice',
          answer: [
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'SA'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'repeats-gtable',
      text: 'Repeats Group Table Test',
      item: [
        {
          linkId: 'repeats-gtable-string',
          text: 'String',
          answer: [
            {
              valueString: 'Group Table String 1'
            }
          ]
        },
        {
          linkId: 'repeats-gtable-choice',
          text: 'Choice',
          answer: [
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'NSW'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'repeats-gtable',
      text: 'Repeats Group Table Test',
      item: [
        {
          linkId: 'repeats-gtable-string',
          text: 'String',
          answer: [
            {
              valueString: 'Group Table String 2'
            }
          ]
        },
        {
          linkId: 'repeats-gtable-choice',
          text: 'Choice',
          answer: [
            {
              valueCoding: {
                system:
                  'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                code: 'SA'
              }
            }
          ]
        }
      ]
    }
  ],

  questionnaire: 'https://smartforms.csiro.au/docs/tester/button'
};
