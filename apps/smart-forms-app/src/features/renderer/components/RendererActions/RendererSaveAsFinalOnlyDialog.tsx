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
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { saveProgress } from '../../../../api/saveQr.ts';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { saveAsFinalSuccessMessage, saveErrorMessage } from '../../../../utils/snackbar.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import StandardDialogTitle from '../../../../components/Dialog/StandardDialogTitle.tsx';

export interface RendererSaveAsFinalDialogProps {
  open: boolean;
  customContentText?: string;
  closeDialog: () => unknown;
}

function RendererSaveAsFinalOnlyDialog(props: RendererSaveAsFinalDialogProps) {
  const {
    open,
    customContentText = "Are you sure you want to save this form as final? You won't be able to edit it after.",
    closeDialog
  } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Event Handlers
  function handleClose() {
    closeDialog();
  }

  function handleCloseWithNavigation() {
    // Wait until renderer.hasChanges is set to false before navigating away
    setTimeout(() => {
      navigate(launchQuestionnaire ? '/dashboard/existing' : '/dashboard/responses');
      setIsSaving(false);
      handleClose();
    }, 1000);
  }

  async function handleSaveAsFinal() {
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
      'completed'
    );

    if (!savedResponse) {
      enqueueSnackbar(saveErrorMessage, {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      handleClose();
      return;
    }

    setUpdatableResponseAsSaved(savedResponse);
    enqueueSnackbar(saveAsFinalSuccessMessage, {
      variant: 'success',
      action: <CloseSnackbar variant="success" />
    });

    handleCloseWithNavigation();
  }

  return (
    <Dialog open={open} onClose={handleClose} data-test="dialog-confirm-save">
      <StandardDialogTitle onCloseDialog={handleClose}>Confirm save as final</StandardDialogTitle>
      <DialogContent>
        <DialogContentText>{customContentText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button data-test="save-as-final-button" loading={isSaving} onClick={handleSaveAsFinal}>
          Save as final
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RendererSaveAsFinalOnlyDialog;
