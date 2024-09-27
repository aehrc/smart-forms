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

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import {
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import { saveQuestionnaireResponse } from '../../../api/saveQr.ts';
import { useSnackbar } from 'notistack';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import { saveErrorMessage, saveSuccessMessage } from '../../../utils/snackbar.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';

interface AutoSaveDialogProps {
  onAutoSave: () => void;
}

function AutoSaveDialog(props: AutoSaveDialogProps) {
  const { onAutoSave } = props;

  const { smartClient, patient, user } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    handleAutoSave();
  }, []);

  function handleAutoSave() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    const responseToSave = removeEmptyAnswersFromResponse(
      sourceQuestionnaire,
      structuredClone(updatableResponse)
    );

    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        setUpdatableResponseAsSaved(savedResponse);
        enqueueSnackbar(saveSuccessMessage, {
          variant: 'success',
          action: <CloseSnackbar />
        });
        onAutoSave();
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar(saveErrorMessage, { variant: 'error', action: <CloseSnackbar /> });
        onAutoSave();
      });
  }

  return (
    <Dialog open={true} maxWidth="xl">
      <DialogTitle variant="h5">Autosaving...</DialogTitle>
      <DialogContent sx={{ mb: 2 }}>
        <DialogContentText>
          Due to inactivity, your form is currently being autosaved as a draft.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export default AutoSaveDialog;
