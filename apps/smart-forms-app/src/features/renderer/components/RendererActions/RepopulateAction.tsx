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

import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useSnackbar } from 'notistack';
import { populateQuestionnaire } from '../../../prepopulate/utils/populate.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import type { SpeedDialActionProps } from '@mui/material';
import { SpeedDialAction, Tooltip } from '@mui/material';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { generateItemsToRepopulate, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import RepopulateDialog from '../../../repopulate/components/RepopulateDialog.tsx';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';
import { useMutation } from '@tanstack/react-query';
import { readCommonLaunchContexts } from '../../../smartAppLaunch/utils/launch.ts';
import { useRepopulationStore } from '../../../repopulate/stores/RepopulationStore.ts';

interface RepopulateActionProps extends SpeedDialActionProps {
  spinner: RendererSpinner;
  isSpeedDial?: boolean;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RepopulateAction(props: RepopulateActionProps) {
  const { spinner, isSpeedDial, onSpinnerChange, ...speedDialActionProps } = props;

  const { smartClient, patient, user } = useSmartClient();

  const setItemsToRepopulate = useRepopulationStore.use.setItemsToRepopulate();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const fhirPathContext = useQuestionnaireStore.use.fhirPathContext();
  const setPopulatedContext = useQuestionnaireStore.use.setPopulatedContext();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const repopulateFetchEnded = !spinner.isSpinning && spinner.status === 'repopulate-fetch';

  /*
   * Perform re-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of questionnaire-level extensions or contained resources
   */
  const shouldRepopulate =
    !!smartClient &&
    !!patient &&
    !!user &&
    !!(sourceQuestionnaire.contained || sourceQuestionnaire.extension);

  const { mutate: repopulateMutation } = useMutation({
    mutationFn: (params: {
      newPatient: Patient;
      newUser: Practitioner;
      newEncounter: Encounter | null;
    }) => {
      const { newPatient, newUser, newEncounter } = params;

      return populateQuestionnaire(
        sourceQuestionnaire,
        smartClient!,
        newPatient,
        newUser,
        newEncounter,
        fhirPathContext
      );
    },
    onSuccess: ({ populateSuccess, populateResult }) => {
      // Repopulate operation has already been cancelled, don't show repopulate dialog
      if (!spinner.isSpinning && spinner.status === 'repopulate-cancel') {
        return;
      }

      if (!populateSuccess || !populateResult) {
        onSpinnerChange({ isSpinning: false, status: null, message: '' });
        enqueueSnackbar('There is an error while retrieving latest data for re-population.', {
          action: <CloseSnackbar />,
          variant: 'warning'
        });
        return;
      }

      const { populated, hasWarnings, populatedContext } = populateResult;

      // If populatedContext is provided, update it in QuestionnaireStore so it gets updated in debug panel
      if (populatedContext) {
        setPopulatedContext(populatedContext);
      }

      const itemToRepopulate = generateItemsToRepopulate(populated);

      setItemsToRepopulate(itemToRepopulate);

      onSpinnerChange({ isSpinning: false, status: 'repopulate-fetch', message: '' });
      if (hasWarnings) {
        enqueueSnackbar(
          'There might be issues while retrieving the latest information, data is partially retrieved. View console for details.',
          { action: <CloseSnackbar /> }
        );
        return;
      }
    },
    onError: () => {
      onSpinnerChange({ isSpinning: false, status: null, message: '' });
      enqueueSnackbar('There is an error while retrieving latest data for re-population.', {
        action: <CloseSnackbar />,
        variant: 'warning'
      });
    }
  });

  async function handleRepopulate() {
    closeSnackbar();
    if (!shouldRepopulate) {
      return;
    }

    onSpinnerChange({
      isSpinning: true,
      status: 'repopulate-fetch',
      message: 'Retrieving latest information'
    });

    const { patient, user, encounter } = await readCommonLaunchContexts(smartClient);

    repopulateMutation({
      newPatient: patient as Patient,
      newUser: user as Practitioner,
      newEncounter: encounter
    });
  }

  return (
    <>
      {isSpeedDial ? (
        shouldRepopulate ? (
          <SpeedDialAction
            icon={<CloudSyncIcon />}
            tooltipTitle="Repopulate Form"
            tooltipOpen
            onClick={handleRepopulate}
            {...speedDialActionProps}
          />
        ) : null
      ) : (
        <Tooltip
          title="Form does not support pre-population"
          disableHoverListener={shouldRepopulate}>
          <span>
            <RendererOperationItem
              title="Repopulate Form"
              icon={<CloudSyncIcon />}
              disabled={!shouldRepopulate || spinner.isSpinning}
              onClick={handleRepopulate}
            />
          </span>
        </Tooltip>
      )}

      <RepopulateDialog
        repopulateFetchingEnded={repopulateFetchEnded}
        onCloseDialog={() => onSpinnerChange({ isSpinning: false, status: null, message: '' })}
        onSpinnerChange={onSpinnerChange}
      />
    </>
  );
}

export default RepopulateAction;
