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
import type { Bundle, QuestionnaireResponse } from 'fhir/r4';
import { getClientBundlePromise, getResponsesFromBundle } from '../utils/dashboard.ts';
import { useMemo } from 'react';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import useSelectedQuestionnaire from './useSelectedQuestionnaire.ts';

interface useFetchExistingResponsesReturnParams {
  existingResponses: QuestionnaireResponse[];
  fetchError: unknown;
  isFetching: boolean;
  refetchResponses: () => void;
}

function useFetchExistingResponses(): useFetchExistingResponsesReturnParams {
  const { selectedQuestionnaire } = useSelectedQuestionnaire();

  const numOfSearchEntries = 100;

  const { smartClient, patient, launchQuestionnaire } = useSmartClient();
  const questionnaire = selectedQuestionnaire ?? launchQuestionnaire;

  // search responses from selected questionnaire
  let questionnaireRefParam = '';

  // Have different questionnaireRef config due to SMART Health IT limitation
  if (smartClient) {
    let questionnaireRef = '';
    if (smartClient.state.serverUrl.includes('https://launch.smarthealthit.org/v/r4/fhir')) {
      questionnaireRef = `Questionnaire/${questionnaire?.id}-SMARTcopy`;
    } else {
      questionnaireRef = questionnaire?.url ?? '';
      if (questionnaire?.version) {
        questionnaireRef += `|${questionnaire?.version}`;
      }
    }

    if (questionnaireRef) {
      questionnaireRefParam = `questionnaire=${questionnaireRef}&`;
    }
  }

  const patientIdParam = patient?.id ? `patient=${patient?.id}&` : '';
  const queryUrl =
    `/QuestionnaireResponse?_count=${numOfSearchEntries}&_sort=-authored&` +
    questionnaireRefParam +
    patientIdParam;

  const { data, isFetching, error, refetch } = useQuery<Bundle>(
    ['existingResponses', queryUrl],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => getClientBundlePromise(smartClient!, queryUrl),
    {
      enabled:
        !!questionnaire && questionnaireRefParam !== '' && patientIdParam !== '' && !!smartClient
    }
  );

  const existingResponses: QuestionnaireResponse[] = useMemo(
    () => getResponsesFromBundle(data),
    [data]
  );
  return { existingResponses, fetchError: error, isFetching, refetchResponses: refetch };
}

export default useFetchExistingResponses;
