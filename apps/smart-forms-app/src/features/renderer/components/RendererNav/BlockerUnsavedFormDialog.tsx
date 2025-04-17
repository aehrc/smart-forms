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
import type { unstable_Blocker as Blocker } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { saveQuestionnaireResponse } from '../../../../api/saveQr.ts';
import { LoadingButton } from '@mui/lab';
import {
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';

export interface Props {
  blocker: Blocker;
  open: boolean;
  closeDialog: () => unknown;
}

function BlockerUnsavedFormDialog(props: Props) {
  const { blocker, open, closeDialog } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const [isSaving, setIsSaving] = useState(false);

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();
  const navigate = useNavigate();

  const isLaunched = !!(smartClient && patient && user);
  const launchQuestionnaireExists = !!launchQuestionnaire;

  // Event handlers
  function handleCancel() {
    blocker.reset?.();
    closeDialog();
  }

  function handleProceed() {
    blocker.proceed?.();
    closeDialog();
  }

  function handleSave() {
    if (!(smartClient && patient && user)) {
      closeDialog();
      blocker.proceed?.();
      return;
    }

    setIsSaving(true);

    let responseToSave = structuredClone(updatableResponse);
    responseToSave = removeEmptyAnswersFromResponse(sourceQuestionnaire, responseToSave);

    setIsSaving(true);
    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        setUpdatableResponseAsSaved(savedResponse);
        setIsSaving(false);
        closeDialog();
        blocker.proceed?.();
        navigate(launchQuestionnaireExists ? '/dashboard/existing' : '/dashboard/responses');
      })
      .catch((error) => {
        console.error(error);
        setIsSaving(false);
        blocker.reset?.();
        closeDialog();
      });
  }

  return (
    <Dialog open={open} onClose={closeDialog}>
      <DialogTitle variant="h5">Unsaved changes</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {'The form has unsaved changes. Are you sure you want to exit?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleProceed}>Proceed anyway</Button>
        {isLaunched ? (
          <LoadingButton loading={isSaving} onClick={handleSave}>
            Save and proceed
          </LoadingButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default BlockerUnsavedFormDialog;
