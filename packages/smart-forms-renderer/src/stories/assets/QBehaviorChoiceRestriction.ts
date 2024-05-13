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

// TODO Add docs on validation is exposed as operationOutcomes

export const qAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AnswerOption',
  name: 'AnswerOption',
  title: 'Answer Option',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/answer-option',
  item: [
    {
      linkId: 'answer-option-instruction',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em"> Please refer to the <strong>Advanced Control Appearance - Item Control Question</strong> section for the full list of answerOption examples.</p></div>'
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
  id: 'AnswerValueSet',
  name: 'AnswerValueSet',
  title: 'Answer Value Set',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/answer-value-set',
  item: [
    {
      linkId: 'answer-value-set-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em">Please refer to the <strong>Advanced Control Appearance - Item Control Question</strong> section for the full list of answerValueSet examples.</p></div>'
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
  id: 'AnswerExpression',
  name: 'AnswerExpression',
  title: 'Answer Expression',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/answer-expression',
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

export const qRequiredDuplicate: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RequiredDuplicate',
  name: 'RequiredDuplicate',
  title: 'Required - Duplicate',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/required-duplicate',
  item: [
    {
      linkId: 'required-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em"> Please refer to the <strong>Advanced Form Rendering - Other</strong> section for the full list of required examples.</p></div>'
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
  id: 'RepeatsDuplicate',
  name: 'RepeatsDuplicate',
  title: 'Repeats Duplicate',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/repeats-duplicate',
  item: [
    {
      linkId: 'repeats-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em"> Please refer to the <strong>Advanced Form Rendering - Other</strong> section for the full list of repeats examples.</p></div>'
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
  id: 'ReadOnlyDuplicate',
  name: 'ReadOnlyDuplicate',
  title: 'Read-Only Duplicate',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/read-only-duplicate',
  item: [
    {
      linkId: 'read-only-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em"> Please refer to the <strong>Advanced Form Rendering - Other</strong> section for the full list of readOnly examples.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Advanced Form Rendering - Other section for the full list of readOnly examples.',
      type: 'display',
      repeats: false
    }
  ]
};
