/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import {
  getFormsServerBundleOrQuestionnairePromise,
  getReferencedQuestionnaire
} from '../../../../utils/dashboard.ts';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { postQuestionnaireToSMARTHealthIT } from '../../../../../../api/saveQr.ts';
import { assembleIfRequired } from '../../../../../../utils/assemble.ts';
import { CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useSmartClient from '../../../../../../hooks/useSmartClient.ts';
import CloseSnackbar from '../../../../../../components/Snackbar/CloseSnackbar.tsx';
import { resetAndBuildForm } from '../../../../../../utils/manageForm.ts';
import { ConfigContext } from '../../../../../configChecker/contexts/ConfigContext.tsx';

interface CloneResponseButtonProps {
  selectedResponse: QuestionnaireResponse | null;
}

function CloneResponseButton(props: CloneResponseButtonProps) {
  const { selectedResponse } = props;

  const { smartClient, patient } = useSmartClient();
  const { config } = useContext(ConfigContext);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // reference could either be a canonical or an id
  const questionnaireRef = selectedResponse?.questionnaire;

  let queryUrl = '';
  if (questionnaireRef) {
    queryUrl += questionnaireRef?.startsWith('http')
      ? `/Questionnaire?_sort=-date&url=${questionnaireRef}`
      : `/${questionnaireRef}`;
  }

  // search referenced questionnaire
  const { data, error } = useQuery<Bundle | Questionnaire>({
    queryKey: ['referencedQuestionnaire', queryUrl],
    queryFn: () => getFormsServerBundleOrQuestionnairePromise(queryUrl, config.formsServerUrl),
    enabled: !!selectedResponse && !!questionnaireRef
  });

  if (error) {
    console.error(error);
    enqueueSnackbar('There might be an issue with this response', {
      variant: 'warning',
      action: <CloseSnackbar variant="warning" />
    });
  }

  let referencedQuestionnaire: Questionnaire | null = useMemo(
    () => getReferencedQuestionnaire(data),
    [data]
  );

  async function handleClick() {
    if (!selectedResponse) {
      enqueueSnackbar('No response selected.', {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      return;
    }

    if (!referencedQuestionnaire) {
      enqueueSnackbar('Referenced questionnaire of selected response not found', {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      return;
    }

    if (!smartClient || !patient) {
      enqueueSnackbar('App not launched via SMART App Launch, unable to clone response', {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      return;
    }

    setIsLoading(true);

    // Assemble questionnaire if selected response is linked to an assemble-root questionnaire
    referencedQuestionnaire = await assembleIfRequired(
      referencedQuestionnaire,
      config.formsServerUrl
    );

    // Return early if assembly cannot be performed
    if (!referencedQuestionnaire) {
      console.error(error);
      enqueueSnackbar('Referenced questionnaire not found. Unable to clone response', {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      setIsLoading(false);
      return;
    }

    // Post questionnaire to client if it is SMART Health IT
    if (smartClient.state.serverUrl.includes('https://launch.smarthealthit.org/v/r4/fhir')) {
      referencedQuestionnaire.id = referencedQuestionnaire.id + '-SMARTcopy';
      postQuestionnaireToSMARTHealthIT(smartClient, referencedQuestionnaire);
    }

    // Create a cloned response - strip id, meta, and authored so it is treated as a new response
    const { id: _id, meta: _meta, authored: _authored, ...clonedResponse } = selectedResponse;
    const newResponse: QuestionnaireResponse = {
      ...clonedResponse,
      status: 'in-progress'
    };

    // Build form with cloned response content - no pre-population occurs
    await resetAndBuildForm({
      questionnaire: referencedQuestionnaire,
      questionnaireResponse: newResponse,
      terminologyServerUrl: config.terminologyServerUrl
    });

    // Pass isClone flag via router state so RendererLayout skips pre-population
    navigate('/renderer', { state: { isClone: true } });
    setIsLoading(false);
  }

  const buttonIsDisabled = !selectedResponse || !referencedQuestionnaire || isLoading;

  return (
    <Stack alignItems="center">
      <IconButton
        disabled={buttonIsDisabled}
        color="secondary"
        onClick={handleClick}
        data-test="button-clone-response">
        {isLoading ? (
          <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
        ) : (
          <ContentCopyIcon />
        )}
      </IconButton>

      <Typography
        fontSize={9}
        variant="subtitle2"
        color={buttonIsDisabled ? 'text.disabled' : 'secondary'}
        textAlign="center"
        sx={{ mt: -0.5, mb: 0.5 }}>
        Clone response
      </Typography>
    </Stack>
  );
}

export default CloneResponseButton;
