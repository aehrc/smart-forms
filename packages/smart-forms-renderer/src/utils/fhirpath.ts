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

import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { Expression, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpression } from '../interfaces/enableWhen.interface';
import { evaluateEnableWhenExpressions } from './enableWhenExpression';
import { evaluateCalculatedExpressions } from './calculatedExpression';

interface EvaluateUpdatedExpressionsParams {
  updatedResponse: QuestionnaireResponse;
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  variablesFhirPath: Record<string, Expression[]>;
}

export function evaluateUpdatedExpressions(params: EvaluateUpdatedExpressionsParams): {
  isUpdated: boolean;
  updatedEnableWhenExpressions: Record<string, EnableWhenExpression>;
  updatedCalculatedExpressions: Record<string, CalculatedExpression>;
} {
  const { updatedResponse, enableWhenExpressions, calculatedExpressions, variablesFhirPath } =
    params;

  const hasExpressionToBeUpdated =
    Object.keys(enableWhenExpressions).length > 0 || Object.keys(calculatedExpressions).length > 0;
  if (hasExpressionToBeUpdated && updatedResponse.item) {
    const fhirPathContext: Record<string, any> = createFhirPathContext(
      updatedResponse,
      variablesFhirPath
    );

    // Update enableWhenExpressions
    const { enableWhenExpsIsUpdated, updatedEnableWhenExpressions } = evaluateEnableWhenExpressions(
      fhirPathContext,
      enableWhenExpressions
    );

    // Update calculatedExpressions
    const { calculatedExpsIsUpdated, updatedCalculatedExpressions } = evaluateCalculatedExpressions(
      fhirPathContext,
      calculatedExpressions
    );

    const isUpdated = enableWhenExpsIsUpdated || calculatedExpsIsUpdated;

    return { isUpdated, updatedEnableWhenExpressions, updatedCalculatedExpressions };
  }

  return {
    isUpdated: false,
    updatedEnableWhenExpressions: enableWhenExpressions,
    updatedCalculatedExpressions: calculatedExpressions
  };
}

export function createFhirPathContext(
  questionnaireResponse: QuestionnaireResponse,
  variablesFhirPath: Record<string, Expression[]>
): Record<string, any> {
  const fhirPathContext: Record<string, any> = { resource: questionnaireResponse };

  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) {
    return fhirPathContext;
  }

  evaluateResourceLevelFhirPath(questionnaireResponse, variablesFhirPath, fhirPathContext);

  for (const topLevelItem of questionnaireResponse.item) {
    evaluateFhirPathRecursive(topLevelItem, variablesFhirPath, fhirPathContext);
  }

  return fhirPathContext;
}

export function evaluateFhirPathRecursive(
  item: QuestionnaireResponseItem,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>
) {
  const items = item.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    for (const childItem of items) {
      evaluateFhirPathRecursive(childItem, variablesFhirPath, fhirPathContext);
    }
  }

  evaluateItemFhirPath(item, variablesFhirPath, fhirPathContext);
}

export function evaluateItemFhirPath(
  item: QuestionnaireResponseItem,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>
) {
  const variablesOfItem = variablesFhirPath[item.linkId];
  if (!variablesOfItem || variablesOfItem.length === 0) {
    return;
  }

  variablesOfItem.forEach((variable) => {
    if (variable.expression) {
      try {
        fhirPathContext[`${variable.name}`] = fhirpath.evaluate(
          item,
          {
            base: 'QuestionnaireResponse.item',
            expression: variable.expression
          },
          fhirPathContext,
          fhirpath_r4_model
        );
      } catch (e) {
        console.warn(e.message, `LinkId: ${item.linkId}\nExpression: ${variable.expression}`);
      }
    }
  });
}

export function evaluateResourceLevelFhirPath(
  resource: QuestionnaireResponse,
  variablesFhirPath: Record<string, Expression[]>,
  fhirPathContext: Record<string, any>
) {
  const questionnaireLevelVariables = variablesFhirPath['QuestionnaireLevel'];
  if (!questionnaireLevelVariables || questionnaireLevelVariables.length === 0) {
    return;
  }

  questionnaireLevelVariables.forEach((variable) => {
    if (variable.expression) {
      try {
        fhirPathContext[`${variable.name}`] = fhirpath.evaluate(
          resource,
          {
            base: 'QuestionnaireResponse',
            expression: variable.expression
          },
          fhirPathContext,
          fhirpath_r4_model
        );
      } catch (e) {
        console.warn(e.message, `Questionnaire-level\nExpression: ${variable.expression}`);
      }
    }
  });
}
