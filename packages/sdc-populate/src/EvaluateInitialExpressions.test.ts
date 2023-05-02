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

import {
  evaluateInitialExpressions,
  findMatchingClosingBracketIndex,
  removeUnimplementedFunction
} from './EvaluateInitialExpressions';
import initialExpressionsSample from './resources/initial-expressions-sample.json';
import contextSample from './resources/context-sample.json';
import type { InitialExpression } from './Interfaces';

describe('evaluate initial expressions', () => {
  const initialExpressions = initialExpressionsSample as unknown as Record<
    string,
    InitialExpression
  >;
  const context = contextSample;

  const evaluatedInitialExpressions = evaluateInitialExpressions(
    initialExpressions,
    context
  ).initialExpressions;

  test('specifying age as key after evaluation should return 87', () => {
    expect(evaluatedInitialExpressions['age']?.value).toEqual([87]);
  });

  test('specifying 29644716-433e-45ec-a805-8043f35a85e1 as key after evaluation should return 180.40555187488803', () => {
    expect(evaluatedInitialExpressions['29644716-433e-45ec-a805-8043f35a85e1']?.value).toEqual([
      180.40555187488803
    ]);
  });
});

describe('remove unimplemented fhirpath function', () => {
  const expression =
    "%PrePopQuery0.entry.resource.select(relationship.coding.display + ' - ' + condition.code.coding.display).join(' ')";

  test('specifying join() function as a unimplemented function should return a expression with join() removed', () => {
    expect(removeUnimplementedFunction(['join'], expression)).toEqual(
      "%PrePopQuery0.entry.resource.select(relationship.coding.display + ' - ' + condition.code.coding.display)"
    );
  });
});

describe('find index of matching closing bracket', () => {
  const expression =
    "%PrePopQuery21.entry.resource.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())";

  test('opening bracket of select() function should return a matching closing bracket index of 162', () => {
    expect(findMatchingClosingBracketIndex(expression, 41)).toEqual(162);
  });

  test('opening bracket of first where() function should return a matching closing bracket index of 87', () => {
    expect(findMatchingClosingBracketIndex(expression, 55)).toEqual(87);
  });

  test('opening bracket of second where() function should return a matching closing bracket index of 136', () => {
    expect(findMatchingClosingBracketIndex(expression, 103)).toEqual(136);
  });

  test('opening bracket of first first() function should return a matching closing bracket index of 143', () => {
    expect(findMatchingClosingBracketIndex(expression, 143)).toEqual(144);
  });
});
