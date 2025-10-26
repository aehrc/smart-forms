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

import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { Expression, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { EnableWhenExpressions } from '../interfaces/enableWhen.interface';
import { evaluateEnableWhenExpressions } from './enableWhenExpression';
import { evaluateTargetConstraints } from './targetConstraint';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import type { Variables, VariableXFhirQuery } from '../interfaces';
import { evaluateDynamicValueSets } from './parameterisedValueSets';
import type { ComputedQRItemUpdates } from '../interfaces/computedUpdates.interface';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import { evaluateAnswerOptionsToggleExpressions } from './answerOptionsToggleExpressions';

interface ExpressionUpdate<T> {
  isUpdated: boolean;
  value: T;
}

export async function evaluateOtherExpressions(
  updatedResponse: QuestionnaireResponse,
  updatedResponseItemMap: Record<string, QuestionnaireResponseItem[]>,
  variables: Variables,
  existingFhirPathContext: Record<string, any>,
  existingFhirPathTerminologyCache: Record<string, any>,
  targetConstraints: Record<string, TargetConstraint>,
  enableWhenExpressions: EnableWhenExpressions,
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>,
  processedValueSets: Record<string, any>,
  terminologyServerUrl: string
): Promise<{
  updatedFhirPathContext: Record<string, any>;
  updatedFhirPathTerminologyCache: Record<string, any>;
  targetConstraintsUpdate: ExpressionUpdate<Record<string, TargetConstraint>>;
  enableWhenExpressionsUpdate: ExpressionUpdate<EnableWhenExpressions>;
  answerOptionsToggleExpressionsUpdate: ExpressionUpdate<
    Record<string, AnswerOptionsToggleExpression[]>
  >;
  processedValueSetsUpdate: ExpressionUpdate<Record<string, any>>;
  computedQRItemUpdates: ComputedQRItemUpdates;
}> {
  // Performance check: Check if there are any expressions to be updated before proceeding with eval logic
  const noExpressionsToBeUpdated =
    Object.keys(targetConstraints).length === 0 &&
    Object.keys(enableWhenExpressions).length === 0 &&
    Object.keys(answerOptionsToggleExpressions).length === 0 &&
    Object.keys(processedValueSets).length === 0;

  if (noExpressionsToBeUpdated) {
    return {
      updatedFhirPathContext: existingFhirPathContext,
      updatedFhirPathTerminologyCache: existingFhirPathTerminologyCache,
      targetConstraintsUpdate: {
        isUpdated: false,
        value: targetConstraints
      },
      enableWhenExpressionsUpdate: {
        isUpdated: false,
        value: enableWhenExpressions
      },
      answerOptionsToggleExpressionsUpdate: {
        isUpdated: false,
        value: answerOptionsToggleExpressions
      },
      processedValueSetsUpdate: {
        isUpdated: false,
        value: processedValueSets
      },
      computedQRItemUpdates: {}
    };
  }

  // Create a new fhirPathContext based on the updated response and variables
  const computedQRItemUpdates: ComputedQRItemUpdates = {};
  const {
    fhirPathContext: updatedFhirPathContext,
    fhirPathTerminologyCache: updatedFhirPathTerminologyCache
  } = await createFhirPathContext(
    updatedResponse,
    updatedResponseItemMap,
    variables,
    existingFhirPathContext,
    existingFhirPathTerminologyCache,
    terminologyServerUrl
  );

  // Update targetConstraints
  const { isUpdated: targetConstraintsUpdated, updatedTargetConstraints } =
    await evaluateTargetConstraints(
      updatedFhirPathContext,
      updatedFhirPathTerminologyCache,
      targetConstraints,
      terminologyServerUrl
    );

  // Update enableWhenExpressions
  const { isUpdated: enableWhenExpressionsUpdated, updatedEnableWhenExpressions } =
    await evaluateEnableWhenExpressions(
      updatedFhirPathContext,
      updatedFhirPathTerminologyCache,
      enableWhenExpressions,
      terminologyServerUrl
    );

  // Update answerOptionsToggleExpressions
  // Add generated computed answers to computedQRItemUpdates - clear the item because the previous answers may no longer be valid
  const {
    isUpdated: answerOptionsToggleExpressionsUpdated,
    updatedAnswerOptionsToggleExpressions,
    computedNewAnswers: computedNewAnswersAnswerOptionsToggleExpressions
  } = await evaluateAnswerOptionsToggleExpressions(
    updatedFhirPathContext,
    updatedFhirPathTerminologyCache,
    answerOptionsToggleExpressions,
    terminologyServerUrl
  );

  for (const linkId in computedNewAnswersAnswerOptionsToggleExpressions) {
    computedQRItemUpdates[linkId] = null;
  }

  // Update dynamic value sets
  // Add generated computed answers to computedQRItemUpdates - clear the item because the previous answers may no longer be valid
  const {
    isUpdated: processedValueSetsUpdated,
    updatedProcessedValueSets,
    computedNewAnswers: computedNewAnswersDynamicValueSets
  } = await evaluateDynamicValueSets(
    updatedFhirPathContext,
    updatedFhirPathTerminologyCache,
    processedValueSets,
    terminologyServerUrl
  );

  for (const linkId in computedNewAnswersDynamicValueSets) {
    computedQRItemUpdates[linkId] = null;
  }

  return {
    updatedFhirPathContext,
    updatedFhirPathTerminologyCache,
    targetConstraintsUpdate: {
      isUpdated: targetConstraintsUpdated,
      value: updatedTargetConstraints
    },
    enableWhenExpressionsUpdate: {
      isUpdated: enableWhenExpressionsUpdated,
      value: updatedEnableWhenExpressions
    },
    answerOptionsToggleExpressionsUpdate: {
      isUpdated: answerOptionsToggleExpressionsUpdated,
      value: updatedAnswerOptionsToggleExpressions
    },
    processedValueSetsUpdate: {
      isUpdated: processedValueSetsUpdated,
      value: updatedProcessedValueSets
    },
    computedQRItemUpdates
  };
}

export async function createFhirPathContext(
  questionnaireResponse: QuestionnaireResponse,
  questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]>,
  variables: Variables,
  existingFhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  terminologyServerUrl: string
): Promise<{
  fhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
}> {
  const { fhirPathVariables: variablesFhirPath, xFhirQueryVariables: variablesXFhirQuery } =
    variables;

  // Add latest resource to fhirPathContext
  let fhirPathContext: Record<string, any> = {
    ...existingFhirPathContext,
    resource: questionnaireResponse,
    rootResource: questionnaireResponse
  };

  // Add empty x-fhir-query variables to fhirPathContext to prevent false-positive warnings
  fhirPathContext = addEmptyXFhirQueryVariablesToFhirPathContext(
    fhirPathContext,
    variablesXFhirQuery
  );

  // Evaluate resource-level variables
  const fhirPathEvalResult = await evaluateQuestionnaireLevelVariables(
    questionnaireResponse,
    variablesFhirPath,
    fhirPathContext,
    fhirPathTerminologyCache,
    terminologyServerUrl
  );
  fhirPathContext = fhirPathEvalResult.fhirPathContext;
  fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;

  // Add variables of items that exist in questionnaireResponseItemMap into fhirPathContext
  for (const linkId in questionnaireResponseItemMap) {
    const qrItems = questionnaireResponseItemMap[linkId] ?? [];

    // Ensure at least one iteration even if qrItems is empty
    const qrItemsToProcess = qrItems.length > 0 ? qrItems : [undefined];

    // For non-repeat groups, the same linkId will have only one item
    // For repeat groups, the same linkId will have multiple items
    for (const qrItem of qrItemsToProcess) {
      const fhirPathEvalResult = await evaluateLinkIdVariables(
        linkId,
        variablesFhirPath,
        fhirPathContext,
        fhirPathTerminologyCache,
        terminologyServerUrl,
        qrItem
      );
      fhirPathContext = fhirPathEvalResult.fhirPathContext;
      fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;
    }
  }

  return { fhirPathContext, fhirPathTerminologyCache };
}

export function addEmptyXFhirQueryVariablesToFhirPathContext(
  fhirPathContext: Record<string, any>,
  variablesXFhirQuery: Record<string, VariableXFhirQuery>
) {
  for (const variableName in variablesXFhirQuery) {
    if (!fhirPathContext[variableName]) {
      fhirPathContext[variableName] = [];
    }
  }

  return fhirPathContext;
}

export async function evaluateLinkIdVariables(
  linkId: string,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  terminologyServerUrl: string,
  qrItem?: QuestionnaireResponseItem
) {
  const linkIdVariables = variablesFhirPath[linkId];
  if (!linkIdVariables || linkIdVariables.length === 0) {
    return { fhirPathContext, fhirPathTerminologyCache };
  }

  for (const variable of linkIdVariables) {
    if (variable.expression && variable.name) {
      if (isExpressionCached(variable.expression, fhirPathTerminologyCache)) {
        continue;
      }

      try {
        const fhirPathResult = fhirpath.evaluate(
          qrItem ?? {},
          {
            base: 'QuestionnaireResponse.item',
            expression: variable.expression
          },
          fhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl
          }
        );
        const result = await handleFhirPathResult(fhirPathResult);
        fhirPathContext[`${variable.name}`] = result;

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          cacheTerminologyResult(variable.expression, result, fhirPathTerminologyCache);
        }
      } catch (e) {
        console.warn(e.message, `LinkId: ${linkId}\nExpression: ${variable.expression}`);
      }
    }
  }

  return { fhirPathContext, fhirPathTerminologyCache };
}

export async function evaluateQuestionnaireLevelVariables(
  resource: QuestionnaireResponse,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  terminologyServerUrl: string
) {
  const questionnaireLevelVariables = variablesFhirPath['QuestionnaireLevel'];
  if (!questionnaireLevelVariables || questionnaireLevelVariables.length === 0) {
    return {
      fhirPathContext,
      fhirPathTerminologyCache
    };
  }

  for (const variable of questionnaireLevelVariables) {
    if (variable.expression) {
      if (isExpressionCached(variable.expression, fhirPathTerminologyCache)) {
        continue;
      }

      try {
        const fhirPathResult = fhirpath.evaluate(
          resource,
          {
            base: 'QuestionnaireResponse',
            expression: variable.expression
          },
          fhirPathContext,
          fhirpath_r4_model,
          {
            async: true,
            terminologyUrl: terminologyServerUrl
          }
        );

        const result = await handleFhirPathResult(fhirPathResult);
        fhirPathContext[`${variable.name}`] = result;

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          cacheTerminologyResult(variable.expression, result, fhirPathTerminologyCache);
        }
      } catch (e) {
        console.warn(e.message, `Questionnaire-level\nExpression: ${variable.expression}`);
      }
    }
  }

  return {
    fhirPathContext,
    fhirPathTerminologyCache
  };
}

export async function handleFhirPathResult(result: any[] | Promise<any[]>) {
  if (result instanceof Promise) {
    return await result;
  }

  return result;
}

/**
 * Determines whether a FHIRPath expression result is cached.
 *
 * Expressions containing variables (e.g. `%something`) are never considered cached, because we can never know what a variable resolves to at runtime.
 *
 * @param {string} expression - The FHIRPath expression to check.
 * @param {Record<string, any>} fhirPathTerminologyCache - Object storing cached expression results.
 * @returns {boolean} `true` if the expression is cached and contains no variables; otherwise `false`.
 */
export function isExpressionCached(
  expression: string,
  fhirPathTerminologyCache: Record<string, any>
): boolean {
  // Expressions with variables are never cached
  if (expression.includes('%')) {
    return false;
  }

  // Check if expression exists in cache
  return Object.prototype.hasOwnProperty.call(fhirPathTerminologyCache, expression);
}

/**
 * Caches the result of a FHIRPath evaluation if it was an asynchronous terminology call and the expression contains no variables (e.g. `%something`).
 *
 * @param {string} expression - The FHIRPath expression that was evaluated.
 * @param {any} result - The evaluated result of the expression with async resolved.
 * @param {Record<string, any>} fhirPathTerminologyCache - The cache object to store results.
 */
export function cacheTerminologyResult(
  expression: string,
  result: any,
  fhirPathTerminologyCache: Record<string, any>
) {
  // Skip caching for expressions with variables
  if (expression.includes('%')) {
    return;
  }

  fhirPathTerminologyCache[expression] = result;
}
