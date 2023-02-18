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

import { useCallback, useContext, useState } from 'react';
import { Coding, ValueSet } from 'fhir/r5';
import { debounce } from 'lodash';
import { CachedQueriedValueSetContext } from '../custom-contexts/CachedValueSetContext';
import { getValueSetCodings, getValueSetPromise } from '../functions/ValueSetFunctions';

function useValueSetAutocomplete(answerValueSetUrl: string | undefined, maxList: number) {
  const { cachedValueSetCodings, addCodingToCache } = useContext(CachedQueriedValueSetContext);

  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<Error | null>(null);

  const fetchOptions = useCallback(
    (input: string) => {
      // make no changes if input is less than 2 characters long
      if (input.length < 2) {
        setOptions([]);
        setLoading(false);
        return;
      }

      if (!answerValueSetUrl) return null;

      // restructure url to include filter and count parameters
      const UrlWithTrailingAmpersand =
        answerValueSetUrl + (answerValueSetUrl[answerValueSetUrl.length - 1] !== '&' ? '&' : '');
      const fullUrl = UrlWithTrailingAmpersand + 'filter=' + input + '&count=' + maxList;

      const cachedCodings = cachedValueSetCodings[fullUrl];

      // set options from cached codings if present
      if (cachedCodings) {
        setOptions(cachedCodings);
        setLoading(false);
        return;
      }

      // expand valueSet, then set and cache answer options
      const promise = getValueSetPromise(fullUrl);
      if (promise) {
        promise
          .then((valueSet: ValueSet) => {
            const codings = getValueSetCodings(valueSet);
            if (codings.length > 0) {
              addCodingToCache(fullUrl, codings);
            }
            setOptions(codings);
            setLoading(false);
          })
          .catch((error: Error) => {
            setServerError(error);
            setOptions([]);
            setLoading(false);
          });
      } else {
        // default to empty array options
        setOptions([]);
        setLoading(false);
      }
    },
    [addCodingToCache, answerValueSetUrl, cachedValueSetCodings, maxList]
  );

  // search questionnaires from input with delay
  const searchResultsWithDebounce = useCallback(
    debounce((input: string) => {
      fetchOptions(input);
    }, 200),
    [fetchOptions]
  );

  return {
    options,
    loading,
    setLoading,
    searchResultsWithDebounce,
    serverError
  };
}

export default useValueSetAutocomplete;
