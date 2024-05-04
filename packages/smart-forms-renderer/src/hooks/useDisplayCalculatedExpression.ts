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

import { useQuestionnaireStore } from '../stores';
import type { QuestionnaireItem } from 'fhir/r4';

function useDisplayCalculatedExpression(qItem: QuestionnaireItem): string | null {
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();

  const calcExpression = calculatedExpressions[qItem.linkId]?.find(
    (exp) => exp.from === 'item._text'
  );

  if (!calcExpression) {
    return null;
  }

  if (
    typeof calcExpression.value === 'string' ||
    typeof calcExpression.value === 'number' ||
    calcExpression.value === null
  ) {
    // calculatedExpression value is null
    if (calcExpression.value === null) {
      return '';
    }

    // calculatedExpression value is string or number
    return typeof calcExpression.value === 'string'
      ? calcExpression.value
      : calcExpression.value.toString();
  }

  return null;
}

export default useDisplayCalculatedExpression;
