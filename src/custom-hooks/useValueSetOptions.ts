import { useState, useEffect } from 'react';
import { Coding, QuestionnaireItem, ValueSet } from 'fhir/r5';
import { AnswerValueSet } from '../classes/AnswerValueSet';

function useValueSetOptions(qItem: QuestionnaireItem) {
  const [options, setOptions] = useState<Coding[]>([]);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl) return;

    // set options from cached answer options if present
    const cachedAnswerOptions = AnswerValueSet.cache[valueSetUrl];
    if (cachedAnswerOptions) {
      setOptions(cachedAnswerOptions);
      return;
    }

    // get options from ontoserver and cache them for future use
    AnswerValueSet.expand(valueSetUrl, (newOptions: ValueSet) => {
      const contains = newOptions.expansion?.contains;
      if (contains) {
        const answerOptions = AnswerValueSet.getValueCodings(contains);
        AnswerValueSet.cache[valueSetUrl] = answerOptions;
        setOptions(answerOptions);
      }
    });
  }, [qItem]);

  return [options];
}

export default useValueSetOptions;
