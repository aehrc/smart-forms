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

import { useState } from 'react';
import { populateQuestionnaire } from '../utils/populate.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { useSnackbar } from 'notistack';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';

function usePopulate(spinner: RendererSpinner, onStopSpinner: () => void): void {
  const { isSpinning, status } = spinner;

  const { smartClient, patient, user, encounter } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const fhirPathContext = useQuestionnaireStore.use.fhirPathContext();

  const updatePopulatedProperties = useQuestionnaireStore.use.updatePopulatedProperties();

  const setUpdatableResponseAsPopulated =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsPopulated();
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  const [isPopulated, setIsPopulated] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

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
  populateQuestionnaire(sourceQuestionnaire, smartClient, patient, user, encounter, fhirPathContext)
    .then(({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        onStopSpinner();
        enqueueSnackbar('Form not populated', { action: <CloseSnackbar />, variant: 'warning' });
        return;
      }

      const { populated, hasWarnings, populatedContext } = populateResult;
      const updatedResponse = updatePopulatedProperties(populated, populatedContext);
      setUpdatableResponseAsPopulated(updatedResponse);
      onStopSpinner();
      if (hasWarnings) {
        enqueueSnackbar(
          'Form partially populated, there might be pre-population issues. View console for details.',
          { action: <CloseSnackbar /> }
        );
        return;
      }

      enqueueSnackbar('Form populated', {
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
    })
    .catch(() => {
      onStopSpinner();
      enqueueSnackbar('Form not populated', { action: <CloseSnackbar />, variant: 'warning' });
    });
}

export default usePopulate;
