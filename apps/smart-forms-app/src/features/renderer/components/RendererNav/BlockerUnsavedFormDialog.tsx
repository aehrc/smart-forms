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
import type { unstable_Blocker as Blocker } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../save/api/saveQr.ts';
import cloneDeep from 'lodash.clonedeep';
import useConfigStore from '../../../../stores/useConfigStore.ts';
import useQuestionnaireStore from '../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../stores/useQuestionnaireResponseStore.ts';

export interface Props {
  blocker: Blocker;
  open: boolean;
  closeDialog: () => unknown;
}

function BlockerUnsavedFormDialog(props: Props) {
  const { blocker, open, closeDialog } = props;

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

  const isLaunched = !!(smartClient && patient && user);

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

    let responseToSave = cloneDeep(updatableResponse);
    responseToSave = removeHiddenAnswers({
      questionnaire: sourceQuestionnaire,
      questionnaireResponse: responseToSave,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });

    setIsSaving(true);
    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        saveResponse(savedResponse);
        setIsSaving(false);
        closeDialog();
        blocker.proceed?.();
        navigate('/dashboard/responses');
      })
      .catch((error) => {
        console.error(error);
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
          <Button
            disabled={isSaving}
            endIcon={isSaving ? <CircularProgress size={20} /> : null}
            onClick={handleSave}>
            Save and proceed
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default BlockerUnsavedFormDialog;
