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

import { useEffect, useState } from 'react';
import { createEmptyQrItem } from '../utils/qrItem';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';

interface UseDecimalCalculatedExpression {
  calcExpUpdated: boolean;
}

interface useDecimalCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  inputValue: string;
  precision: number | null;
  setInputValue: (value: string) => void;
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => void;
}

function useDecimalCalculatedExpression(
  props: useDecimalCalculatedExpressionProps
): UseDecimalCalculatedExpression {
  const { qItem, inputValue, precision, setInputValue, onQrItemChange } = props;

  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();

  const [calcExpUpdated, setCalcExpUpdated] = useState(false);

  useEffect(
    () => {
      const calcExpression = calculatedExpressions[qItem.linkId];

      // only update if calculated value is different from current value
      if (calcExpression?.value !== inputValue && typeof calcExpression?.value === 'number') {
        const value = precision
          ? parseFloat(calcExpression.value.toFixed(precision))
          : calcExpression.value;

        // only update if calculated value is different from current value
        if (value !== parseFloat(inputValue)) {
          // update ui to show calculated value changes
          setCalcExpUpdated(true);
          setTimeout(() => {
            setCalcExpUpdated(false);
          }, 500);

          // update questionnaireResponse
          setInputValue(precision ? value.toFixed(precision) : value.toString());
          onQrItemChange({
            ...createEmptyQrItem(qItem),
            answer: [{ valueDecimal: value }]
          });
        }
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  return { calcExpUpdated: calcExpUpdated };
}

export default useDecimalCalculatedExpression;
