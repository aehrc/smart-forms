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

import { useState, useContext } from 'react';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { useSnackbar } from 'notistack';
import { ConfigContext } from '../../configChecker/contexts/ConfigContext.tsx';
import {
  buildForm,
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useTerminologyServerStore
} from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback, fetchTerminologyCallback } from '../utils/callback.ts';

function usePopulate(spinner: RendererSpinner, onStopSpinner: () => void): void {
  const { isSpinning, status } = spinner;

  const { smartClient, patient, user, encounter, fhirContext } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  const [isPopulated, setIsPopulated] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { config } = useContext(ConfigContext);

  // Do not run population if spinner purpose is "repopulate"
  if (status !== 'prepopulate') {
    return;
  }

  /*
   * Perform pre-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of questionnaire-level extensions or contained resources
   * 3. QuestionnaireResponse does not have answer items
   * 4. QuestionnaireResponse is not from a saved draft response
   */
  const formCanBePopulated =
    !!smartClient &&
    !!patient &&
    !!user &&
    isSpinning &&
    !!(sourceQuestionnaire.contained || sourceQuestionnaire.extension) &&
    formChangesHistory.length === 0 &&
    !sourceResponse.id;

  if (!formCanBePopulated) {
    if (isSpinning) {
      onStopSpinner();
    }
    return;
  }

  if (isPopulated) {
    return;
  }

  setIsPopulated(true);
  populateQuestionnaire({
    questionnaire: sourceQuestionnaire,
    fetchResourceCallback: fetchResourceCallback,
    fetchResourceRequestConfig: {
      sourceServerUrl: smartClient.state.serverUrl,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authToken: smartClient.state.tokenResponse!.access_token!
    },
    patient: patient,
    user: user,
    encounter: encounter ?? undefined,
    fhirContext: fhirContext ?? undefined,
    fetchTerminologyCallback: fetchTerminologyCallback,
    fetchTerminologyRequestConfig: {
      terminologyServerUrl: defaultTerminologyServerUrl
    }
  })
    .then(async (populateRes) => {
      if (!populateRes) {
        onStopSpinner();
        enqueueSnackbar('Form not populated', {
          variant: 'warning',
          action: <CloseSnackbar variant="warning" />
        });
        return;
      }

      const { populateSuccess, populateResult } = populateRes;
      if (!populateResult || !populateSuccess) {
        onStopSpinner();
        enqueueSnackbar('Form not populated', {
          variant: 'warning',
          action: <CloseSnackbar variant="warning" />
        });
        return;
      }

      const { populatedResponse, issues, populatedContext } = populateResult;

      // Re-run buildForm() with the new populatedResponse
      await buildForm({
        questionnaire: sourceQuestionnaire,
        questionnaireResponse: populatedResponse,
        terminologyServerUrl: defaultTerminologyServerUrl,
        additionalContext: populatedContext
      });

      onStopSpinner();
      if (issues) {
        // Only show the snackbar message if developer messages are enabled
        if (config.showDeveloperMessages ?? true) {
          enqueueSnackbar(
            'Form partially populated, there might be pre-population issues. View console for details.',
            { action: <CloseSnackbar /> }
          );
        }
        // Always log to console - clinicians won't see this, but developers need it
        console.warn(issues);
        return;
      }

      enqueueSnackbar('Form populated', {
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
    })
    .catch(() => {
      onStopSpinner();
      enqueueSnackbar('Form not populated', {
        variant: 'warning',
        action: <CloseSnackbar variant="warning" />
      });
    });
}

export default usePopulate;
