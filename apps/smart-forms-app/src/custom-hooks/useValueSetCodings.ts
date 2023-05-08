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

import { useContext, useEffect, useMemo, useState } from 'react';
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r4';
import {
  evaluateAnswerExpressionValueSet,
  getValueSetCodings,
  getValueSetPromise
} from '../functions/ValueSetFunctions';
import { PreprocessedValueSetContext } from '../components/Renderer/FormPage/Form';
import { CachedQueriedValueSetContext } from '../custom-contexts/CachedValueSetContext';
import { getAnswerExpression } from '../functions/ItemControlFunctions.ts';
import { QuestionnaireProviderContext } from '../App.tsx';

function useValueSetCodings(qItem: QuestionnaireItem) {
  const preprocessedCodings = useContext(PreprocessedValueSetContext);
  const { cachedValueSetCodings, addCodingToCache } = useContext(CachedQueriedValueSetContext);
  const { variables } = useContext(QuestionnaireProviderContext);

  let valueSetUrl = qItem.answerValueSet;
  const initialCodings = useMemo(() => {
    // set options from cached answer options if present
    if (valueSetUrl) {
      if (valueSetUrl.startsWith('#')) {
        valueSetUrl = valueSetUrl.slice(1);
      }

      // attempt to get codings from value sets preprocessed when loading questionnaire
      if (preprocessedCodings[valueSetUrl]) {
        return preprocessedCodings[valueSetUrl];
      }

      // attempt to get codings from cached queried value sets
      if (cachedValueSetCodings[valueSetUrl]) {
        return cachedValueSetCodings[valueSetUrl];
      }
    }

    // get valueSet from sdc-questionnaire-answerExpression extension if answerValueSet is not present
    if (!valueSetUrl) {
      const answerExpression = getAnswerExpression(qItem);
      if (answerExpression) {
        return evaluateAnswerExpressionValueSet(answerExpression, variables, preprocessedCodings);
      }
    }

    return [];
  }, [valueSetUrl, qItem, variables, preprocessedCodings, cachedValueSetCodings]);

  const [codings, setCodings] = useState<Coding[]>(initialCodings);
  const [serverError, setServerError] = useState<Error | null>(null);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl || codings.length > 0) return;

    const promise = getValueSetPromise(valueSetUrl);
    if (promise) {
      promise
        .then((valueSet: ValueSet) => {
          const codings = getValueSetCodings(valueSet);
          if (codings.length > 0) {
            addCodingToCache(valueSetUrl, codings);
            setCodings(codings);
          }
        })
        .catch((error: Error) => {
          setServerError(error);
        });
    }
  }, [qItem]);

  return { codings, serverError };
}

export default useValueSetCodings;
