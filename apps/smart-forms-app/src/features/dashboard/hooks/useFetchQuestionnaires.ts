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

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Questionnaire } from 'fhir/r4';
import { filterQuestionnaires, getFormsServerBundlePromise } from '../utils/dashboard.ts';
import { useMemo } from 'react';
import { NUM_OF_QUESTIONNAIRES_TO_FETCH } from '../../../globals.ts';

interface useFetchQuestionnairesReturnParams {
  questionnaires: Questionnaire[];
  fetchStatus: UseQueryResult['status'];
  fetchError: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetchQuestionnaires: () => void;
}

function useFetchQuestionnaires(
  searchInput: string,
  debouncedInput: string,
  includeSubquestionnaires: boolean,
  minLengthToQuery?: number
): useFetchQuestionnairesReturnParams {
  const numOfSearchEntries = NUM_OF_QUESTIONNAIRES_TO_FETCH;

  let queryUrl = `/Questionnaire?_count=${numOfSearchEntries}&_sort=-date&`;
  if (debouncedInput) {
    queryUrl += 'title:contains=' + debouncedInput;
  }

  const queryIsLongEnough = minLengthToQuery ? debouncedInput.length >= minLengthToQuery : true;

  const {
    data: bundle,
    status,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery<Bundle>({
    queryKey: ['questionnaires' + numOfSearchEntries.toString(), queryUrl],
    queryFn: () => getFormsServerBundlePromise(queryUrl),
    enabled: queryIsLongEnough && debouncedInput === searchInput
  });

  const questionnaires: Questionnaire[] = useMemo(
    () => filterQuestionnaires(bundle, includeSubquestionnaires),
    [bundle, includeSubquestionnaires]
  );

  return {
    questionnaires,
    fetchStatus: status,
    fetchError: error,
    isLoading,
    isFetching,
    refetchQuestionnaires: refetch
  };
}

export default useFetchQuestionnaires;
