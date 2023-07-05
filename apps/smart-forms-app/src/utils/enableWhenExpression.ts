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

import type { EnableWhenExpression } from '../types/enableWhen.interface.ts';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';
import { createFhirPathContext } from './fhirpath.ts';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { CalculatedExpression } from '../features/calculatedExpression/types/calculatedExpression.interface.ts';
import _isEqual from 'lodash/isEqual';
import { emptyResponse } from '../stores/useQuestionnaireStore.ts';

interface EvaluateInitialEnableWhenExpressionsParams {
  initialResponse: QuestionnaireResponse;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  variablesFhirPath: Record<string, Expression[]>;
}

export function evaluateInitialEnableWhenExpressions(
  params: EvaluateInitialEnableWhenExpressionsParams
): Record<string, EnableWhenExpression> {
  const { initialResponse, enableWhenExpressions, variablesFhirPath } = params;

  // Return early if initialResponse is empty
  if (_isEqual(initialResponse, emptyResponse)) {
    return enableWhenExpressions;
  }

  const initialExpressions: Record<string, EnableWhenExpression> = { ...enableWhenExpressions };

  if (Object.keys(initialExpressions).length > 0) {
    const fhirPathContext: Record<string, any> = createFhirPathContext(
      initialResponse,
      variablesFhirPath
    );

    for (const linkId in initialExpressions) {
      try {
        const result = fhirpath.evaluate(
          initialResponse,
          enableWhenExpressions[linkId].expression,
          fhirPathContext,
          fhirpath_r4_model
        );

        if (result.length > 0) {
          initialExpressions[linkId].isEnabled = result[0];
        }
      } catch (e) {
        // Continue even if there is an error evaluating the expression
        // So that the user can still see the form
        console.warn(e);
      }
    }
  }
  return initialExpressions;
}

interface EvaluateUpdatedEnableWhenExpressionsParams {
  updatedResponse: QuestionnaireResponse;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  variablesFhirPath: Record<string, Expression[]>;
}

export function evaluateUpdatedEnableWhenExpressions(
  params: EvaluateUpdatedEnableWhenExpressionsParams
): {
  isUpdated: boolean;
  updatedEnableWhenExpressions: Record<string, CalculatedExpression>;
} {
  const { updatedResponse, enableWhenExpressions, variablesFhirPath } = params;

  let isUpdated = false;
  const updatedExpressions: Record<string, EnableWhenExpression> = { ...enableWhenExpressions };

  if (Object.keys(enableWhenExpressions).length > 0 && updatedResponse.item) {
    const fhirPathContext: Record<string, any> = createFhirPathContext(
      updatedResponse,
      variablesFhirPath
    );

    for (const linkId in updatedExpressions) {
      try {
        const result = fhirpath.evaluate(
          updatedResponse,
          enableWhenExpressions[linkId].expression,
          fhirPathContext,
          fhirpath_r4_model
        );

        if (result.length > 0) {
          if (enableWhenExpressions[linkId].isEnabled !== result[0]) {
            isUpdated = true;
            updatedExpressions[linkId].isEnabled = result[0];
          }
        }
      } catch (e) {
        // Continue even if there is an error evaluating the expression
        // So that the user can still see the form
        console.warn(e);
      }
    }
  }

  return { isUpdated, updatedEnableWhenExpressions: updatedExpressions };
}
