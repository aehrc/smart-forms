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
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r5';
import { getValueSetCodings, getValueSetPromise } from '../functions/ValueSetFunctions';
import { PreprocessedValueSetContext } from '../components/QRenderer/Form';
import { CachedQueriedValueSetContext } from '../custom-contexts/CachedValueSetContext';

function useValueSetCodings(qItem: QuestionnaireItem) {
  const preprocessedCodings = useContext(PreprocessedValueSetContext);
  const { cachedValueSetCodings, addCodingToCache } = useContext(CachedQueriedValueSetContext);

  let valueSetUrl = qItem.answerValueSet;

  let initialCodings: Coding[] = [];

  // set options from cached answer options if present
  if (valueSetUrl) {
    if (valueSetUrl.startsWith('#')) {
      valueSetUrl = valueSetUrl.slice(1);
    }

    // attempt to get codings from value sets preprocessed when loading questionnaire
    initialCodings = preprocessedCodings[valueSetUrl] ?? [];

    if (initialCodings.length === 0) {
      // attempt to get codings from cached queried value sets
      initialCodings = cachedValueSetCodings[valueSetUrl] ?? [];
    }
  }

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
