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
  otherExpressionsUpdated: boolean;
  updatedFhirPathContext: Record<string, any>;
  updatedFhirPathTerminologyCache: Record<string, any>;
  updatedTargetConstraints: Record<string, TargetConstraint>;
  updatedEnableWhenExpressions: EnableWhenExpressions;
  updatedAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  updatedProcessedValueSets: Record<string, any>;
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
      otherExpressionsUpdated: false,
      updatedFhirPathContext: existingFhirPathContext,
      updatedFhirPathTerminologyCache: existingFhirPathTerminologyCache,
      updatedTargetConstraints: targetConstraints,
      updatedEnableWhenExpressions: enableWhenExpressions,
      updatedAnswerOptionsToggleExpressions: answerOptionsToggleExpressions,
      updatedProcessedValueSets: processedValueSets,
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
  // Add generated computed answers to computedQRItemUpdates
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
  // Add generated computed answers to computedQRItemUpdates
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

  const otherExpressionsUpdated =
    targetConstraintsUpdated ||
    enableWhenExpressionsUpdated ||
    answerOptionsToggleExpressionsUpdated ||
    processedValueSetsUpdated;

  return {
    otherExpressionsUpdated,
    updatedFhirPathContext,
    updatedFhirPathTerminologyCache,
    updatedTargetConstraints,
    updatedAnswerOptionsToggleExpressions,
    updatedEnableWhenExpressions,
    updatedProcessedValueSets,
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
      const cacheKey = JSON.stringify(variable.expression); // Use expression as cache key
      if (fhirPathTerminologyCache[cacheKey]) {
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
        fhirPathContext[`${variable.name}`] = await handleFhirPathResult(fhirPathResult);

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          fhirPathTerminologyCache[cacheKey] = fhirPathContext[`${variable.name}`];
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
      const cacheKey = JSON.stringify(variable.expression); // Use expression as cache key
      if (fhirPathTerminologyCache[cacheKey]) {
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

        fhirPathContext[`${variable.name}`] = await handleFhirPathResult(fhirPathResult);

        // If fhirPathResult is an async terminology call, cache the result
        if (fhirPathResult instanceof Promise) {
          fhirPathTerminologyCache[cacheKey] = fhirPathContext[`${variable.name}`];
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
