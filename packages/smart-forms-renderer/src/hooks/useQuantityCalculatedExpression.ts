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

import { useState } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { useQuestionnaireStore, useTerminologyServerStore } from '../stores';

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

  const itemPreferredTerminologyServers =
    useQuestionnaireStore.use.itemPreferredTerminologyServers();
  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  const [calcExpUpdated, setCalcExpUpdated] = useState(false);

  return { calcExpUpdated: calcExpUpdated };
}

export default useQuantityCalculatedExpression;
