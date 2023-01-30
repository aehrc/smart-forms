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
import { Coding, QuestionnaireItem, ValueSet } from 'fhir/r5';
import { AnswerValueSet } from '../classes/AnswerValueSet';
import { ContainedValueSetContext } from '../components/QRenderer/Form';

function useValueSetOptions(qItem: QuestionnaireItem) {
  const containedValueSetContext = useContext(ContainedValueSetContext);

  const valueSetUrl = qItem.answerValueSet;
  if (!valueSetUrl) {
    return { options: [], serverError: null };
  }

  let answerOptions: Coding[] = [];

  // set options from cached answer options if present
  const cachedAnswerOptions = AnswerValueSet.cache[valueSetUrl];
  if (cachedAnswerOptions) {
    answerOptions = cachedAnswerOptions;
  } else if (valueSetUrl.startsWith('#')) {
    // set options from contained valueSet if present
    const reference = valueSetUrl.slice(1);
    const valueSet = containedValueSetContext[reference];
    if (valueSet) {
      answerOptions = getValueSetOptions(valueSetUrl, valueSet);
    }
  }

  const [options, setOptions] = useState<Coding[]>(answerOptions);
  const [serverError, setServerError] = useState<Error | null>(null);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl) return;

    if (!cachedAnswerOptions && !valueSetUrl.startsWith('#')) {
      AnswerValueSet.expand(
        valueSetUrl,
        (valueSet: ValueSet) => {
          setOptions(getValueSetOptions(valueSetUrl, valueSet));
        },
        (error: Error) => {
          setServerError(error);
        }
      );
    }
  }, [qItem]);

  return { options, serverError };
}

function getValueSetOptions(valueSetUrl: string, valueSet: ValueSet): Coding[] {
  const contains = valueSet.expansion?.contains;
  if (contains) {
    const answerOptions = AnswerValueSet.getValueCodings(contains);
    AnswerValueSet.cache[valueSetUrl] = answerOptions;
    return answerOptions;
  }
  return [];
}

export default useValueSetOptions;
