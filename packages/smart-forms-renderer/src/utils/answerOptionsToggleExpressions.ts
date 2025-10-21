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

import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import {
  cacheTerminologyResult,
  createFhirPathContext,
  handleFhirPathResult,
  isExpressionCached
} from './fhirpath';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { Variables } from '../interfaces';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import type { ComputedNewAnswers } from '../interfaces/computedUpdates.interface';

interface EvaluateInitialAnswerOptionsToggleExpressionsParams {
  initialResponse: QuestionnaireResponse;
  initialResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  variables: Variables;
  existingFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  terminologyServerUrl: string;
}

export async function evaluateInitialAnswerOptionsToggleExpressions(
  params: EvaluateInitialAnswerOptionsToggleExpressionsParams
): Promise<{
  initialAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  updatedFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
}> {
  const {
    initialResponse,
    initialResponseItemMap,
    answerOptionsToggleExpressions,
    variables,
    existingFhirPathContext,
    terminologyServerUrl
  } = params;
  let { fhirPathTerminologyCache } = params;

  const fhirPathEvalResult = await createFhirPathContext(
    initialResponse,
    initialResponseItemMap,
    variables,
    existingFhirPathContext,
    fhirPathTerminologyCache,
    terminologyServerUrl
  );
  const updatedFhirPathContext = fhirPathEvalResult.fhirPathContext;
  fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;

  for (const linkId in answerOptionsToggleExpressions) {
    const itemAnswerOptionsToggleExpressions = answerOptionsToggleExpressions[linkId];

    for (const itemAnswerOptionsToggleExpression of itemAnswerOptionsToggleExpressions) {
      const initialValue = itemAnswerOptionsToggleExpression.isEnabled;
      const expression = itemAnswerOptionsToggleExpression.valueExpression?.expression;
      if (!expression) {
        continue;
      }

      if (isExpressionCached(expression, fhirPathTerminologyCache)) {
        continue;
      }

      try {
        const fhirPathResult = fhirpath.evaluate(
          {},
          expression,
          updatedFhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl
          }
        );
        const result = await handleFhirPathResult(fhirPathResult);

        // Update answerOptionsToggleExpression if length of result array > 0
        // Only update when current isEnabled value is different from the result, otherwise it will result in am infinite loop as per #733
        if (result.length > 0 && initialValue !== result[0] && typeof result[0] === 'boolean') {
          itemAnswerOptionsToggleExpression.isEnabled = result[0];
        }

        // Update isEnabled value to false if no result is returned
        if (result.length === 0 && initialValue !== false) {
          itemAnswerOptionsToggleExpression.isEnabled = false;
        }

        // handle intersect edge case - evaluate() returns empty array if result is false
        if (expression.includes('intersect') && result.length === 0 && initialValue !== false) {
          itemAnswerOptionsToggleExpression.isEnabled = false;
        }

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          cacheTerminologyResult(expression, result, fhirPathTerminologyCache);
        }
      } catch (e) {
        console.warn(
          e.message,
          `AnswerOptionsToggleExpression LinkId: ${linkId}\nExpression: ${expression}`
        );
      }
    }
  }

  return {
    initialAnswerOptionsToggleExpressions: answerOptionsToggleExpressions,
    updatedFhirPathContext,
    fhirPathTerminologyCache
  };
}

export async function evaluateAnswerOptionsToggleExpressions(
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>,
  terminologyServerUrl: string
): Promise<{
  isUpdated: boolean;
  updatedAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  computedNewAnswers: ComputedNewAnswers;
}> {
  let isUpdated = false;
  const computedNewAnswers: ComputedNewAnswers = {};
  for (const linkId in answerOptionsToggleExpressions) {
    const itemAnswerOptionsToggleExpressions = answerOptionsToggleExpressions[linkId];
    for (const itemAnswerOptionsToggleExpression of itemAnswerOptionsToggleExpressions) {
      const initialValue = itemAnswerOptionsToggleExpression.isEnabled;
      const expression = itemAnswerOptionsToggleExpression.valueExpression?.expression;
      if (!expression) {
        continue;
      }

      if (isExpressionCached(expression, fhirPathTerminologyCache)) {
        continue;
      }

      try {
        const fhirPathResult = fhirpath.evaluate(
          {},
          expression,
          fhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl
          }
        );
        const result = await handleFhirPathResult(fhirPathResult);

        // Update targetConstraints if length of result array > 0
        // Only update when current isEnabled value is different from the result, otherwise it will result in am infinite loop as per #733
        if (result.length > 0 && initialValue !== result[0] && typeof result[0] === 'boolean') {
          itemAnswerOptionsToggleExpression.isEnabled = result[0];
          isUpdated = true;
          computedNewAnswers[linkId] = null;
        }

        // Update isEnabled value to false if no result is returned
        if (result.length === 0 && initialValue !== false) {
          itemAnswerOptionsToggleExpression.isEnabled = false;
          isUpdated = true;
          computedNewAnswers[linkId] = null;
        }

        // handle intersect edge case - evaluate() returns empty array if result is false
        if (expression.includes('intersect') && result.length === 0 && initialValue !== false) {
          itemAnswerOptionsToggleExpression.isEnabled = false;
          isUpdated = true;
          computedNewAnswers[linkId] = null;
        }

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          cacheTerminologyResult(expression, result, fhirPathTerminologyCache);
        }
      } catch (e) {
        console.warn(
          e.message,
          `AnswerOptionsToggleExpression LinkId: ${linkId}\nExpression: ${expression}`
        );
      }
    }
  }

  return {
    isUpdated,
    updatedAnswerOptionsToggleExpressions: answerOptionsToggleExpressions,
    computedNewAnswers
  };
}
