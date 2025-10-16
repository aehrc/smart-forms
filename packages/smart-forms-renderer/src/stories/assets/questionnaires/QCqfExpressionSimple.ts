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

export const qCqfExpressionSimple: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'static-text',
      type: 'display',
      text: 'This is static text that should always appear'
    },
    {
      linkId: 'patient-id-test',
      type: 'display',
      text: 'Patient ID will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: "'Patient ID: ' + %patient.id"
            }
          }
        ]
      }
    },
    {
      linkId: 'simple-expression',
      type: 'display',
      text: 'Hello from CQF Expression! Current time: ',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: "'Hello from CQF Expression! Current time: ' + now().toString()"
            }
          }
        ]
      }
    },
    {
      linkId: 'patient-name-test',
      type: 'display',
      text: 'Patient name will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "'Patient: ' + %patient.name.first().given.first() + ' ' + %patient.name.first().family"
            }
          }
        ]
      }
    },
    {
      linkId: 'input-test',
      type: 'string',
      text: 'Enter some text'
    },
    {
      linkId: 'echo-input',
      type: 'display',
      text: 'Your input will appear here',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
            valueExpression: {
              language: 'text/fhirpath',
              expression:
                "iif(%resource.item.where(linkId='input-test').answer.exists(), 'You entered: ' + %resource.item.where(linkId='input-test').answer.first().valueString, 'Please enter some text above')"
            }
          }
        ]
      }
    }
  ]
};
