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

import {
  addEmptyXFhirQueryVariablesToFhirPathContext,
  cacheTerminologyResult,
  createFhirPathContext,
  evaluateLinkIdVariables,
  evaluateQuestionnaireLevelVariables,
  handleFhirPathResult,
  isExpressionCached
} from '../utils/fhirpath';
import {
  BMICalculationExistingFhirPathContext,
  BMICalculationItemMap,
  BMICalculationResultingFhirPathContext,
  BMICalculationVariables,
  QRBMICalculation
} from './data/fhirpath-bmi-calculation-data';
import type { Expression, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { Variables } from '../interfaces';

describe('createFhirPathContext', () => {
  const questionnaireResponse: QuestionnaireResponse = QRBMICalculation;
  const questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]> =
    BMICalculationItemMap;
  const variables: Variables = BMICalculationVariables;
  const existingFhirPathContext: Record<string, any> = BMICalculationExistingFhirPathContext;
  const existingFhirPathTerminologyCache: Record<string, any> = {};
  const terminologyServerUrl = 'https://example.com/terminology/fhir';

  const resultingFhirPathContext = BMICalculationResultingFhirPathContext;

  it('creates a FHIR Path context with correct resources and variables', async () => {
    const result = await createFhirPathContext(
      questionnaireResponse,
      questionnaireResponseItemMap,
      variables,
      existingFhirPathContext,
      existingFhirPathTerminologyCache,
      terminologyServerUrl
    );

    expect(result).toHaveProperty('fhirPathContext');
    expect(result).toHaveProperty('fhirPathTerminologyCache');

    const { fhirPathContext: outputFhirPathContext } = result;

    // Check the base properties
    expect(outputFhirPathContext.resource).toEqual(questionnaireResponse);
    expect(outputFhirPathContext.rootResource).toEqual(questionnaireResponse);

    // Check that output FHIRPath context matches the expected resulting FHIRPath context
    expect(outputFhirPathContext).toStrictEqual(resultingFhirPathContext);

    // Verify that fhirPathContext contains evaluated variables and their values
    expect(outputFhirPathContext).toHaveProperty('height');
    expect(outputFhirPathContext).toHaveProperty('weight');
    expect(outputFhirPathContext.height).toEqual([163]);
    expect(outputFhirPathContext.weight).toEqual([77.3]);
  });

  it('processes empty questionnaireResponseItemMap gracefully', async () => {
    const result = await createFhirPathContext(
      questionnaireResponse,
      {},
      variables,
      {},
      {},
      terminologyServerUrl
    );

    expect(result.fhirPathContext.resource).toEqual(questionnaireResponse);
    expect(result.fhirPathTerminologyCache).toBeDefined();
  });
});

describe('addEmptyXFhirQueryVariablesToFhirPathContext', () => {
  const xFhirQueryVars = {
    xHeight: {
      valueExpression: {
        name: 'height',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    xWeight: {
      valueExpression: {
        name: 'weight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  };

  it('adds empty arrays for missing x-fhir-query variables', () => {
    const context = { foo: 42 };
    const result = addEmptyXFhirQueryVariablesToFhirPathContext({ ...context }, xFhirQueryVars);
    expect(result).toEqual({
      foo: 42,
      xHeight: [],
      xWeight: []
    });
  });

  it('does not overwrite existing keys in context', () => {
    const context = { xHeight: ['already set'], foo: 99 };
    const result = addEmptyXFhirQueryVariablesToFhirPathContext({ ...context }, xFhirQueryVars);
    expect(result.xHeight).toEqual(['already set']);
    expect(result.xWeight).toEqual([]);
    expect(result.foo).toEqual(99);
  });

  it('returns the same context object (mutates in place)', () => {
    const context = {};
    const result = addEmptyXFhirQueryVariablesToFhirPathContext(context, xFhirQueryVars);
    expect(result).toBe(context); // Same object reference
  });

  it('returns context unchanged if all variables are already present', () => {
    const context = { xHeight: [], xWeight: [] };
    const result = addEmptyXFhirQueryVariablesToFhirPathContext(context, xFhirQueryVars);
    expect(result).toEqual({ xHeight: [], xWeight: [] });
  });

  it('works with empty variablesXFhirQuery', () => {
    const context = { foo: 1 };
    const result = addEmptyXFhirQueryVariablesToFhirPathContext(context, {});
    expect(result).toEqual({ foo: 1 });
  });
});

describe('evaluateLinkIdVariables', () => {
  const terminologyServerUrl = 'https://example.com/terminology/fhir';

  it('evaluates a qrItem and sets it in context', async () => {
    const variablesFhirPath: Record<string, any[]> = {
      testLink: [
        {
          name: 'testLinkValue',
          language: 'text/fhirpath',
          expression: "item.where(linkId='testLink').answer.value"
        }
      ]
    };

    const result = await evaluateLinkIdVariables(
      'testLink',
      variablesFhirPath,
      {},
      {},
      terminologyServerUrl,
      {
        linkId: 'testLink-container',
        item: [
          {
            linkId: 'testLink',
            answer: [{ valueString: 'Test Value' }]
          }
        ]
      }
    );

    expect(result.fhirPathContext.testLinkValue).toEqual(['Test Value']);
    expect(result.fhirPathTerminologyCache).toEqual({});
  });

  it('evaluates a linkId variable and sets it in context', async () => {
    const variablesFhirPath: Record<string, any[]> = {
      testLink: [
        {
          name: 'randomSum',
          language: 'text/fhirpath',
          expression: '1+2'
        }
      ]
    };

    const result = await evaluateLinkIdVariables(
      'testLink',
      variablesFhirPath,
      {},
      {},
      terminologyServerUrl
    );

    expect(result.fhirPathContext.randomSum).toEqual([3]);
    expect(result.fhirPathTerminologyCache).toEqual({});
  });
});

describe('evaluateQuestionnaireLevelVariables', () => {
  const terminologyServerUrl = 'https://example.com/terminology/fhir';

  it('evaluates a Questionnaire-level variable and sets it in context', async () => {
    const variablesFhirPath: Record<string, Expression[]> = {
      QuestionnaireLevel: [
        {
          name: 'randomSum',
          language: 'text/fhirpath',
          expression: '1+2'
        }
      ]
    };

    const result = await evaluateQuestionnaireLevelVariables(
      {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      },
      variablesFhirPath,
      {},
      {},
      terminologyServerUrl
    );

    expect(result.fhirPathContext.randomSum).toEqual([3]);
    expect(result.fhirPathTerminologyCache).toEqual({});
  });
});

describe('handleFhirPathResult', () => {
  it('awaits and returns the resolved value if input is a Promise', async () => {
    const asyncResult = Promise.resolve(['value1', 'value2']);
    const result = await handleFhirPathResult(asyncResult);
    expect(result).toEqual(['value1', 'value2']);
  });

  it('returns the array directly if input is not a Promise', async () => {
    const syncResult = ['valueA', 'valueB'];
    const result = await handleFhirPathResult(syncResult);
    expect(result).toEqual(['valueA', 'valueB']);
  });
});

describe('isExpressionCached', () => {
  it('returns false for expression containing %', () => {
    expect(
      isExpressionCached('%resource.memberOf(url)', { '%resource.memberOf(url)': [true] })
    ).toBe(false);
  });

  it('returns true when expression-only key is in cache', () => {
    expect(isExpressionCached('memberOf(url)', { 'memberOf(url)': [true] })).toBe(true);
  });

  it('returns false when expression is not in cache', () => {
    expect(isExpressionCached('memberOf(url)', {})).toBe(false);
  });

  it('returns true when compound key (expression + focusNode) is in cache', () => {
    const focusNode = { answer: [{ valueString: 'A' }] };
    const key = `memberOf(url)|${JSON.stringify(focusNode)}`;
    expect(isExpressionCached('memberOf(url)', { [key]: [true] }, focusNode)).toBe(true);
  });

  it('returns false when focusNode differs from the cached one', () => {
    const cachedFocus = { answer: [{ valueString: 'A' }] };
    const newFocus = { answer: [{ valueString: 'B' }] };
    const key = `memberOf(url)|${JSON.stringify(cachedFocus)}`;
    expect(isExpressionCached('memberOf(url)', { [key]: [true] }, newFocus)).toBe(false);
  });

  it('misses cache when focusNode is provided but only the expression-only key exists', () => {
    const focusNode = { answer: [{ valueString: 'A' }] };
    expect(isExpressionCached('memberOf(url)', { 'memberOf(url)': [true] }, focusNode)).toBe(false);
  });
});

describe('cacheTerminologyResult', () => {
  it('skips caching for expressions with %', () => {
    const cache: Record<string, any> = {};
    cacheTerminologyResult('%resource.memberOf(url)', [true], cache);
    expect(cache).toEqual({});
  });

  it('stores result under expression key when no focusNode', () => {
    const cache: Record<string, any> = {};
    cacheTerminologyResult('memberOf(url)', [true], cache);
    expect(cache).toEqual({ 'memberOf(url)': [true] });
  });

  it('stores result under compound key when focusNode is provided', () => {
    const cache: Record<string, any> = {};
    const focusNode = { answer: [{ valueString: 'A' }] };
    cacheTerminologyResult('memberOf(url)', [true], cache, focusNode);
    const expectedKey = `memberOf(url)|${JSON.stringify(focusNode)}`;
    expect(cache).toEqual({ [expectedKey]: [true] });
  });
});

describe('evaluateLinkIdVariables - stale cache prevention', () => {
  const terminologyServerUrl = 'https://example.com/terminology/fhir';
  const expression = 'answer.value';
  const variablesFhirPath: Record<string, any[]> = {
    'item-link': [{ name: 'myVar', language: 'text/fhirpath', expression }]
  };

  it('re-evaluates when qrItem changes, preventing stale async cache results', async () => {
    const qrItemA = { linkId: 'item-link', answer: [{ valueString: 'A' }] };
    const qrItemB = { linkId: 'item-link', answer: [{ valueString: 'B' }] };

    // Simulate a previously cached async terminology result for qrItemA
    const cacheKeyA = `${expression}|${JSON.stringify(qrItemA)}`;
    const terminologyCache: Record<string, any> = { [cacheKeyA]: ['A'] };

    // Evaluate with qrItemB - compound key is different, so cache should miss
    const result = await evaluateLinkIdVariables(
      'item-link',
      variablesFhirPath,
      { myVar: ['A'] }, // stale context from previous eval with qrItemA
      terminologyCache,
      terminologyServerUrl,
      qrItemB
    );

    // Should re-evaluate with qrItemB's answer, not return stale 'A'
    expect(result.fhirPathContext.myVar).toEqual(['B']);
  });

  it('skips re-evaluation when qrItem is unchanged (valid cache hit)', async () => {
    const qrItem = { linkId: 'item-link', answer: [{ valueString: 'A' }] };

    // Simulate a previously cached async terminology result for this qrItem
    const cacheKey = `${expression}|${JSON.stringify(qrItem)}`;
    const terminologyCache: Record<string, any> = { [cacheKey]: ['A'] };

    // Evaluate with the same qrItem - compound key matches, should hit cache
    const result = await evaluateLinkIdVariables(
      'item-link',
      variablesFhirPath,
      { myVar: ['A'] }, // context already has correct value
      terminologyCache,
      terminologyServerUrl,
      qrItem
    );

    // Cache hit - fhirPathContext keeps the existing value
    expect(result.fhirPathContext.myVar).toEqual(['A']);
  });
});
