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

export const qNestedRepeatQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
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
      linkId: 'parent',
      text: 'Height',
      type: 'decimal',
      repeats: true,
      readOnly: false,
      item: [
        {
          linkId: 'child-0',
          text: 'Nested 0',
          type: 'decimal',
          readOnly: false
        },
        {
          linkId: 'child-1',
          text: 'Nested 1',
          type: 'decimal',
          readOnly: false
        }
      ]
    }
  ]
};

export const qNestedRepeatQuestionnaireWithInitial: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'parent-decimal',
      type: 'decimal',
      text: 'Parent decimal with initial',
      repeats: true,
      initial: [{ valueDecimal: 1 }, { valueDecimal: 2 }],
      item: [
        {
          linkId: 'child-string',
          type: 'string',
          text: 'Child string with initial',
          initial: [{ valueString: 'child value' }]
        }
      ]
    }
  ]
};
