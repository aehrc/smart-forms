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

import { useCallback, useState } from 'react';
import { Coding, ValueSet } from 'fhir/r5';
import { AnswerValueSet } from '../classes/AnswerValueSet';
import { debounce } from 'lodash';

function useValueSetAutocomplete(answerValueSetUrl: string | undefined, maxList: number) {
  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<Error | null>(null);

  const fetchNewOptions = useCallback(
    (newInput: string) => {
      // make no changes if input is less than 2 characters long
      if (newInput.length < 2) {
        setOptions([]);
        setLoading(false);
        return;
      }

      if (!answerValueSetUrl) return null;

      const UrlWithTrailingAmpersand =
        answerValueSetUrl + (answerValueSetUrl[answerValueSetUrl.length - 1] !== '&' ? '&' : '');
      const fullUrl = UrlWithTrailingAmpersand + 'filter=' + newInput + '&count=' + maxList;
      const cachedAnswerOptions = AnswerValueSet.cache[fullUrl];
      if (cachedAnswerOptions) {
        // set options from cached answer options
        setOptions(cachedAnswerOptions);
        setLoading(false);
      } else {
        // expand valueSet, then set and cache answer options
        AnswerValueSet.expand(
          fullUrl,
          (newOptions: ValueSet) => {
            const contains = newOptions.expansion?.contains;
            if (contains) {
              const answerOptions = AnswerValueSet.getValueCodings(contains);
              AnswerValueSet.cache[fullUrl] = answerOptions;
              setOptions(answerOptions);
            } else {
              setOptions([]);
            }
            setLoading(false);
          },
          (error: Error) => {
            setServerError(error);
          }
        );
      }
    },
    [answerValueSetUrl, maxList]
  );

  // search questionnaires from input with delay
  const searchResultsWithDebounce = useCallback(
    debounce((input: string) => {
      fetchNewOptions(input);
    }, 300),
    [fetchNewOptions]
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
