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

import { useContext, useState } from 'react';
import { SmartAppLaunchContext } from '../../../smartAppLaunch/contexts/SmartAppLaunchContext.tsx';
import {
  QuestionnaireProviderContext,
  QuestionnaireResponseProviderContext
} from '../../../../App.tsx';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import cloneDeep from 'lodash.clonedeep';
import { saveQuestionnaireResponse } from '../../../save/api/saveQr.ts';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

export interface ViewerSaveAsFinalDialogProps {
  open: boolean;
  closeDialog: () => unknown;
}

function ViewerSaveAsFinalDialog(props: ViewerSaveAsFinalDialogProps) {
  const { open, closeDialog } = props;

  const { fhirClient, patient, user } = useContext(SmartAppLaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Event Handlers
  function handleClose() {
    closeDialog();
  }

  function handleSave() {
    if (!(fhirClient && patient && user)) return;

    setIsSaving(true);
    const responseToSave = cloneDeep(responseProvider.response);

    responseToSave.status = 'completed';
    saveQuestionnaireResponse(
      fhirClient,
      patient,
      user,
      questionnaireProvider.questionnaire,
      responseToSave
    )
      .then((savedResponse) => {
        responseProvider.setQuestionnaireResponse(savedResponse);
        setIsSaving(false);
        handleClose();
        enqueueSnackbar('Response saved as final', { variant: 'success' });
        navigate('/dashboard/responses');
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
        <Button
          disabled={isSaving}
          endIcon={isSaving ? <CircularProgress size={20} /> : null}
          onClick={handleSave}>
          Save as final
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewerSaveAsFinalDialog;
