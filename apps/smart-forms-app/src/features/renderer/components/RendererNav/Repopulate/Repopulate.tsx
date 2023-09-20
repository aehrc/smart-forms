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
import { Backdrop, Tooltip } from '@mui/material';
import type { RendererSpinner } from '../../../types/rendererSpinner.ts';
import useSmartClient from '../../../../../hooks/useSmartClient.ts';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import {
  generateItemsToRepopulate,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import PopulationProgressSpinner from '../../../../../components/Spinners/PopulationProgressSpinner.tsx';
import RepopulateDialog from '../../../../repopulate/components/RepopulateDialog.tsx';
import { useState } from 'react';

interface RepopulateProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function Repopulate(props: RepopulateProps) {
  const { spinner, onSpinnerChange } = props;

  const { smartClient, patient, user, encounter } = useSmartClient();

  const [itemsToRepopulate, setItemsToRepopulate] = useState<Record<string, ItemToRepopulate>>({});

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const sourceResponse = useQuestionnaireResponseStore((state) => state.sourceResponse);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isRepopulating = spinner.isSpinning && spinner.status === 'repopulate';
  const isRepopulated = !spinner.isSpinning && spinner.status === 'repopulate';

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

  async function handleClick() {
    closeSnackbar();
    if (!shouldRepopulate) {
      return;
    }

    onSpinnerChange({ isSpinning: true, status: 'repopulate', message: 'Re-populating form' });
    const newPatient = await smartClient.patient.read();
    // FIXME get latest user and encounter info as well

    populateQuestionnaire(
      sourceQuestionnaire,
      smartClient,
      newPatient,
      user,
      encounter,
      (params: PopulateFormParams) => {
        const { populated, hasWarnings } = params;

        const itemToRepopulate = generateItemsToRepopulate(populated);

        if (Object.keys(itemToRepopulate).length > 0) {
          setItemsToRepopulate(itemToRepopulate);
        }

        onSpinnerChange({ isSpinning: false, status: 'repopulate', message: '' });
        if (hasWarnings) {
          enqueueSnackbar(
            'Questionnaire form partially re-populated, there might be issues while repopulating the form. View console for details.',
            { action: <CloseSnackbar />, variant: 'warning' }
          );
          return;
        }
      },
      () => {
        onSpinnerChange({ isSpinning: false, status: 'repopulate', message: '' });
        enqueueSnackbar('Form not re-populated', { action: <CloseSnackbar />, variant: 'warning' });
      }
    );
  }

  // Re-population strategy
  // 1. re-populate fields not marked as dirty and have these under "Re-populated fields" section
  // 2. if a field is dirty, allow users to manually sync the field (current answer - changes from server ) under "Resolve repopulate conflicts" section

  return (
    <>
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

      <Backdrop
        sx={{
          backgroundColor: alpha(grey[200], 0.33),
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={isRepopulating}
        onClick={() => onSpinnerChange({ ...spinner, isSpinning: false })}>
        <PopulationProgressSpinner message={spinner.message} />
      </Backdrop>
      <RepopulateDialog
        isRepopulated={isRepopulated}
        itemsToRepopulate={itemsToRepopulate}
        onCloseDialog={() => onSpinnerChange({ isSpinning: false, status: null, message: '' })}
      />
    </>
  );
}

export default Repopulate;
