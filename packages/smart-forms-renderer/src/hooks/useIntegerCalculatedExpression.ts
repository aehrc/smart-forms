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

import { useEffect, useState } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';

interface UseIntegerCalculatedExpression {
  calcExpUpdated: boolean;
}

interface useIntegerCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  inputValue: string;
  onChangeByCalcExpressionInteger: (calcExpressionValue: number) => void;
  onChangeByCalcExpressionNull: () => void;
}

function useIntegerCalculatedExpression(
  props: useIntegerCalculatedExpressionProps
): UseIntegerCalculatedExpression {
  const { qItem, inputValue, onChangeByCalcExpressionInteger, onChangeByCalcExpressionNull } =
    props;

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

      // only update if calculated value is different from current value
      if (
        calcExpression.value !== inputValue &&
        (typeof calcExpression.value === 'number' || calcExpression.value === null)
      ) {
        const calcExpressionValue = calcExpression.value;

        if (calcExpressionValue !== parseInt(inputValue)) {
          // update ui to show calculated value changes
          setCalcExpUpdated(true);
          const timeoutId = setTimeout(() => {
            setCalcExpUpdated(false);
          }, 500);

          // calculatedExpression value is null
          if (calcExpressionValue === null) {
            onChangeByCalcExpressionNull();
            return () => clearTimeout(timeoutId);
          }

          // calculatedExpression value is a number
          onChangeByCalcExpressionInteger(calcExpressionValue);
          return () => clearTimeout(timeoutId);
        }
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  return { calcExpUpdated: calcExpUpdated };
}

export default useIntegerCalculatedExpression;
