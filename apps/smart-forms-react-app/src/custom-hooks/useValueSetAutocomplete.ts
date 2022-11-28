import { useCallback, useState } from 'react';
import { Coding, ValueSet } from 'fhir/r5';
import { AnswerValueSet } from '../classes/AnswerValueSet';
import { debounce } from 'lodash';

function useValueSetAutocomplete(answerValueSetUrl: string, maxlist: number) {
  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<Error | null>(null);

  function fetchNewOptions(newInput: string) {
    // make no changes if input is less than 2 characters long
    if (newInput.length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const fullUrl = answerValueSetUrl + 'filter=' + newInput + '&count=' + maxlist;
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
  }

  // search questionnaires from input with delay
  const searchResultsWithDebounce = useCallback(
    debounce((input: string) => {
      fetchNewOptions(input);
    }, 500),
    []
  );

  return { options, loading, setLoading, searchResultsWithDebounce, serverError };
}

export default useValueSetAutocomplete;
