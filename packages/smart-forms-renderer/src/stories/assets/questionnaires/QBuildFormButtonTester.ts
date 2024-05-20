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

export const qBuildFormButtonTester: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BuildFormButtonTester',
  name: 'BuildFormButtonTester',
  title: 'BuildForm Button Tester',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/build-form-button',
  item: [
    {
      linkId: 'decimal',
      type: 'decimal',
      repeats: false,
      text: 'Decimal Test'
    },
    {
      linkId: 'integer',
      type: 'integer',
      repeats: false,
      text: 'Integer Test'
    },
    {
      linkId: 'string',
      type: 'string',
      repeats: false,
      text: 'String Test'
    },
    {
      linkId: 'text',
      type: 'text',
      repeats: false,
      text: 'Text Test'
    },
    {
      linkId: 'date',
      type: 'date',
      repeats: false,
      text: 'Date Test'
    },
    {
      linkId: 'dateTime',
      type: 'dateTime',
      repeats: false,
      text: 'DateTime Test'
    },
    {
      linkId: 'url',
      type: 'url',
      repeats: false,
      text: 'URL Test'
    },
    {
      linkId: 'repeats-container',
      type: 'group',
      repeats: false,
      text: '',
      item: [
        {
          linkId: 'repeats-string',
          type: 'string',
          repeats: true,
          text: 'Repeats Test (String)'
        }
      ]
    },
    {
      linkId: 'repeats-group',
      type: 'group',
      repeats: true,
      text: 'Repeats Group Test',
      item: [
        {
          linkId: 'repeats-group-boolean',
          type: 'boolean',
          repeats: false,
          text: 'Boolean'
        },
        {
          linkId: 'repeats-group-integer',
          type: 'integer',
          repeats: false,
          text: 'Integer'
        },
        {
          linkId: 'repeats-group-string',
          type: 'string',
          repeats: false,
          text: 'String'
        }
      ]
    }
  ]
};

export const qrBuildFormTesterResponse: QuestionnaireResponse = {
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
      linkId: 'url',
      text: 'URL Test',
      answer: [
        {
          valueUri: 'https://example.com'
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
          linkId: 'repeats-group-boolean',
          text: 'Boolean',
          answer: [
            {
              valueBoolean: true
            }
          ]
        },
        {
          linkId: 'repeats-group-integer',
          text: 'Integer',
          answer: [
            {
              valueInteger: 123
            }
          ]
        },
        {
          linkId: 'repeats-group-string',
          text: 'String',
          answer: [
            {
              valueString: 'Nested String 1'
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
          linkId: 'repeats-group-boolean',
          text: 'Boolean',
          answer: [
            {
              valueBoolean: false
            }
          ]
        },
        {
          linkId: 'repeats-group-integer',
          text: 'Integer',
          answer: [
            {
              valueInteger: 456
            }
          ]
        },
        {
          linkId: 'repeats-group-string',
          text: 'String',
          answer: [
            {
              valueString: 'Nested String 2'
            }
          ]
        }
      ]
    }
  ],

  questionnaire: 'https://smartforms.csiro.au/docs/tester/build-form-button'
};
