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

import { useQuestionnaireStore } from '../stores';
import type { QuestionnaireItem } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces';

/**
 * Returns the value of a cqf-expression, calculatedExpression or ItemTextAriaLabelExpression.
 *
 * - If no expression is found → returns null.
 * - If the value is null → returns an empty string.
 * - If the value is a string or number → returns it as a string.
 *
 * @param {QuestionnaireItem} qItem - The questionnaire item.
 * @param {CalculatedExpression['from']} from - The expression source. Should be a one of 'item._text' or 'item._text.aria-label'
 * @returns {string | null} The display value as a string, empty string, or null.
 */
function useDisplayCqfAndCalculatedExpression(
  qItem: QuestionnaireItem,
  from: CalculatedExpression['from']
): string | null {
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();

  const cqfOrCalcExpression = calculatedExpressions?.[qItem.linkId]?.find(
    (exp) => exp && exp.from === from
  );

  // Add null check for exp
  if (!cqfOrCalcExpression) {
    return null;
  }

  if (
    typeof cqfOrCalcExpression.value === 'string' ||
    typeof cqfOrCalcExpression.value === 'number' ||
    cqfOrCalcExpression.value === null
  ) {
    // calculatedExpression value is null
    if (cqfOrCalcExpression.value === null) {
      return '';
    }

    // calculatedExpression value is string or number
    return typeof cqfOrCalcExpression.value === 'string'
      ? cqfOrCalcExpression.value
      : cqfOrCalcExpression.value.toString();
  }

  return null;
}

export default useDisplayCqfAndCalculatedExpression;
