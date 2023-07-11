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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import cloneDeep from 'lodash.clonedeep';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../../save/api/saveQr.ts';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import useConfigStore from '../../../../../stores/useConfigStore.ts';
import useQuestionnaireStore from '../../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../../stores/useQuestionnaireResponseStore.ts';
import { LoadingButton } from '@mui/lab';

export interface RendererSaveAsFinalDialogProps {
  open: boolean;
  closeDialog: () => unknown;
}

function RendererSaveAsFinalDialog(props: RendererSaveAsFinalDialogProps) {
  const { open, closeDialog } = props;

  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);
  const user = useConfigStore((state) => state.user);

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const saveResponse = useQuestionnaireResponseStore((state) => state.saveResponse);

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Event Handlers
  function handleClose() {
    closeDialog();
  }

  function handleSave() {
    if (!(smartClient && patient && user)) return;

    setIsSaving(true);
    let responseToSave = cloneDeep(updatableResponse);
    responseToSave = removeHiddenAnswers({
      questionnaire: sourceQuestionnaire,
      questionnaireResponse: responseToSave,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });

    responseToSave.status = 'completed';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        saveResponse(savedResponse);
        enqueueSnackbar('Response saved as final', { variant: 'success' });

        // Wait until renderer.hasChanges is set to false before navigating away
        setTimeout(() => {
          navigate('/dashboard/responses');
          setIsSaving(false);
          handleClose();
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar('An error occurred while saving. Try again later.', { variant: 'error' });
        handleClose();
      });
  }

  return (
    <Dialog open={open} onClose={handleClose} data-test="dialog-confirm-save">
      <DialogTitle variant="h5">Confirm save</DialogTitle>
      <DialogContent>
        <DialogContentText variant="body1">
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

export default RendererSaveAsFinalDialog;
