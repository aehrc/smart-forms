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
import { lookupCode } from './calculatedExpression';
import type { Expression, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpressions } from '../interfaces/enableWhen.interface';
import { evaluateEnableWhenExpressions } from './enableWhenExpression';
import { evaluateCalculatedExpressions } from './calculatedExpression';
import { evaluateTargetConstraints } from './targetConstraint';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import type { Variables, VariableXFhirQuery } from '../interfaces';
import { evaluateDynamicValueSets } from './parameterisedValueSets';
import type { ComputedQRItemUpdates } from '../interfaces/computedUpdates.interface';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import { evaluateAnswerOptionsToggleExpressions } from './answerOptionsToggleExpressions';

interface EvaluateUpdatedExpressionsParams {
  updatedResponse: QuestionnaireResponse;
  updatedResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  targetConstraints: Record<string, TargetConstraint>;
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
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
  updatedAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
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
    answerOptionsToggleExpressions,
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
      updatedAnswerOptionsToggleExpressions: answerOptionsToggleExpressions,
      updatedEnableWhenExpressions: enableWhenExpressions,
      updatedCalculatedExpressions: calculatedExpressions,
      updatedProcessedValueSets: processedValueSets,
      updatedFhirPathContext: existingFhirPathContext,
      fhirPathTerminologyCache,
      computedQRItemUpdates: {}
    };
  }

  const computedQRItemUpdates: ComputedQRItemUpdates = {};
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

  // Update answerOptionsToggleExpressions
  const {
    answerOptionsToggleExpressionsIsUpdated,
    updatedAnswerOptionsToggleExpressions,
    computedNewAnswers: computedNewAnswersAnswerOptionsToggleExpressions
  } = await evaluateAnswerOptionsToggleExpressions(
    updatedFhirPathContext,
    fhirPathTerminologyCache,
    answerOptionsToggleExpressions,
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
  const {
    calculatedExpsIsUpdated,
    updatedCalculatedExpressions,
    computedNewAnswers: computedNewAnswersCalculatedExpressions
  } = await evaluateCalculatedExpressions(
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
  for (const linkId in computedNewAnswersCalculatedExpressions) {
    // FIXME - this implementation is designed to only work on null for now, if we want to actually apply new answer updates, need to have Questionnaire input param
    if (computedNewAnswersCalculatedExpressions[linkId] === null) {
      computedQRItemUpdates[linkId] = null;
    }
  }

  for (const linkId in computedNewAnswersDynamicValueSets) {
    computedQRItemUpdates[linkId] = null;
  }

  for (const linkId in computedNewAnswersAnswerOptionsToggleExpressions) {
    computedQRItemUpdates[linkId] = null;
  }

  const isUpdated =
    enableWhenExpsIsUpdated ||
    calculatedExpsIsUpdated ||
    targetConstraintsIsUpdated ||
    answerOptionsToggleExpressionsIsUpdated ||
    processedValueSetsIsUpdated;

  return {
    isUpdated,
    updatedTargetConstraints,
    updatedAnswerOptionsToggleExpressions,
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
        console.log('FP294');

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
            terminologyUrl: terminologyServerUrl,
            userInvocationTable: {
              lookup: {
                // The function actually gets 3 parameters one is the main object iteslf which we don't need
                fn: (someObj: any, system: string, code: string) => {
                  console.log('lookup called with system:', system, 'code:', code);
                  return lookupCode(system, code, terminologyServerUrl); 
                },
                arity: {
                  2: ['String', 'String']
                }
              }
            }
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
            terminologyUrl: terminologyServerUrl,
            userInvocationTable: {
              lookup: {
                // The function actually gets 3 parameters one is the main object iteslf which we don't need
                fn: (someObj: any, system: string, code: string) => {
                  console.log('lookup called with system:', system, 'code:', code);
                  return lookupCode(system, code, terminologyServerUrl); 
                },
                arity: {
                  2: ['String', 'String']
                }
              }
            }
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
