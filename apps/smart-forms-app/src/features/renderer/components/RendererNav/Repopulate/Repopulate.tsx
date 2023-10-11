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
import CloudSyncIcon from '@mui/icons-material/CloudSync';
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
import type { Practitioner } from 'fhir/r4';

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

  const fhirPathContext = useQuestionnaireStore((state) => state.fhirPathContext);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const isRepopulateFetching = spinner.isSpinning && spinner.status === 'repopulate-fetch';
  const repopulateFetchEnded = !spinner.isSpinning && spinner.status === 'repopulate-fetch';

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

  async function handleClick() {
    closeSnackbar();
    if (!shouldRepopulate) {
      return;
    }

    onSpinnerChange({
      isSpinning: true,
      status: 'repopulate-fetch',
      message: 'Retrieving latest information'
    });
    const newPatient = await smartClient.patient.read();
    const newUser = (await smartClient.user.read()) as Practitioner;

    populateQuestionnaire(
      sourceQuestionnaire,
      smartClient,
      newPatient,
      newUser,
      encounter,
      fhirPathContext,
      (params: PopulateFormParams) => {
        const { populated, hasWarnings } = params;

        const itemToRepopulate = generateItemsToRepopulate(populated);

        setItemsToRepopulate(itemToRepopulate);

        onSpinnerChange({ isSpinning: false, status: 'repopulate-fetch', message: '' });
        if (hasWarnings) {
          enqueueSnackbar(
            'There might be issues while retrieving the latest information, data is partially retrieved. View console for details.',
            { action: <CloseSnackbar />, variant: 'warning' }
          );
          return;
        }
      },
      () => {
        onSpinnerChange({ isSpinning: false, status: null, message: '' });
        enqueueSnackbar('There is an error while retrieving latest data for re-population.', {
          action: <CloseSnackbar />,
          variant: 'warning'
        });
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
            icon={<CloudSyncIcon />}
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
        open={isRepopulateFetching}
        onClick={() => onSpinnerChange({ ...spinner, isSpinning: false })}>
        <PopulationProgressSpinner message={spinner.message} />
      </Backdrop>
      <RepopulateDialog
        repopulateFetchingEnded={repopulateFetchEnded}
        itemsToRepopulate={itemsToRepopulate}
        onCloseDialog={() => onSpinnerChange({ isSpinning: false, status: null, message: '' })}
        onSpinnerChange={onSpinnerChange}
      />
    </>
  );
}

export default Repopulate;
