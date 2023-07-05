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
import type { Bundle } from 'fhir/r4';
import {
  constructBundle,
  getClientBundlePromise,
  getResponseListItems
} from '../utils/dashboard.ts';
import { useContext, useMemo } from 'react';
import type { ResponseListItem } from '../types/list.interface.ts';
import useConfigStore from '../../../stores/useConfigStore.ts';
import type { Source } from '../../../types/source.interface.ts';
import { SelectedQuestionnaireContext } from '../contexts/SelectedQuestionnaireContext.tsx';

interface useFetchResponsesReturnParams {
  responses: Bundle | undefined;
  responseListItems: ResponseListItem[];
  fetchStatus: 'error' | 'success' | 'loading';
  fetchError: unknown;
  isFetching: boolean;
}

function useFetchResponses(
  searchInput: string,
  debouncedInput: string,
  questionnaireSource: Source
): useFetchResponsesReturnParams {
  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);

  const { existingResponses } = useContext(SelectedQuestionnaireContext);

  const numOfSearchEntries = 100;

  let queryUrl = `/QuestionnaireResponse?_count=${numOfSearchEntries}&_sort=-authored&patient=${patient?.id}&`;
  if (debouncedInput) {
    queryUrl += 'questionnaire.title:contains=' + debouncedInput;
  }

  const {
    data: responses,
    status,
    error,
    isFetching
  } = useQuery<Bundle>(
    ['response', queryUrl],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => getClientBundlePromise(smartClient!, queryUrl),
    {
      enabled: questionnaireSource === 'remote' && !!smartClient && debouncedInput === searchInput
    }
  );

  // create existing responses from a selectedResponse questionnaire if exists
  const existingResponseBundle: Bundle = useMemo(
    () => constructBundle(existingResponses),
    [existingResponses]
  );

  // construct response list items for data display
  const responseListItems: ResponseListItem[] = useMemo(
    () => getResponseListItems(existingResponses.length === 0 ? responses : existingResponseBundle),
    [responses, existingResponseBundle, existingResponses.length]
  );

  return { responses, responseListItems, fetchStatus: status, fetchError: error, isFetching };
}

export default useFetchResponses;
