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

import { useEffect, useState } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';

interface UseStringCalculatedExpression {
  calcExpUpdated: boolean;
}

interface useStringCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  inputValue: string;
  onChangeByCalcExpressionString: (newValueString: string) => void;
  onChangeByCalcExpressionNull: () => void;
}

function useStringCalculatedExpression(
  props: useStringCalculatedExpressionProps
): UseStringCalculatedExpression {
  const { qItem, inputValue, onChangeByCalcExpressionString, onChangeByCalcExpressionNull } = props;

  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();

  const [calcExpUpdated, setCalcExpUpdated] = useState(false);

  useEffect(
    () => {
      const calcExpression = calculatedExpressions[qItem.linkId]?.find(
        (exp) => exp.from === 'item'
      );

      if (!calcExpression) {
        return;
      }

      // If both input and calculated value are falsy, there is nothing to update
      const inputAndCalcValueAreBothFalsy = inputValue === '' && !calcExpression.value;
      if (inputAndCalcValueAreBothFalsy) {
        return;
      }

      // only update if calculated value is different from current value
      if (
        calcExpression.value !== inputValue &&
        (typeof calcExpression.value === 'string' ||
          typeof calcExpression.value === 'number' ||
          calcExpression.value === null)
      ) {
        // update ui to show calculated value changes
        setCalcExpUpdated(true);

        // calculatedExpression value is null
        if (calcExpression.value === null) {
          onChangeByCalcExpressionNull();
          return;
        }

        // calculatedExpression value is a string or number
        const newInputValue =
          typeof calcExpression.value === 'string'
            ? calcExpression.value
            : calcExpression.value.toString();

        onChangeByCalcExpressionString(newInputValue);
        return;
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  // Handle reset separately so it’s not lost if effect re-runs
  useEffect(() => {
    if (!calcExpUpdated) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCalcExpUpdated(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [calcExpUpdated]);

  return { calcExpUpdated: calcExpUpdated };
}

export default useStringCalculatedExpression;
