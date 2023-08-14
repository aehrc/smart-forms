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

import _isEqual from 'lodash/isEqual';
import type { PopulateFormParams } from '../utils/populate.ts';
import { populateQuestionnaire } from '../utils/populate.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { useSnackbar } from 'notistack';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';

function usePopulate(spinner: RendererSpinner, onStopSpinner: () => void): void {
  const { isSpinning, purpose } = spinner;
  const { smartClient, patient, user, encounter } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const sourceResponse = useQuestionnaireResponseStore((state) => state.sourceResponse);

  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );
  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);

  const setUpdatableResponseAsPopulated = useQuestionnaireResponseStore(
    (state) => state.setUpdatableResponseAsPopulated
  );

  const { enqueueSnackbar } = useSnackbar();

  const hasNotBeenPopulated = _isEqual(sourceResponse, updatableResponse);

  // Do not run population if spinner purpose is "repopulate"
  if (purpose === 'repopulate') {
    return;
  }

  /*
   * Perform pre-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of questionnaire-level extensions or contained resources
   * 3. QuestionnaireResponse does not have answer items
   * 4. QuestionnaireResponse is not from a saved draft response
   */
  const shouldPopulate =
    !!smartClient &&
    !!patient &&
    !!user &&
    isSpinning &&
    !!(sourceQuestionnaire.contained || sourceQuestionnaire.extension) &&
    hasNotBeenPopulated &&
    !sourceResponse.id;

  if (!shouldPopulate) {
    if (isSpinning) {
      onStopSpinner();
    }
    return;
  }

  populateQuestionnaire(
    sourceQuestionnaire,
    smartClient,
    patient,
    user,
    encounter,
    (params: PopulateFormParams) => {
      const { populated, hasWarnings } = params;

      const updatedResponse = updatePopulatedProperties(populated);
      setUpdatableResponseAsPopulated(updatedResponse);
      onStopSpinner();
      if (hasWarnings) {
        enqueueSnackbar(
          'Questionnaire form partially populated, there might be issues while populating the form. View console for details.',
          { action: <CloseSnackbar />, variant: 'warning' }
        );
      } else {
        enqueueSnackbar('Questionnaire form populated', {
          preventDuplicate: true,
          action: <CloseSnackbar />
        });
      }
    },
    () => {
      onStopSpinner();
      enqueueSnackbar('Form not populated', { action: <CloseSnackbar />, variant: 'warning' });
    }
  );
}

export default usePopulate;
