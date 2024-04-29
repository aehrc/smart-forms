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

import type { SpeedDialActionProps } from '@mui/material';
import { CircularProgress, IconButton, SpeedDialAction, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { saveErrorMessage, saveSuccessMessage } from '../../../../utils/snackbar.ts';
import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';
import { saveProgress } from '../../../../api/saveQr.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import { useState } from 'react';

interface SaveProgressSpeedDialActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
  onClose?: () => void;
  refetchResponses?: () => void;
}

function SaveProgressAction(props: SaveProgressSpeedDialActionProps) {
  const { isSpeedDial, onClose, refetchResponses, ...speedDialActionProps } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const [isSaving, setIsSaving] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  function ViewResponsesSnackbarAction() {
    return (
      <Tooltip title="View Responses">
        <IconButton
          color="inherit"
          onClick={() => {
            navigate(launchQuestionnaire ? '/dashboard/existing' : '/dashboard/responses');
            closeSnackbar();
          }}>
          <ReadMoreIcon />
        </IconButton>
      </Tooltip>
    );
  }

  async function handleSaveProgress() {
    if (onClose) {
      onClose();
    }

    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSaving(true);
    const savedResponse = await saveProgress(
      smartClient,
      patient,
      user,
      sourceQuestionnaire,
      updatableResponse,
      'in-progress'
    );
    setIsSaving(false);

    // If the response is null or undefined, then the save has failed
    if (savedResponse === null || savedResponse === undefined) {
      enqueueSnackbar(saveErrorMessage, {
        variant: 'error',
        action: <CloseSnackbar />
      });
      return;
    }

    // Use saved validated response as the new updatable response
    if (savedResponse && savedResponse.resourceType === 'QuestionnaireResponse') {
      setUpdatableResponseAsSaved(savedResponse);
    } else {
      setUpdatableResponseAsSaved(updatableResponse);
    }

    // Refetch existing responses if prop is provided
    if (refetchResponses) {
      refetchResponses();
    }

    enqueueSnackbar(saveSuccessMessage, {
      variant: 'success',
      action: ViewResponsesSnackbarAction
    });
  }

  // Unable to configure disabled state for SpeedDialAction
  if (isSpeedDial) {
    return (
      <SpeedDialAction
        icon={<SaveIcon />}
        tooltipTitle="Save Progress"
        tooltipOpen
        onClick={handleSaveProgress}
        {...speedDialActionProps}
      />
    );
  }

  const buttonIsDisabled = !smartClient || formChangesHistory.length === 0 || isSaving;

  return (
    <RendererOperationItem
      title="Save Progress"
      icon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
      disabled={buttonIsDisabled}
      onClick={handleSaveProgress}
    />
  );
}

export default SaveProgressAction;
