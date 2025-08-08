/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import type { QuestionnaireItem } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import { getUpdatableValueSetUrl } from '../hooks/useDynamicValueSetEffect';

const processedValueSets: Record<string, ProcessedValueSet> = {
  'http://hl7.org/fhir/ValueSet/address-use': {
    initialValueSetUrl: 'http://hl7.org/fhir/ValueSet/address-use',
    updatableValueSetUrl: 'http://hl7.org/fhir/ValueSet/address-use',
    bindingParameters: [],
    isDynamic: false,
    linkIds: ['id-1']
  },
  'http://hl7.org/fhir/ValueSet/activity-definition-category': {
    initialValueSetUrl: 'http://hl7.org/fhir/ValueSet/activity-definition-category',
    updatableValueSetUrl: 'http://hl7.org/fhir/ValueSet/activity-definition-category',
    bindingParameters: [],
    isDynamic: false,
    linkIds: ['id-3']
  }
};

describe('getUpdatableValueSetUrl (real data)', () => {
  it('returns updatableValueSetUrl from calculatedExpressions for id-3', () => {
    const qItem: QuestionnaireItem = {
      type: 'choice',
      linkId: 'id-3',
      answerValueSet: 'http://hl7.org/fhir/ValueSet/activity-definition-category'
    };
    const calculatedExpressions: Record<string, CalculatedExpression[]> = {
      'id-3': [
        {
          expression:
            "iif(%resource.descendants().where(linkId = 'id-1').answer.first().value.code = 'home', 'http://hl7.org/fhir/ValueSet/action-type')",
          from: 'item._answerValueSet',
          value: 'http://hl7.org/fhir/ValueSet/action-type'
        }
      ]
    };

    const result = getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets);
    expect(result).toBe('http://hl7.org/fhir/ValueSet/action-type');
  });

  it('falls back to processedValueSets when no calculatedExpression exists (id-1)', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'id-1',
      type: 'choice',
      answerValueSet: 'http://hl7.org/fhir/ValueSet/address-use'
    };
    const calculatedExpressions: Record<string, CalculatedExpression[]> = {};

    const result = getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets);
    expect(result).toBe('http://hl7.org/fhir/ValueSet/address-use');
  });

  it('returns empty string if no expression and answerValueSet is unknown', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'id-4',
      type: 'choice',
      answerValueSet: 'https://nzhts.digital.health.nz/fhir/ValueSet/unknown'
    };
    const calculatedExpressions: Record<string, CalculatedExpression[]> = {};

    const result = getUpdatableValueSetUrl(qItem, calculatedExpressions, processedValueSets);
    expect(result).toBe('');
  });
});
