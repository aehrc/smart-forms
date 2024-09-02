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
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';

interface UseCodingCalculatedExpression {
  calcExpUpdated: boolean;
}

interface UseCodingCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  valueInString: string;
  onChangeByCalcExpressionString: (newValueInString: string) => void;
  onChangeByCalcExpressionNull: () => void;
}

// TODO use this in all choice and open choice items if possible
function useCodingCalculatedExpression(
  props: UseCodingCalculatedExpressionProps
): UseCodingCalculatedExpression {
  const { qItem, valueInString, onChangeByCalcExpressionString, onChangeByCalcExpressionNull } =
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
        calcExpression.value !== valueInString &&
        (typeof calcExpression.value === 'string' ||
          typeof calcExpression.value === 'number' ||
          typeof calcExpression.value === 'object' ||
          calcExpression.value === null)
      ) {
        // update ui to show calculated value changes
        setCalcExpUpdated(true);
        const timeoutId = setTimeout(() => {
          setCalcExpUpdated(false);
        }, 500);

        // calculatedExpression value is null
        if (calcExpression.value === null) {
          onChangeByCalcExpressionNull();
          return () => clearTimeout(timeoutId);
        }

        // calculatedExpression value is object, check if it is a Coding object
        if (typeof calcExpression.value === 'object' && objectIsCoding(calcExpression.value)) {
          if (calcExpression.value.code) {
            onChangeByCalcExpressionString(calcExpression.value.code);
            return () => clearTimeout(timeoutId);
          }
        }

        // calculatedExpression value is a string or number
        const newValueString =
          typeof calcExpression.value === 'string'
            ? calcExpression.value
            : calcExpression.value.toString();

        onChangeByCalcExpressionString(newValueString);
        return () => clearTimeout(timeoutId);
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  return { calcExpUpdated: calcExpUpdated };
}

function objectIsCoding(obj: any): obj is Coding {
  return obj && obj.code && typeof obj.code === 'string';
}

export default useCodingCalculatedExpression;
