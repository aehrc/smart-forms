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
import type { Bundle, QuestionnaireResponse } from 'fhir/r4';
import { constructBundle, filterResponses, getClientBundlePromise } from '../utils/dashboard.ts';
import { useMemo } from 'react';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import useSelectedQuestionnaire from './useSelectedQuestionnaire.ts';

interface useFetchResponsesReturnParams {
  responses: QuestionnaireResponse[];
  fetchStatus: 'error' | 'success' | 'loading';
  fetchError: unknown;
  isFetching: boolean;
}

function useFetchResponses(
  searchInput: string,
  debouncedInput: string
): useFetchResponsesReturnParams {
  const { smartClient, patient } = useSmartClient();

  const { existingResponses } = useSelectedQuestionnaire();

  const numOfSearchEntries = 50;

  let queryUrl = `/QuestionnaireResponse?_count=${numOfSearchEntries}&_sort=-authored&patient=${patient?.id}&`;
  if (debouncedInput) {
    queryUrl += 'questionnaire.title:contains=' + debouncedInput;
  }

  const {
    data: bundle,
    status,
    error,
    isFetching
  } = useQuery<Bundle>(
    ['response', queryUrl],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => getClientBundlePromise(smartClient!, queryUrl),
    {
      enabled: !!smartClient && debouncedInput === searchInput
    }
  );

  // create existing responses from a selectedResponse questionnaire if exists
  const existingResponseBundle: Bundle = useMemo(
    () => constructBundle(existingResponses),
    [existingResponses]
  );

  // construct response list items for data display
  const responses: QuestionnaireResponse[] = useMemo(
    () => filterResponses(existingResponses.length === 0 ? bundle : existingResponseBundle),
    [bundle, existingResponseBundle, existingResponses.length]
  );

  return { responses, fetchStatus: status, fetchError: error, isFetching };
}

export default useFetchResponses;
