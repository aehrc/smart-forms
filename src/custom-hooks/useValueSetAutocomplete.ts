import { useState } from 'react';
import { Coding, ValueSet } from 'fhir/r5';
import { AnswerValueSet } from '../classes/AnswerValueSet';

function useValueSetAutocomplete(answerValueSetUrl: string, maxlist: number) {
  const [options, setOptions] = useState<Coding[]>([]);
  const [loading, setLoading] = useState(false);

  function fetchNewOptions(newInput: string) {
    // make no changes if input is less than 2 characters long
    if (newInput.length < 2) {
      setOptions([]);
      return;
    }

    const fullUrl = answerValueSetUrl + 'filter=' + newInput + '&count=' + maxlist;
    const cachedAnswerOptions = AnswerValueSet.cache[fullUrl];
    if (cachedAnswerOptions) {
      // set options from cached answer options
      setOptions(cachedAnswerOptions);
    } else {
      // expand valueSet, then set and cache answer options
      setLoading(true);
      AnswerValueSet.expand(fullUrl, (newOptions: ValueSet) => {
        const contains = newOptions.expansion?.contains;
        if (contains) {
          const answerOptions = AnswerValueSet.getValueCodings(contains);
          AnswerValueSet.cache[fullUrl] = answerOptions;
          setOptions(answerOptions);
        }
        setLoading(false);
      });
    }
  }

  return { options, loading, fetchNewOptions };
}

export default useValueSetAutocomplete;
