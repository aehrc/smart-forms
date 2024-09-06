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
import { validateCodePromise } from '../utils/valueSet';
import { TERMINOLOGY_SERVER_URL } from '../globals';
import type {
  CodeParameter,
  DisplayParameter,
  SystemParameter
} from '../interfaces/valueSet.interface';

interface UseQuantityCalculatedExpression {
  calcExpUpdated: boolean;
}

interface UseQuantityCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  inputValue: string;
  precision: number | null;
  onChangeByCalcExpressionDecimal: (newValue: number) => void;
  onChangeByCalcExpressionQuantity: (
    newValue: number,
    newUnitSystem: string,
    newUnitCode: string,
    newUnitDisplay: string
  ) => void;
  onChangeByCalcExpressionNull: () => void;
}

function useQuantityCalculatedExpression(
  props: UseQuantityCalculatedExpressionProps
): UseQuantityCalculatedExpression {
  const {
    qItem,
    inputValue,
    precision,
    onChangeByCalcExpressionDecimal,
    onChangeByCalcExpressionQuantity,
    onChangeByCalcExpressionNull
  } = props;

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
        (typeof calcExpression.value === 'number' ||
          typeof calcExpression.value === 'string' ||
          calcExpression.value === null)
      ) {
        // Null path
        if (calcExpression.value === null) {
          onChangeByCalcExpressionNull();
          return;
        }

        // Number path
        if (typeof calcExpression.value === 'number') {
          const calcExpressionValue =
            typeof precision === 'number'
              ? parseFloat(calcExpression.value.toFixed(precision))
              : calcExpression.value;

          // only update if calculated value is different from current value
          if (calcExpressionValue !== parseFloat(inputValue)) {
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
            onChangeByCalcExpressionDecimal(calcExpressionValue);
            return () => clearTimeout(timeoutId);
          }
        }

        // String path (quantity)
        if (typeof calcExpression.value === 'string') {
          try {
            const [value, unitCode] = calcExpression.value.split(' ');
            const unitCodeFormatted = unitCode.replace(/'/g, '');

            const ucumValueSet = 'http://hl7.org/fhir/ValueSet/ucum-units';
            const ucumSystem = 'http://unitsofmeasure.org';

            validateCodePromise(
              ucumValueSet,
              ucumSystem,
              unitCodeFormatted,
              TERMINOLOGY_SERVER_URL
            ).then((validateCodeResponse) => {
              // Return early if validate-code request fails
              if (!validateCodeResponse) {
                onChangeByCalcExpressionNull();
                return;
              }

              if (validateCodeResponse.parameter) {
                const systemParameter = validateCodeResponse.parameter.find(
                  (p) => p.name === 'system'
                ) as SystemParameter;
                const codeParameter = validateCodeResponse.parameter.find(
                  (p) => p.name === 'code'
                ) as CodeParameter;
                const displayParameter = validateCodeResponse.parameter.find(
                  (p) => p.name === 'display'
                ) as DisplayParameter;
                if (
                  systemParameter.valueUri &&
                  codeParameter.valueCode &&
                  displayParameter.valueString
                ) {
                  // update ui to show calculated value changes
                  setCalcExpUpdated(true);
                  const timeoutId = setTimeout(() => {
                    setCalcExpUpdated(false);
                  }, 500);

                  onChangeByCalcExpressionQuantity(
                    parseFloat(value),
                    systemParameter.valueUri,
                    codeParameter.valueCode,
                    displayParameter.valueString
                  );
                  return () => clearTimeout(timeoutId);
                }
              }
            });
          } catch (e) {
            console.error(e);
            onChangeByCalcExpressionNull();
          }
        }
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  return { calcExpUpdated: calcExpUpdated };
}

export default useQuantityCalculatedExpression;
