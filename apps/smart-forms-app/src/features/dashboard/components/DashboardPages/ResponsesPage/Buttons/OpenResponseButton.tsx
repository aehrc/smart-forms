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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import useSmartClient from '../../../../../../hooks/useSmartClient.ts';
import CloseSnackbar from '../../../../../../components/Snackbar/CloseSnackbar.tsx';
import { resetAndBuildForm } from '../../../../../../utils/manageForm.ts';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from '../../../../../prepopulate/utils/callback.ts';
import { ConfigContext } from '../../../../../configChecker/contexts/ConfigContext.tsx';

interface OpenResponseButtonProps {
  selectedResponse: QuestionnaireResponse | null;
}

function OpenResponseButton(props: OpenResponseButtonProps) {
  const { selectedResponse } = props;

  const { smartClient, patient, user, encounter } = useSmartClient();
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
      enqueueSnackbar('App not launched via SMART App Launch, unable to open response', {
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
      enqueueSnackbar('Referenced questionnaire not found. Unable to open response', {
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

    // Do a population step to bring in the latest populated context - to update cqf-expressions
    const populateRes = await populateQuestionnaire({
      questionnaire: referencedQuestionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: smartClient.state.serverUrl,
        authToken: smartClient.state.tokenResponse?.access_token
      },
      patient: patient,
      user: user ?? undefined,
      encounter: encounter ?? undefined
    });

    const newPopulatedContext = populateRes.populateResult?.populatedContext;

    // Before building the form, reset any existing form state
    await resetAndBuildForm({
      questionnaire: referencedQuestionnaire,
      questionnaireResponse: selectedResponse,
      terminologyServerUrl: config.terminologyServerUrl,
      additionalContext: newPopulatedContext
    });

    navigate('/viewer');
    setIsLoading(false);
  }

  const buttonIsDisabled = !selectedResponse || !referencedQuestionnaire || isLoading;

  return (
    <Stack alignItems="center">
      <IconButton
        disabled={buttonIsDisabled}
        color="secondary"
        onClick={handleClick}
        data-test="button-open-response">
        {isLoading ? (
          <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
        ) : (
          <OpenInNewIcon />
        )}
      </IconButton>

      <Typography
        fontSize={9}
        variant="subtitle2"
        color={buttonIsDisabled ? 'text.disabled' : 'secondary'}
        textAlign="center"
        sx={{ mt: -0.5, mb: 0.5 }}>
        Open Response
      </Typography>
    </Stack>
  );
}

export default OpenResponseButton;
