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
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r4';
import { useEffect } from 'react';
import { getValueSetCodings, getValueSetPromise } from '../utils/valueSet';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';

function useCqfAnswerValueSetEffect(
  qItem: QuestionnaireItem,
  terminologyServerUrl: string,
  cachedValueSetCodings: Record<string, Coding[]>,
  onSetCodings: (codings: Coding[]) => void,
  onSetDynamicCodingsUpdated: (updated: boolean) => void,
  onSetServerError: (error: Error) => void
) {
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();
  const addCodingToCache = useQuestionnaireStore.use.addCodingToCache();

  const cqfAnswerValueSetCqfExpression = calculatedExpressions[qItem.linkId]?.find(
    (exp) => exp.from === 'item._answerValueSet'
  );

  useEffect(() => {
    if (!qItem.answerValueSet || !qItem._answerValueSet) {
      return;
    }

    if (!cqfAnswerValueSetCqfExpression) {
      return;
    }

    let updatableValueSetUrl = qItem.answerValueSet;
    // if the cqf-expression value is a valid string, use it as the answerValueSet URL
    if (
      typeof cqfAnswerValueSetCqfExpression.value === 'string' &&
      cqfAnswerValueSetCqfExpression.value !== ''
    ) {
      updatableValueSetUrl = cqfAnswerValueSetCqfExpression.value;
    }

    // attempt to get codings from cached queried value sets
    if (cachedValueSetCodings[updatableValueSetUrl]) {
      onSetCodings(cachedValueSetCodings[updatableValueSetUrl]);

      // Update UI to show calculated value changes
      onSetDynamicCodingsUpdated(true);
      const timeoutId = setTimeout(() => {
        onSetDynamicCodingsUpdated(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    const promise = getValueSetPromise(updatableValueSetUrl, terminologyServerUrl);
    if (!promise) {
      return;
    }

    promise
      .then(async (valueSet: ValueSet) => {
        const newCodings = getValueSetCodings(valueSet);
        try {
          const codingsWithDisplay = await addDisplayToCodingArray(
            newCodings,
            terminologyServerUrl
          );

          addCodingToCache(updatableValueSetUrl, codingsWithDisplay);
          onSetCodings(codingsWithDisplay.length > 0 ? newCodings : []);

          // Update UI to show calculated value changes
          onSetDynamicCodingsUpdated(true);
          const timeoutId = setTimeout(() => {
            onSetDynamicCodingsUpdated(false);
          }, 500);

          return () => clearTimeout(timeoutId);
        } catch (error) {
          onSetServerError(error as Error);
        }
      })
      .catch((error: Error) => {
        onSetServerError(error);
      });
  }, [
    addCodingToCache,
    cachedValueSetCodings,
    onSetCodings,
    onSetDynamicCodingsUpdated,
    onSetServerError,
    qItem,
    terminologyServerUrl,
    calculatedExpressions
  ]);
}

export default useCqfAnswerValueSetEffect;
