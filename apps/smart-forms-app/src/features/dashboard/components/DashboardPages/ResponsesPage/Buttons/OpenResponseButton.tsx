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

import { useMemo, useState } from 'react';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Questionnaire } from 'fhir/r4';
import {
  getFormsServerBundleOrQuestionnairePromise,
  getReferencedQuestionnaire
} from '../../../../utils/dashboard.ts';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { postQuestionnaireToSMARTHealthIT } from '../../../../../save/api/saveQr.ts';
import type { SelectedResponse } from '../../../../types/list.interface.ts';
import { assembleIfRequired } from '../../../../../assemble/utils/assemble.ts';
import useConfigStore from '../../../../../../stores/useConfigStore.ts';
import useQuestionnaireStore from '../../../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../../../stores/useQuestionnaireResponseStore.ts';
import { LoadingButton } from '@mui/lab';

interface Props {
  selectedResponse: SelectedResponse | null;
}
function OpenResponseButton(props: Props) {
  const { selectedResponse } = props;

  const smartClient = useConfigStore((state) => state.smartClient);
  const buildSourceQuestionnaire = useQuestionnaireStore((state) => state.buildSourceQuestionnaire);
  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );

  const buildSourceResponse = useQuestionnaireResponseStore((state) => state.buildSourceResponse);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // reference could either be a canonical or an id
  const questionnaireRef = selectedResponse?.resource.questionnaire;

  let queryUrl = '';
  if (questionnaireRef) {
    queryUrl += questionnaireRef?.startsWith('http')
      ? `/Questionnaire?_sort=-date&url=${questionnaireRef}`
      : `/${questionnaireRef}`;
  }

  // search referenced questionnaire
  const { data, error } = useQuery<Bundle | Questionnaire>(
    ['referencedQuestionnaire', queryUrl],
    () => getFormsServerBundleOrQuestionnairePromise(queryUrl),
    {
      enabled: !!selectedResponse && !!questionnaireRef
    }
  );

  if (error) {
    console.error(error);
    enqueueSnackbar('There might be an issue with this response', { variant: 'warning' });
  }

  let referencedQuestionnaire: Questionnaire | null = useMemo(
    () => getReferencedQuestionnaire(data),
    [data]
  );

  async function handleClick() {
    if (!selectedResponse) {
      enqueueSnackbar('No response selected.', { variant: 'error' });
      return;
    }

    if (!referencedQuestionnaire) {
      enqueueSnackbar('Referenced questionnaire of selected response not found', {
        variant: 'error'
      });
      return;
    }
    setIsLoading(true);

    // assemble questionnaire if selected response is linked to an assemble-root questionnaire
    referencedQuestionnaire = await assembleIfRequired(referencedQuestionnaire);

    // return early if assembly cannot be performed
    if (!referencedQuestionnaire) {
      console.error(error);
      enqueueSnackbar('Referenced questionnaire not found. Unable to open response', {
        variant: 'error'
      });
      setIsLoading(false);
      return;
    }

    // Post questionnaire to client if it is SMART Health IT
    if (smartClient?.state.serverUrl.includes('/v/r4/fhir')) {
      referencedQuestionnaire.id = referencedQuestionnaire.id + '-SMARTcopy';
      postQuestionnaireToSMARTHealthIT(smartClient, referencedQuestionnaire);
    }

    // Assign questionnaire to questionnaire provider
    await buildSourceQuestionnaire(referencedQuestionnaire);

    // Assign questionnaireResponse to questionnaireResponse provider
    buildSourceResponse(selectedResponse.resource);
    updatePopulatedProperties(selectedResponse.resource);

    navigate('/viewer');
    setIsLoading(false);
  }

  return (
    <LoadingButton
      variant="contained"
      disabled={!selectedResponse || !referencedQuestionnaire}
      loading={isLoading}
      loadingPosition="end"
      endIcon={<Iconify icon="material-symbols:open-in-new" />}
      sx={{
        px: 2.25,
        backgroundColor: 'secondary.main',
        '&:hover': {
          backgroundColor: 'secondary.dark'
        }
      }}
      data-test="button-open-response"
      onClick={handleClick}>
      Open Response
    </LoadingButton>
  );
}

export default OpenResponseButton;
