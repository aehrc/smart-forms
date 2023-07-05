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

import { Button, CircularProgress } from '@mui/material';
import { useContext, useMemo } from 'react';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import { getClientBundlePromise, getResponsesFromBundle } from '../../../../utils/dashboard.ts';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, QuestionnaireResponse } from 'fhir/r4';
import { SelectedQuestionnaireContext } from '../../../../contexts/SelectedQuestionnaireContext.tsx';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import useConfigStore from '../../../../../../stores/useConfigStore.ts';

function ViewExistingResponsesButton() {
  const { selectedQuestionnaire, setExistingResponses } = useContext(SelectedQuestionnaireContext);

  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);
  const questionnaireSource = useConfigStore((state) => state.questionnaireSource);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // search responses from selected questionnaire
  let questionnaireRefParam = '';

  // Have different questionnaireRef config due to SMART Health IT limitation
  if (smartClient) {
    const questionnaireRef = smartClient.state.serverUrl.includes('/v/r4/fhir')
      ? `Questionnaire/${selectedQuestionnaire?.resource?.id}-SMARTcopy`
      : selectedQuestionnaire?.resource?.url;

    if (questionnaireRef) {
      questionnaireRefParam = `questionnaire=${questionnaireRef}&`;
    }
  }

  const patientIdParam = patient?.id ? `patient=${patient?.id}&` : '';
  const queryUrl = '/QuestionnaireResponse?' + questionnaireRefParam + patientIdParam;

  const { data, isInitialLoading, error } = useQuery<Bundle>(
    ['existingResponses', queryUrl],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => getClientBundlePromise(smartClient!, queryUrl),
    {
      enabled:
        !!selectedQuestionnaire &&
        questionnaireRefParam !== '' &&
        patientIdParam !== '' &&
        questionnaireSource === 'remote' &&
        !!smartClient
    }
  );

  if (error) {
    console.error(error);
    enqueueSnackbar('An error occurred while fetching existing responses', {
      variant: 'error',
      preventDuplicate: true
    });
  }

  const existingResponses: QuestionnaireResponse[] = useMemo(
    () => getResponsesFromBundle(data),
    [data]
  );

  function handleClick() {
    setExistingResponses(existingResponses);
    navigate('/dashboard/responses');
  }

  return (
    <Button
      variant="contained"
      disabled={
        !selectedQuestionnaire || existingResponses.length === 0 || questionnaireSource === 'local'
      }
      endIcon={
        isInitialLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : data && existingResponses.length === 0 ? null : (
          <Iconify icon="material-symbols:arrow-forward" />
        )
      }
      data-test="button-view-responses"
      sx={{ width: 175 }}
      onClick={handleClick}>
      {data && existingResponses.length === 0 ? 'No Responses Found' : 'View Responses'}
    </Button>
  );
}

export default ViewExistingResponsesButton;