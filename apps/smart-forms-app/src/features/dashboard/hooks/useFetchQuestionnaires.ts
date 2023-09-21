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

import { useQuery } from '@tanstack/react-query';
import type { Bundle, Questionnaire } from 'fhir/r4';
import { filterQuestionnaires, getFormsServerBundlePromise } from '../utils/dashboard.ts';
import { useMemo } from 'react';

interface useFetchQuestionnairesReturnParams {
  questionnaires: Questionnaire[];
  fetchStatus: 'error' | 'success' | 'loading';
  fetchError: unknown;
  isInitialLoading: boolean;
  isFetching: boolean;
}

function useFetchQuestionnaires(
  searchInput: string,
  debouncedInput: string,
  minLengthToQuery?: number
): useFetchQuestionnairesReturnParams {
  const numOfSearchEntries = 100;

  let queryUrl = `/Questionnaire?_count=${numOfSearchEntries}&_sort=-date&`;
  if (debouncedInput) {
    queryUrl += 'title:contains=' + debouncedInput;
  }

  const queryIsLongEnough = minLengthToQuery ? debouncedInput.length >= minLengthToQuery : true;

  const {
    data: bundle,
    status,
    isInitialLoading,
    error,
    isFetching
  } = useQuery<Bundle>(
    ['questionnaires' + numOfSearchEntries.toString(), queryUrl],
    () => getFormsServerBundlePromise(queryUrl),
    {
      enabled: queryIsLongEnough && debouncedInput === searchInput
    }
  );

  const questionnaires: Questionnaire[] = useMemo(() => filterQuestionnaires(bundle), [bundle]);

  return {
    questionnaires,
    fetchStatus: status,
    fetchError: error,
    isInitialLoading,
    isFetching
  };
}

export default useFetchQuestionnaires;
