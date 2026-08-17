/// <reference types="jest" />

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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { validateForm } from '../utils/validate';
import { questionnaireStore } from '../stores';

/**
 * Integration test for issue #1985: validation errors on repeating group items should be scoped
 * to the specific invalid instance rather than shared across all instances (via linkId collision).
 *
 * Uses the real mapItem / qItem helpers (no module mocks) so the recursion and instance-index
 * keying is exercised end-to-end.
 */
describe('validateForm - repeating group instance-scoped errors (#1985)', () => {
  beforeAll(() => {
    // Ensure enableWhen does not hide any items and no target constraints interfere
    questionnaireStore.setState({
      itemMap: {},
      targetConstraints: {},
      enableWhenIsActivated: false,
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
    } as never);
  });

  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'repeat-group',
        type: 'group',
        text: 'Repeat Group',
        repeats: true,
        item: [
          {
            linkId: 'child-field',
            type: 'string',
            text: 'Child Field',
            required: true
          }
        ]
      }
    ]
  };

  it('flags only the empty instance, not the answered one', () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'repeat-group',
          text: 'Repeat Group',
          item: [{ linkId: 'child-field', text: 'Child Field', answer: [{ valueString: 'ok' }] }]
        },
        {
          linkId: 'repeat-group',
          text: 'Repeat Group',
          item: [{ linkId: 'child-field', text: 'Child Field' }] // instance 1: missing required answer
        }
      ]
    };

    const invalidItems = validateForm(questionnaire, response);

    // Only the second instance (index 1) is invalid
    expect(invalidItems['child-field///1']).toBeDefined();

    // The first instance and the shared bare linkId must NOT be flagged
    expect(invalidItems['child-field///0']).toBeUndefined();
    expect(invalidItems['child-field']).toBeUndefined();
  });

  it('flags both instances independently when both are empty', () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'repeat-group',
          text: 'Repeat Group',
          item: [{ linkId: 'child-field', text: 'Child Field' }]
        },
        {
          linkId: 'repeat-group',
          text: 'Repeat Group',
          item: [{ linkId: 'child-field', text: 'Child Field' }]
        }
      ]
    };

    const invalidItems = validateForm(questionnaire, response);

    expect(invalidItems['child-field///0']).toBeDefined();
    expect(invalidItems['child-field///1']).toBeDefined();
    expect(invalidItems['child-field']).toBeUndefined();
  });

  it('flags nothing when all instances are answered', () => {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'repeat-group',
          text: 'Repeat Group',
          item: [{ linkId: 'child-field', text: 'Child Field', answer: [{ valueString: 'a' }] }]
        },
        {
          linkId: 'repeat-group',
          text: 'Repeat Group',
          item: [{ linkId: 'child-field', text: 'Child Field', answer: [{ valueString: 'b' }] }]
        }
      ]
    };

    const invalidItems = validateForm(questionnaire, response);
    expect(Object.keys(invalidItems)).toHaveLength(0);
  });
});
