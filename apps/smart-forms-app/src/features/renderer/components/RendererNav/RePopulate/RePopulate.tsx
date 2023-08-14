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

import { RendererOperationItem } from '../RendererOperationSection.tsx';
import SyncIcon from '@mui/icons-material/Sync';
import { useSnackbar } from 'notistack';
import type { PopulateFormParams } from '../../../../prepopulate/utils/populate.ts';
import { populateQuestionnaire } from '../../../../prepopulate/utils/populate.ts';
import CloseSnackbar from '../../../../../components/Snackbar/CloseSnackbar.tsx';
import { Tooltip } from '@mui/material';
import type { RendererSpinner } from '../../../types/rendererSpinner.ts';
import useSmartClient from '../../../../../hooks/useSmartClient.ts';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';

interface RepopulateProps {
  spinner: RendererSpinner;
  onStartRepopulating: () => void;
  onStopRepopulating: () => void;
}

function Repopulate(props: RepopulateProps) {
  const { spinner, onStartRepopulating, onStopRepopulating } = props;

  const { smartClient, patient, user, encounter } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );

  const sourceResponse = useQuestionnaireResponseStore((state) => state.sourceResponse);
  const setUpdatableResponseAsPopulated = useQuestionnaireResponseStore(
    (state) => state.setUpdatableResponseAsPopulated
  );

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  /*
   * Perform pre-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of questionnaire-level extensions or contained resources
   * 3. QuestionnaireResponse does not have answer items
   */
  const shouldRepopulate =
    !!smartClient &&
    !!patient &&
    !!user &&
    !!(sourceQuestionnaire.contained || sourceQuestionnaire.extension) &&
    !sourceResponse.id;

  // dont change tab

  function handleClick() {
    closeSnackbar();
    if (!shouldRepopulate) {
      return;
    }

    onStartRepopulating();
    populateQuestionnaire(
      sourceQuestionnaire,
      smartClient,
      patient,
      user,
      encounter,
      (params: PopulateFormParams) => {
        const { populated, hasWarnings } = params;

        const updatedResponse = updatePopulatedProperties(populated, true);
        setUpdatableResponseAsPopulated(updatedResponse);
        onStopRepopulating();
        if (hasWarnings) {
          enqueueSnackbar(
            'Questionnaire form partially re-populated, there might be issues while repopulating the form. View console for details.',
            { action: <CloseSnackbar />, variant: 'warning' }
          );
        } else {
          enqueueSnackbar('Questionnaire form re-populated', {
            preventDuplicate: true,
            action: <CloseSnackbar />
          });
        }
      },
      () => {
        onStopRepopulating();
        enqueueSnackbar('Form not re-populated', { action: <CloseSnackbar />, variant: 'warning' });
      }
    );
  }

  // Re-population strategy
  // 1. re-populate fields not marked as dirty and have these under "Re-populated fields" section
  // 2. if a field is dirty, allow users to manually sync the field (current answer - changes from server ) under "Resolve repopulate conflicts" section

  return (
    <Tooltip title="Form does not support pre-population" disableHoverListener={shouldRepopulate}>
      <span>
        <RendererOperationItem
          title="Repopulate Form"
          icon={<SyncIcon />}
          disabled={!shouldRepopulate || spinner.isSpinning}
          onClick={handleClick}
        />
      </span>
    </Tooltip>
  );
}

export default Repopulate;
