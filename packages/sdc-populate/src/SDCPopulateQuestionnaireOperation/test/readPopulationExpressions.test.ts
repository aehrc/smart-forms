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

import { describe, expect, it } from '@jest/globals';
import type { Questionnaire } from 'fhir/r4';
import { readPopulationExpressions } from '../utils/readPopulationExpressions';
import { QTestFhirContext } from './resources/QTestFhirContext';

const SDC_INITIAL_EXPR =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression';
const SDC_ITEM_POP_CTX =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext';

describe('readPopulationExpressions', () => {
  const questionnaire = QTestFhirContext as Questionnaire;
  const { initialExpressions } = readPopulationExpressions(questionnaire);

  it('should extract x-fhir-query variables ObsBodyHeight and ObsBodyWeight', () => {
    expect(initialExpressions.q1.expression).toEqual('%ObsBodyHeight.toString()');
  });
});

describe('readPopulationExpressions - itemPopulationContext', () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'non-repeat-field',
        type: 'string',
        extension: [
          {
            url: SDC_INITIAL_EXPR,
            valueExpression: { language: 'text/fhirpath', expression: '%patient.name.family' }
          }
        ]
      },
      {
        linkId: 'repeat-group',
        type: 'group',
        repeats: true,
        extension: [
          {
            url: SDC_ITEM_POP_CTX,
            valueExpression: {
              name: 'ConditionRepeat',
              language: 'text/fhirpath',
              expression: '%Condition.entry.resource'
            }
          }
        ],
        item: [
          {
            linkId: 'condition-onset',
            type: 'date',
            extension: [
              {
                url: SDC_INITIAL_EXPR,
                valueExpression: {
                  language: 'text/fhirpath',
                  expression:
                    '%ConditionRepeat.onset.ofType(dateTime).toString().substring(0,10).toDate()'
                }
              }
            ]
          },
          {
            linkId: 'condition-code',
            type: 'open-choice',
            extension: [
              {
                url: SDC_INITIAL_EXPR,
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: '%ConditionRepeat.code.coding'
                }
              }
            ]
          }
        ]
      }
    ]
  };

  const { initialExpressions, itemPopulationContexts } = readPopulationExpressions(questionnaire);

  it('should include initialExpression for non-repeat items', () => {
    expect(initialExpressions['non-repeat-field']).toBeDefined();
    expect(initialExpressions['non-repeat-field'].expression).toEqual('%patient.name.family');
  });

  it('should not include initialExpressions for children of an itemPopulationContext group', () => {
    expect(initialExpressions['condition-onset']).toBeUndefined();
    expect(initialExpressions['condition-code']).toBeUndefined();
  });

  it('should still register the itemPopulationContext', () => {
    expect(itemPopulationContexts['ConditionRepeat']).toBeDefined();
    expect(itemPopulationContexts['ConditionRepeat'].expression).toEqual(
      '%Condition.entry.resource'
    );
  });
});
