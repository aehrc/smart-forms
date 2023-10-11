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

import { evaluateInitialEnableWhenExpressions } from './enableWhenExpression';
import { getFirstVisibleTab } from './tabs';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';
import type { EnableWhenExpression, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { Tabs } from '../interfaces/tab.interface';
import { assignPopulatedAnswersToEnableWhen } from './enableWhen';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import { evaluateInitialCalculatedExpressions } from './calculatedExpression';

interface initialFormFromResponseParams {
  questionnaireResponse: QuestionnaireResponse;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  variablesFhirPath: Record<string, Expression[]>;
  tabs: Tabs;
  fhirPathContext: Record<string, any>;
}

export function initialiseFormFromResponse(params: initialFormFromResponseParams): {
  initialEnableWhenItems: EnableWhenItems;
  initialEnableWhenLinkedQuestions: Record<string, string[]>;
  initialEnableWhenExpressions: Record<string, EnableWhenExpression>;
  initialCalculatedExpressions: Record<string, CalculatedExpression>;
  firstVisibleTab: number;
  updatedFhirPathContext: Record<string, any>;
} {
  const {
    questionnaireResponse,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    variablesFhirPath,
    tabs
  } = params;
  let updatedFhirPathContext = params.fhirPathContext;

  const { initialisedItems, linkedQuestions } = assignPopulatedAnswersToEnableWhen(
    enableWhenItems,
    questionnaireResponse
  );

  const evaluateInitialEnableWhenExpressionsResult = evaluateInitialEnableWhenExpressions({
    initialResponse: questionnaireResponse,
    enableWhenExpressions: enableWhenExpressions,
    variablesFhirPath: variablesFhirPath,
    existingFhirPathContext: updatedFhirPathContext
  });
  const { initialEnableWhenExpressions } = evaluateInitialEnableWhenExpressionsResult;
  updatedFhirPathContext = evaluateInitialEnableWhenExpressionsResult.updatedFhirPathContext;

  const evaluateInitialCalculatedExpressionsResult = evaluateInitialCalculatedExpressions({
    initialResponse: questionnaireResponse,
    calculatedExpressions: calculatedExpressions,
    variablesFhirPath: variablesFhirPath,
    existingFhirPathContext: updatedFhirPathContext
  });
  const { initialCalculatedExpressions } = evaluateInitialCalculatedExpressionsResult;
  updatedFhirPathContext = evaluateInitialEnableWhenExpressionsResult.updatedFhirPathContext;

  const firstVisibleTab =
    Object.keys(tabs).length > 0
      ? getFirstVisibleTab(tabs, initialisedItems, initialEnableWhenExpressions)
      : 0;

  return {
    initialEnableWhenItems: initialisedItems,
    initialEnableWhenLinkedQuestions: linkedQuestions,
    initialEnableWhenExpressions,
    initialCalculatedExpressions,
    firstVisibleTab,
    updatedFhirPathContext
  };
}
