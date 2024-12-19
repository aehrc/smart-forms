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

interface EvaluateUpdatedExpressionsParams {
  updatedResponse: QuestionnaireResponse;
  updatedResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  enableWhenExpressions: EnableWhenExpressions;
  variablesFhirPath: Record<string, Expression[]>;
  existingFhirPathContext: Record<string, any>;
  terminologyServerUrl: string;
}

export async function evaluateUpdatedExpressions(
  params: EvaluateUpdatedExpressionsParams
): Promise<{
  isUpdated: boolean;
  updatedEnableWhenExpressions: EnableWhenExpressions;
  updatedCalculatedExpressions: Record<string, CalculatedExpression[]>;
  updatedFhirPathContext: Record<string, any>;
}> {
  const {
    updatedResponse,
    updatedResponseItemMap,
    enableWhenExpressions,
    calculatedExpressions,
    variablesFhirPath,
    existingFhirPathContext,
    terminologyServerUrl
  } = params;

  const noExpressionsToBeUpdated =
    Object.keys(enableWhenExpressions).length === 0 &&
    Object.keys(calculatedExpressions).length === 0;
  if (noExpressionsToBeUpdated || !updatedResponse.item) {
    return {
      isUpdated: false,
      updatedEnableWhenExpressions: enableWhenExpressions,
      updatedCalculatedExpressions: calculatedExpressions,
      updatedFhirPathContext: existingFhirPathContext
    };
  }

  const updatedFhirPathContext = await createFhirPathContext(
    updatedResponse,
    updatedResponseItemMap,
    variablesFhirPath,
    existingFhirPathContext,
    terminologyServerUrl
  );

  // Update enableWhenExpressions
  const { enableWhenExpsIsUpdated, updatedEnableWhenExpressions } =
    await evaluateEnableWhenExpressions(
      updatedFhirPathContext,
      enableWhenExpressions,
      terminologyServerUrl
    );

  // Update calculatedExpressions
  const { calculatedExpsIsUpdated, updatedCalculatedExpressions } =
    await evaluateCalculatedExpressions(
      updatedFhirPathContext,
      calculatedExpressions,
      terminologyServerUrl
    );

  const isUpdated = enableWhenExpsIsUpdated || calculatedExpsIsUpdated;

  return {
    isUpdated,
    updatedEnableWhenExpressions,
    updatedCalculatedExpressions,
    updatedFhirPathContext
  };
}

export async function createFhirPathContext(
  questionnaireResponse: QuestionnaireResponse,
  questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]>,
  variablesFhirPath: Record<string, Expression[]>,
  existingFhirPathContext: Record<string, any>,
  terminologyServerUrl: string
): Promise<Record<string, any>> {
  // Add latest resource to fhirPathContext
  let fhirPathContext: Record<string, any> = {
    ...existingFhirPathContext,
    resource: questionnaireResponse,
    rootResource: questionnaireResponse
  };

  // Evaluate resource-level variables
  fhirPathContext = await evaluateQuestionnaireLevelVariables(
    questionnaireResponse,
    variablesFhirPath,
    fhirPathContext,
    terminologyServerUrl
  );

  // Add variables of items that exist in questionnaireResponseItemMap into fhirPathContext
  for (const linkId in questionnaireResponseItemMap) {
    // For non-repeat groups, the same linkId will have only one item
    // For repeat groups, the same linkId will have multiple items
    for (const qrItem of questionnaireResponseItemMap[linkId]) {
      fhirPathContext = await evaluateLinkIdVariables(
        qrItem,
        variablesFhirPath,
        fhirPathContext,
        terminologyServerUrl
      );
    }
  }

  // Items don't exist in questionnaireResponseItemMap, but we still have to add them into the fhirPathContext as empty arrays
  for (const linkId in variablesFhirPath) {
    fhirPathContext = addEmptyLinkIdVariables(linkId, variablesFhirPath, fhirPathContext);
  }

  return fhirPathContext;
}

export async function evaluateLinkIdVariables(
  item: QuestionnaireResponseItem,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>,
  terminologyServerUrl: string
) {
  const linkIdVariables = variablesFhirPath[item.linkId];
  if (!linkIdVariables || linkIdVariables.length === 0) {
    return fhirPathContext;
  }

  for (const variable of linkIdVariables) {
    if (variable.expression && variable.name) {
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
      } catch (e) {
        console.warn(e.message, `LinkId: ${item.linkId}\nExpression: ${variable.expression}`);
      }
    }
  }

  return fhirPathContext;
}

export function addEmptyLinkIdVariables(
  linkId: string,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>
) {
  const linkIdVariables = variablesFhirPath[linkId];
  if (!linkIdVariables || linkIdVariables.length === 0) {
    return fhirPathContext;
  }

  for (const variable of linkIdVariables) {
    if (variable.expression && variable.name) {
      if (fhirPathContext[`${variable.name}`] === undefined) {
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
  terminologyServerUrl: string
) {
  const questionnaireLevelVariables = variablesFhirPath['QuestionnaireLevel'];
  if (!questionnaireLevelVariables || questionnaireLevelVariables.length === 0) {
    return fhirPathContext;
  }

  for (const variable of questionnaireLevelVariables) {
    if (variable.expression) {
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
      } catch (e) {
        console.warn(e.message, `Questionnaire-level\nExpression: ${variable.expression}`);
      }
    }
  }

  return fhirPathContext;
}

export async function handleFhirPathResult(result: any[] | Promise<any[]>) {
  if (result instanceof Promise) {
    return await result;
  }

  return result;
}
