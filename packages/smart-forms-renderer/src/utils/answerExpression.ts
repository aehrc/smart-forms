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

import type { AnswerExpression } from '../interfaces/answerExpression.interface';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import _isEqual from 'lodash/isEqual';

export function evaluateAnswerExpressions(
  fhirPathContext: Record<string, any>,
  answerExpressions: Record<string, AnswerExpression>
): {
  answerExpsIsUpdated: boolean;
  updatedAnswerExpressions: Record<string, AnswerExpression>;
} {
  const updatedAnswerExpressions: Record<string, AnswerExpression> = {
    ...answerExpressions
  };

  let isUpdated = false;
  for (const linkId in answerExpressions) {
    const answerExpression = answerExpressions[linkId];

    try {
      const result = fhirpath.evaluate(
        {},
        answerExpression.expression,
        fhirPathContext,
        fhirpath_r4_model
      );

      // Update calculatedExpressions if length of result array > 0
      // Only update when current calcExpression value is different from the result, otherwise it will result in an infinite loop as per issue #733
      if (result.length > 0 && !_isEqual(answerExpression.options, result)) {
        isUpdated = true;
        answerExpression.options = result;
        answerExpression.version = answerExpression.version + 1;
      }

      // Update calculatedExpression value to null if no result is returned
      if (result.length === 0 && answerExpression.options !== null) {
        isUpdated = true;
        answerExpression.options = [];
        answerExpression.version = answerExpression.version + 1;
      }
    } catch (e) {
      console.warn(e.message, `LinkId: ${linkId}\nExpression: ${answerExpression.options}`);
    }

    console.log(answerExpression);

    updatedAnswerExpressions[linkId] = answerExpression;
  }

  return {
    answerExpsIsUpdated: isUpdated,
    updatedAnswerExpressions: updatedAnswerExpressions
  };
}
