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

// TODO Add docs on validation is exposed as operationOutcomes

export const qAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'answer-option-instruction',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n Please refer to the <strong>Advanced Control Appearance - Item Control Question</strong> section for the full list of answerOption examples.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Advanced Control Appearance - Item Control Question section for the full list of answerOption examples.',
      type: 'display',
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

export const qAnswerValueSet: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'answer-value-set-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Advanced Control Appearance - Item Control Question</strong> section for the full list of answerValueSet examples.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Advanced Control Appearance - Item Control Question section for the full list of answerValueSet examples.',
      type: 'display',
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
                code: 'autocomplete'
              }
            ]
          }
        }
      ],
      linkId: 'medical-history',
      text: 'Medical history and current problems',
      type: 'open-choice',
      repeats: false,
      answerValueSet: 'https://smartforms.csiro.au/ig/ValueSet/MedicalHistory'
    }
  ]
};

export const qAnswerExpression: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            description: 'Variable to hold the results of the expansion',
            name: 'vsListOfLanguages',
            language: 'application/x-fhir-query',
            expression:
              'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/languages'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
          valueExpression: {
            description:
              'select the coded values from the expansion results in the above expression',
            name: 'ListOfLanguages',
            language: 'text/fhirpath',
            expression: '%vsListOfLanguages.expansion.contains'
          }
        }
      ],
      linkId: 'language',
      text: 'Language',
      type: 'choice'
    }
  ]
};

export const qAnswerOptionToggleExpressionAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'isNotNoneCode',
        language: 'text/fhirpath',
        expression:
          "%resource.item.where(linkId='hallucination-type').answer.value.empty() or %resource.item.where(linkId='hallucination-type').answer.value.code != 'none'"
      }
    }
  ],
  item: [
    {
      linkId: 'hallucination-type',
      text: 'Type of Hallucination',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'none',
            display: 'None'
          }
        },
        {
          valueCoding: {
            code: 'visual',
            display: 'Visual'
          }
        },
        {
          valueCoding: {
            code: 'tactile',
            display: 'Tactile'
          }
        }
      ]
    },
    {
      linkId: 'hallucination-details-dropdown',
      text: 'Hallucinations (dropdown)',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'lucid',
            display: 'Lucid'
          }
        },
        {
          valueCoding: {
            code: 'infrequent',
            display: 'Infrequent'
          }
        },
        {
          valueCoding: {
            code: 'brief',
            display: 'Brief'
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
                code: 'infrequent',
                display: 'Infrequent'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
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
                code: 'brief',
                display: 'Brief'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'hallucination-details-checkbox',
      text: 'Hallucinations (checkbox)',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'lucid',
            display: 'Lucid'
          }
        },
        {
          valueCoding: {
            code: 'infrequent',
            display: 'Infrequent'
          }
        },
        {
          valueCoding: {
            code: 'brief',
            display: 'Brief'
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
                code: 'infrequent',
                display: 'Infrequent'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
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
                code: 'brief',
                display: 'Brief'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'hallucination-details-radio',
      text: 'Hallucinations (radio)',
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            code: 'lucid',
            display: 'Lucid'
          }
        },
        {
          valueCoding: {
            code: 'infrequent',
            display: 'Infrequent'
          }
        },
        {
          valueCoding: {
            code: 'brief',
            display: 'Brief'
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
                code: 'infrequent',
                display: 'Infrequent'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
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
                code: 'brief',
                display: 'Brief'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const qAnswerOptionToggleExpressionContained: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'HallucinationType',
      url: 'https://smartforms.csiro.au/ValueSet/HallucinationType',
      name: 'HallucinationType',
      title: 'Type of Hallucination',
      status: 'draft',
      description: 'Options for type of hallucinations',
      compose: {
        include: [
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-type',
            concept: [
              { code: 'none', display: 'None' },
              { code: 'visual', display: 'Visual' },
              { code: 'tactile', display: 'Tactile' }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:hallucination-type-expansion',
        timestamp: '2024-05-01T00:00:00Z',
        contains: [
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-type',
            code: 'none',
            display: 'None'
          },
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-type',
            code: 'visual',
            display: 'Visual'
          },
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-type',
            code: 'tactile',
            display: 'Tactile'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'HallucinationDetail',
      url: 'https://smartforms.csiro.au/ValueSet/HallucinationDetail',
      name: 'HallucinationDetail',
      title: 'Hallucination Details',
      status: 'draft',
      description: 'Detailed descriptors for hallucination experiences',
      compose: {
        include: [
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
            concept: [
              { code: 'lucid', display: 'Lucid' },
              { code: 'infrequent', display: 'Infrequent' },
              { code: 'brief', display: 'Brief' }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:hallucination-detail-expansion',
        timestamp: '2024-05-01T00:00:00Z',
        contains: [
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
            code: 'lucid',
            display: 'Lucid'
          },
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
            code: 'infrequent',
            display: 'Infrequent'
          },
          {
            system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
            code: 'brief',
            display: 'Brief'
          }
        ]
      }
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'isNotNoneCode',
        language: 'text/fhirpath',
        expression:
          "%resource.item.where(linkId='hallucination-type').answer.value.empty() or %resource.item.where(linkId='hallucination-type').answer.value.code != 'none'"
      }
    }
  ],
  item: [
    {
      linkId: 'hallucination-type',
      text: 'Type of Hallucination',
      type: 'choice',
      answerValueSet: '#HallucinationType'
    },
    {
      linkId: 'hallucination-details-dropdown',
      text: 'Hallucinations (dropdown)',
      type: 'choice',
      answerValueSet: '#HallucinationDetail',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
          extension: [
            {
              url: 'option',
              valueCoding: {
                system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
                code: 'infrequent',
                display: 'Infrequent'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
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
                system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
                code: 'brief',
                display: 'Brief'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'hallucination-details-checkbox',
      text: 'Hallucinations (checkbox)',
      type: 'choice',
      answerValueSet: '#HallucinationDetail',
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
                system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
                code: 'infrequent',
                display: 'Infrequent'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
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
                system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
                code: 'brief',
                display: 'Brief'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'hallucination-details-radio',
      text: 'Hallucinations (radio)',
      type: 'choice',
      answerValueSet: '#HallucinationDetail',
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
                system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
                code: 'infrequent',
                display: 'Infrequent'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
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
                system: 'https://smartforms.csiro.au/CodeSystem/hallucination-detail',
                code: 'brief',
                display: 'Brief'
              }
            },
            {
              url: 'expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%isNotNoneCode'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const qRequiredDuplicate: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'required-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Advanced Form Rendering - Other</strong> section for the full list of required examples.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Advanced Form Rendering - Other section for the full list of required examples.',
      type: 'display',
      repeats: false
    }
  ]
};

export const qRepeatsDuplicate: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'repeats-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Advanced Form Rendering - Other</strong> section for the full list of repeats examples.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Advanced Form Rendering - Other section for the full list of repeats examples.',
      type: 'display',
      repeats: false
    }
  ]
};

export const qReadOnlyDuplicate: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'read-only-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Advanced Form Rendering - Other</strong> section for the full list of readOnly examples.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Advanced Form Rendering - Other section for the full list of readOnly examples.',
      type: 'display',
      repeats: false
    }
  ]
};
