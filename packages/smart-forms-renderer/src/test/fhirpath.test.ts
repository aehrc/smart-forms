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
  createFhirPathContext,
  evaluateLinkIdVariables,
  evaluateQuestionnaireLevelVariables,
  handleFhirPathResult
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
