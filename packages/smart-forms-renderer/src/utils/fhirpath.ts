/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpressions } from '../interfaces/enableWhen.interface';
import { evaluateEnableWhenExpressions } from './enableWhenExpression';
import { evaluateCalculatedExpressions } from './calculatedExpression';
import { evaluateTargetConstraints } from './targetConstraint';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import type { Variables, VariableXFhirQuery } from '../interfaces';
import { evaluateDynamicValueSets } from './parameterisedValueSets';
import { ComputedQRItemUpdates } from '../interfaces/computedUpdates.interface';

interface EvaluateUpdatedExpressionsParams {
  updatedResponse: QuestionnaireResponse;
  updatedResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  targetConstraints: Record<string, TargetConstraint>;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  enableWhenExpressions: EnableWhenExpressions;
  variables: Variables;
  processedValueSets: Record<string, any>;
  existingFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  terminologyServerUrl: string;
}

export async function evaluateUpdatedExpressions(
  params: EvaluateUpdatedExpressionsParams
): Promise<{
  isUpdated: boolean;
  updatedTargetConstraints: Record<string, TargetConstraint>;
  updatedEnableWhenExpressions: EnableWhenExpressions;
  updatedCalculatedExpressions: Record<string, CalculatedExpression[]>;
  updatedProcessedValueSets: Record<string, any>;
  updatedFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  computedQRItemUpdates: ComputedQRItemUpdates;
}> {
  const {
    updatedResponse,
    updatedResponseItemMap,
    targetConstraints,
    enableWhenExpressions,
    calculatedExpressions,
    processedValueSets,
    variables,
    existingFhirPathContext,
    terminologyServerUrl
  } = params;
  let { fhirPathTerminologyCache } = params;

  const noExpressionsToBeUpdated =
    Object.keys(enableWhenExpressions).length === 0 &&
    Object.keys(calculatedExpressions).length === 0;
  if (noExpressionsToBeUpdated) {
    return {
      isUpdated: false,
      updatedTargetConstraints: targetConstraints,
      updatedEnableWhenExpressions: enableWhenExpressions,
      updatedCalculatedExpressions: calculatedExpressions,
      updatedProcessedValueSets: processedValueSets,
      updatedFhirPathContext: existingFhirPathContext,
      fhirPathTerminologyCache,
      computedQRItemUpdates: {}
    };
  }

  let computedQRItemUpdates: ComputedQRItemUpdates = {};
  const fhirPathEvalResult = await createFhirPathContext(
    updatedResponse,
    updatedResponseItemMap,
    variables,
    existingFhirPathContext,
    fhirPathTerminologyCache,
    terminologyServerUrl
  );

  const updatedFhirPathContext = fhirPathEvalResult.fhirPathContext;
  fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;

  // Update targetConstraints
  const { targetConstraintsIsUpdated, updatedTargetConstraints } = await evaluateTargetConstraints(
    updatedFhirPathContext,
    fhirPathTerminologyCache,
    targetConstraints,
    terminologyServerUrl
  );

  // Update enableWhenExpressions
  const { enableWhenExpsIsUpdated, updatedEnableWhenExpressions } =
    await evaluateEnableWhenExpressions(
      updatedFhirPathContext,
      fhirPathTerminologyCache,
      enableWhenExpressions,
      terminologyServerUrl
    );

  // Update calculatedExpressions
  const { calculatedExpsIsUpdated, updatedCalculatedExpressions } =
    await evaluateCalculatedExpressions(
      updatedFhirPathContext,
      fhirPathTerminologyCache,
      calculatedExpressions,
      terminologyServerUrl
    );

  // Update dynamic value sets
  const {
    processedValueSetsIsUpdated,
    updatedProcessedValueSets,
    computedNewAnswers: computedNewAnswersDynamicValueSets
  } = await evaluateDynamicValueSets(
    updatedFhirPathContext,
    fhirPathTerminologyCache,
    processedValueSets,
    terminologyServerUrl
  );

  // Have a process here to find their QRItems and assign updates based on the computedNewAnswers
  // In the case of dynamic value sets, just clear the existing answers
  // Eventually we want to expand this to calculatedExpressions
  for (const linkId in computedNewAnswersDynamicValueSets) {
    computedQRItemUpdates[linkId] = null;
  }

  const isUpdated =
    enableWhenExpsIsUpdated ||
    calculatedExpsIsUpdated ||
    targetConstraintsIsUpdated ||
    processedValueSetsIsUpdated;

  return {
    isUpdated,
    updatedTargetConstraints,
    updatedEnableWhenExpressions,
    updatedCalculatedExpressions,
    updatedProcessedValueSets,
    updatedFhirPathContext,
    fhirPathTerminologyCache,
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
    // For non-repeat groups, the same linkId will have only one item
    // For repeat groups, the same linkId will have multiple items
    for (const qrItem of questionnaireResponseItemMap[linkId]) {
      const fhirpathEvalResult = await evaluateLinkIdVariables(
        qrItem,
        variablesFhirPath,
        fhirPathContext,
        fhirPathTerminologyCache,
        terminologyServerUrl
      );
      fhirPathContext = fhirpathEvalResult.fhirPathContext;
      fhirPathTerminologyCache = fhirpathEvalResult.fhirPathTerminologyCache;
    }
  }

  // Items don't exist in questionnaireResponseItemMap, but we still have to add them into the fhirPathContext as empty arrays
  const qrItemMapIsEmpty = Object.keys(questionnaireResponseItemMap).length === 0;
  for (const linkId in variablesFhirPath) {
    fhirPathContext = addEmptyLinkIdVariables(
      linkId,
      variablesFhirPath,
      fhirPathContext,
      qrItemMapIsEmpty
    );
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
  item: QuestionnaireResponseItem,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  terminologyServerUrl: string
) {
  const linkIdVariables = variablesFhirPath[item.linkId];
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
          item,
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
        console.warn(e.message, `LinkId: ${item.linkId}\nExpression: ${variable.expression}`);
      }
    }
  }

  return { fhirPathContext, fhirPathTerminologyCache };
}

export function addEmptyLinkIdVariables(
  linkId: string,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>,
  qrItemMapIsEmpty: boolean
) {
  const linkIdVariables = variablesFhirPath[linkId];
  if (!linkIdVariables || linkIdVariables.length === 0) {
    return fhirPathContext;
  }

  for (const variable of linkIdVariables) {
    if (variable.expression && variable.name) {
      // If the variable is not evaluated, add it as an empty array
      // Also, when questionnaireResponseItemMap is empty, no items exist in the questionnaireResponse, therefore no variables are evaluated
      if (fhirPathContext[`${variable.name}`] === undefined || qrItemMapIsEmpty) {
        fhirPathContext[`${variable.name}`] = [];
      }
    }
  }

  return fhirPathContext;
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
