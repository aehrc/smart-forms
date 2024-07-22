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
import { HEADERS } from '../../../../api/headers.ts';
import {
  extractedResourceIsBundle,
  responseIsOperationOutcome
} from '../../../../utils/extract.ts';

export interface RendererSaveAsFinalWriteBackDialogProps {
  open: boolean;
  closeDialog: () => unknown;
}

function RendererSaveAsFinalWriteBackDialog(props: RendererSaveAsFinalWriteBackDialogProps) {
  const { open, closeDialog } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const [isSavingOnly, setIsSavingOnly] = useState(false);
  const [isSavingWriteBack, setIsSavingWriteBack] = useState(false);

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
      setIsSavingOnly(false);
      setIsSavingWriteBack(false);
      handleClose();
    }, 1000);
  }

  async function handleSaveAsFinalOnly() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSavingOnly(true);

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
        action: <CloseSnackbar />
      });
      handleClose();
      return;
    }

    setUpdatableResponseAsSaved(savedResponse);
    enqueueSnackbar(saveAsFinalSuccessMessage, { variant: 'success', action: <CloseSnackbar /> });
    handleCloseWithNavigation();
  }

  async function handleSaveAsFinalWriteBack() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSavingWriteBack(true);

    // Perform save
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
        action: <CloseSnackbar />
      });
      handleClose();
      return;
    }

    setUpdatableResponseAsSaved(savedResponse);

    // Perform $extract
    const extractedResource = await smartClient.request({
      url: 'QuestionnaireResponse/$extract',
      method: 'POST',
      body: JSON.stringify(savedResponse),
      headers: { ...HEADERS, 'Content-Type': 'application/json' }
    });

    if (!extractedResource) {
      enqueueSnackbar('Response saved but failed to extract resource. Write back failed.', {
        variant: 'warning',
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
      handleCloseWithNavigation();
      return;
    }

    if (!extractedResourceIsBundle(extractedResource)) {
      enqueueSnackbar(
        'Response saved but extracted resource is not a transaction bundle. Write back failed.',
        {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar />
        }
      );

      handleCloseWithNavigation();
      return;
    }

    const writeBackResponse = await smartClient.request({
      url: '',
      method: 'POST',
      body: JSON.stringify(extractedResource),
      headers: { ...HEADERS, 'Content-Type': 'application/json' }
    });

    if (responseIsOperationOutcome(writeBackResponse)) {
      enqueueSnackbar(
        'Response saved but failed to write back resource. View console for details.',
        {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar />
        }
      );
      handleCloseWithNavigation();
      return;
    }

    // Happy path
    enqueueSnackbar('Response saved and write back successful', {
      variant: 'success',
      preventDuplicate: true,
      action: <CloseSnackbar />
    });
    handleCloseWithNavigation();
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
        <Button onClick={handleClose} disabled={isSavingOnly || isSavingWriteBack}>
          Cancel
        </Button>
        <LoadingButton
          data-test="save-as-final-button"
          loading={isSavingOnly}
          disabled={isSavingWriteBack}
          onClick={handleSaveAsFinalOnly}>
          Save as Final Only
        </LoadingButton>
        <LoadingButton
          data-test="save-as-final-write-back-button"
          loading={isSavingWriteBack}
          disabled={isSavingOnly}
          onClick={handleSaveAsFinalWriteBack}>
          Save as Final & Write Back
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default RendererSaveAsFinalWriteBackDialog;
