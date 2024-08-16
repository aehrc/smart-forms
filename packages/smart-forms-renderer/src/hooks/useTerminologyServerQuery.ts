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

import { useQuery } from '@tanstack/react-query';
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r4';
import {
  getTerminologyServerUrl,
  getValueSetCodings,
  getValueSetPromise,
  postValueSetPromise
} from '../utils/valueSet';

import type { AlertColor } from '@mui/material/Alert';
import { useQuestionnaireStore, useTerminologyServerStore } from '../stores';

function useTerminologyServerQuery(
  qItem: QuestionnaireItem,
  maxList: number,
  input: string,
  searchTerm: string
): { options: Coding[]; loading: boolean; feedback?: { message: string; color: AlertColor } } {
  const processedValueSets = useQuestionnaireStore.use.processedValueSets();
  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  let fullUrl = '';
  let options: Coding[] = [];
  let feedback: { message: string; color: AlertColor } | undefined;

  if (input.length === 0) {
    feedback = undefined;
  }

  if (searchTerm.length < 2 && searchTerm.length > 0) {
    feedback = { message: 'Enter at least 2 characters to search for results.', color: 'info' };
  }

  // Restructure url to include filter and count parameters
  let answerValueSetUrl = qItem.answerValueSet;
  let valueSetToPost: ValueSet | null = null;
  let isGetRequest = true;
  if (answerValueSetUrl) {
    if (answerValueSetUrl.startsWith('#')) {
      answerValueSetUrl = answerValueSetUrl.slice(1);
    }

    // attempt to get url from contained value sets when loading questionnaire
    const processedValueSet = processedValueSets[answerValueSetUrl];
    if (processedValueSet) {
      if (processedValueSet.url) {
        answerValueSetUrl = processedValueSet.url;
      } else {
        valueSetToPost = processedValueSet;
        isGetRequest = false;
      }
    }

    const urlWithTrailingAmpersand =
      answerValueSetUrl + (answerValueSetUrl[answerValueSetUrl.length - 1] !== '&' ? '&' : '');
    fullUrl = urlWithTrailingAmpersand + 'filter=' + searchTerm + '&count=' + maxList;
  }

  // Perform query
  const terminologyServerUrl = getTerminologyServerUrl(qItem) ?? defaultTerminologyServerUrl;
  const { isFetching, error, data } = useQuery<ValueSet>(
    ['expandValueSet', fullUrl],
    () => {
      if (isGetRequest) {
        return getValueSetPromise(fullUrl, terminologyServerUrl);
      }

      if (valueSetToPost) {
        return postValueSetPromise(valueSetToPost, terminologyServerUrl);
      }

      return Promise.resolve({ resourceType: 'ValueSet', expansion: { total: 0 } } as ValueSet);
    },
    {
      enabled: searchTerm.length >= 2 && answerValueSetUrl !== undefined
    }
  );

  if (error) {
    console.warn('Ontoserver query failed. Details below: \n' + error);
    feedback = {
      message: 'An error occurred. Try again later or try searching for a different term.',
      color: 'error'
    };
  }

  if (data) {
    if (data.expansion?.total !== 0) {
      options = getValueSetCodings(data);
    } else {
      feedback = {
        message: "We couldn't seem to find anything. Try searching for a different term.",
        color: 'warning'
      };
    }
  }

  return { options, loading: isFetching, feedback };
}
export default useTerminologyServerQuery;
