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

import { useEffect, useMemo, useState } from 'react';
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r4';
import {
  getTerminologyServerUrl,
  getValueSetCodings,
  getValueSetPostPromise,
  getValueSetPromise
} from '../utils/valueSet';
import { useQuestionnaireStore, useTerminologyServerStore } from '../stores';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';
import { AnswerExpression } from '../interfaces/answerExpression.interface';
import _isEqual from 'lodash/isEqual';
import { convertAnswerOptionsToCodings } from '../utils/choice';
import { DynamicValueSet } from '../interfaces/valueSet.interface';

export interface TerminologyError {
  error: Error | null;
  answerValueSet: string;
}

function useValueSetCodings(
  qItem: QuestionnaireItem,
  onDynamicValueSetCodingsChange: () => void
): {
  codings: Coding[];
  isLoading: boolean;
  terminologyError: TerminologyError;
  setCodings: (codings: Coding[]) => void;
} {
  const processedValueSetCodings = useQuestionnaireStore.use.processedValueSetCodings();
  const cachedValueSetCodings = useQuestionnaireStore.use.cachedValueSetCodings();
  const dynamicValueSets = useQuestionnaireStore.use.dynamicValueSets();
  const answerExpressions = useQuestionnaireStore.use.answerExpressions();
  const addCodingToCache = useQuestionnaireStore.use.addCodingToCache();

  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  const valueSetUrl = qItem.answerValueSet;
  const cleanValueSetUrl = valueSetUrl?.startsWith('#') ? valueSetUrl.slice(1) : valueSetUrl;
  const initialCodings = useMemo(
    () => getInitialCodings(cleanValueSetUrl, processedValueSetCodings, cachedValueSetCodings),
    [cachedValueSetCodings, cleanValueSetUrl, processedValueSetCodings]
  );

  const [codings, setCodings] = useState<Coding[]>(initialCodings);
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<Error | null>(null);

  // Use dynamic valueSet via embeddings in contained ValueSet
  let dynamicValueSet: DynamicValueSet | null = null;
  if (cleanValueSetUrl) {
    dynamicValueSet = dynamicValueSets[cleanValueSetUrl];
  }
  useEffect(() => {
    if (!cleanValueSetUrl || !dynamicValueSet) {
      return;
    }

    // dynamicValueSet is not complete
    if (!dynamicValueSet.isComplete || !dynamicValueSet.completeResource) {
      if (!_isEqual([], codings)) {
        setCodings([]);
        onDynamicValueSetCodingsChange();
      }
      return;
    }

    // Assume answerValueSet is an expandable URL
    setLoading(true);
    const terminologyServerUrl = getTerminologyServerUrl(qItem) ?? defaultTerminologyServerUrl;
    const promise = getValueSetPostPromise(dynamicValueSet.completeResource, terminologyServerUrl);
    if (promise) {
      promise
        .then(async (valueSet: ValueSet) => {
          const newCodings = getValueSetCodings(valueSet);

          addDisplayToCodingArray(newCodings, terminologyServerUrl)
            .then((codingsWithDisplay) => {
              if (codingsWithDisplay.length > 0 && dynamicValueSet) {
                addCodingToCache(
                  `${valueSetUrl}-dynamic-v${dynamicValueSet.version}`,
                  codingsWithDisplay
                );
              }

              if (!_isEqual(codingsWithDisplay, codings)) {
                setCodings(codingsWithDisplay);
                onDynamicValueSetCodingsChange();
              }
              setLoading(false);
            })
            .catch((error: Error) => {
              if (!_isEqual(newCodings, codings)) {
                setCodings(newCodings);
                onDynamicValueSetCodingsChange();
              }
              setServerError(error);
              setLoading(false);
            });
        })
        .catch((error: Error) => {
          setServerError(error);

          if (!_isEqual([], codings)) {
            setCodings([]);
            onDynamicValueSetCodingsChange();
          }
          setLoading(false);
        });
    }
  }, [dynamicValueSet?.version, codings]);

  // Dynamic answerExpression
  const answerExpression: AnswerExpression | null = answerExpressions[qItem.linkId] ?? null;
  useEffect(() => {
    let newCodings: Coding[] = [];
    if (answerExpression && Array.isArray(answerExpression.options)) {
      newCodings = convertAnswerOptionsToCodings(answerExpression.options);
      if (!_isEqual(newCodings, codings)) {
        setCodings(newCodings);
        onDynamicValueSetCodingsChange();
      }
    }
  }, [answerExpression, answerExpression?.version, codings]);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl || codings.length > 0) return;

    // Assume answerValueSet is an expandable URL
    const terminologyServerUrl = getTerminologyServerUrl(qItem) ?? defaultTerminologyServerUrl;
    const promise = getValueSetPromise(valueSetUrl, terminologyServerUrl);
    if (promise) {
      promise
        .then(async (valueSet: ValueSet) => {
          const codings = getValueSetCodings(valueSet);
          addDisplayToCodingArray(codings, terminologyServerUrl)
            .then((codingsWithDisplay) => {
              if (codingsWithDisplay.length > 0) {
                addCodingToCache(valueSetUrl, codingsWithDisplay);
                setCodings(codingsWithDisplay);
              }
            })
            .catch((error: Error) => {
              setServerError(error);
            });
        })
        .catch((error: Error) => {
          setServerError(error);
        });
    }
  }, [qItem]);

  return {
    codings,
    setCodings,
    isLoading: loading,
    terminologyError: { error: serverError, answerValueSet: valueSetUrl ?? '' }
  };
}

function getInitialCodings(
  cleanValueSetUrl: string | undefined,
  processedValueSetCodings: Record<string, Coding[]>,
  cachedValueSetCodings: Record<string, Coding[]>
) {
  // set options from cached answer options if present
  if (cleanValueSetUrl) {
    // attempt to get codings from value sets preprocessed when loading questionnaire
    if (processedValueSetCodings[cleanValueSetUrl]) {
      return processedValueSetCodings[cleanValueSetUrl];
    }

    // attempt to get codings from cached queried value sets
    if (cachedValueSetCodings[cleanValueSetUrl]) {
      return cachedValueSetCodings[cleanValueSetUrl];
    }
  }

  return [];
}
//
// function getCodingsVersion(
//   linkId: string,
//   initialCodings: Coding[],
//   answerExpressions: Record<string, AnswerExpression>
// ): number {
//   if (initialCodings.length > 0) {
//     return 1;
//   }
//
//   const answerExpression = answerExpressions[linkId];
//   if (answerExpression) {
//     return answerExpression.version;
//   }
//
//   return 0;
// }

export default useValueSetCodings;
