/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { generateExpressionValues } from '../SDCPopulateQuestionnaireOperation/utils/evaluateExpressions';
// @ts-ignore
import initialExpressionsSample from './resources/initial-expressions-sample.json';
// @ts-ignore
import contextSample from './resources/context-sample.json';
import type { InitialExpression } from '../SDCPopulateQuestionnaireOperation/interfaces/expressions.interface';
import type { OperationOutcomeIssue } from 'fhir/r4';

describe('evaluate initial expressions', () => {
  const initialExpressions = initialExpressionsSample as unknown as Record<
    string,
    InitialExpression
  >;
  const context = contextSample;
  const issues: OperationOutcomeIssue[] = [];
  const { evaluatedInitialExpressions } = generateExpressionValues(
    { initialExpressions, itemPopulationContexts: {} },
    context,
    issues
  );

  test('specifying age as key after evaluation should return 88', () => {
    expect(evaluatedInitialExpressions['age']?.value).toEqual([88]);
  });

  test('specifying 29644716-433e-45ec-a805-8043f35a85e1 as key after evaluation should return 180.40555187488803', () => {
    expect(evaluatedInitialExpressions['29644716-433e-45ec-a805-8043f35a85e1']?.value).toEqual([
      180.40555187488803
    ]);
  });
});
