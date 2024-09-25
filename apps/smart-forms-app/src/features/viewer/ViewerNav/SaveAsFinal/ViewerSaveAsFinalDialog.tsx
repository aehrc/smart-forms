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
import { saveQuestionnaireResponse } from '../../../../api/saveQr.ts';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { saveAsFinalSuccessMessage, saveErrorMessage } from '../../../../utils/snackbar.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';

export interface ViewerSaveAsFinalDialogProps {
  open: boolean;
  closeDialog: () => unknown;
}

function ViewerSaveAsFinalDialog(props: ViewerSaveAsFinalDialogProps) {
  const { open, closeDialog } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const launchQuestionnaireExists = !!launchQuestionnaire;

  // Event Handlers
  function handleClose() {
    closeDialog();
  }

  function handleSave() {
    closeSnackbar();
    if (!(smartClient && patient && user)) return;

    setIsSaving(true);

    const responseToSave = structuredClone(updatableResponse);
    responseToSave.status = 'completed';

    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        setIsSaving(false);
        setUpdatableResponseAsSaved(savedResponse);
        handleClose();
        enqueueSnackbar(saveAsFinalSuccessMessage, {
          variant: 'success',
          action: <CloseSnackbar />
        });
        navigate(launchQuestionnaireExists ? '/dashboard/existing' : '/dashboard/responses');
      })
      .catch((error) => {
        console.error(error);
        setIsSaving(false);
        enqueueSnackbar(saveErrorMessage, { variant: 'error', action: <CloseSnackbar /> });
        handleClose();
      });
  }

  return (
    <Dialog open={open} onClose={handleClose} data-test="dialog-confirm-save">
      <DialogTitle variant="h5">Confirm save</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Are you sure you want to save this form as final? You won't be able to edit it after."}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton loading={isSaving} onClick={handleSave}>
          Save as final
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default ViewerSaveAsFinalDialog;
