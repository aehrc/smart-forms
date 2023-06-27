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

import { useContext, useEffect, useState } from 'react';
import { CalculatedExpressionContext } from '../contexts/CalculatedExpressionContext.tsx';
import { createEmptyQrItem } from '../../renderer/utils/qrItem.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

interface UseStringCalculatedExpression {
  calExpIsCalculating: boolean;
}

interface useStringCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  inputValue: string;
  setInputValue: (value: string) => void;
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => void;
}

function useStringCalculatedExpression(
  props: useStringCalculatedExpressionProps
): UseStringCalculatedExpression {
  const { qItem, inputValue, setInputValue, onQrItemChange } = props;

  const { calculatedExpressions } = useContext(CalculatedExpressionContext);

  const [calExpIsCalculating, setCalExpIsCalculating] = useState(false);

  useEffect(
    () => {
      const calcExpression = calculatedExpressions[qItem.linkId];

      // only update if calculated value is different from current value
      if (calcExpression?.value !== inputValue && typeof calcExpression?.value === 'string') {
        // update ui to show calculated value changes
        setCalExpIsCalculating(true);
        setTimeout(() => {
          setCalExpIsCalculating(false);
        }, 500);

        // update questionnaireResponse
        setInputValue(calcExpression.value);
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueString: calcExpression.value }]
        });
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  return { calExpIsCalculating };
}

export default useStringCalculatedExpression;
