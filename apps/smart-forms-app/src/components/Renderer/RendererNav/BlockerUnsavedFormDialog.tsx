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
import { SmartAppLaunchContext } from '../../../custom-contexts/SmartAppLaunchContext.tsx';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { RendererContext } from '../RendererLayout';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
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
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import cloneDeep from 'lodash.clonedeep';

export interface Props {
  blocker: Blocker;
  open: boolean;
  closeDialog: () => unknown;
}

function BlockerUnsavedFormDialog(props: Props) {
  const { blocker, open, closeDialog } = props;

  const { fhirClient, patient, user } = useContext(SmartAppLaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const { response } = renderer;
  const isLaunched = !!(fhirClient && patient && user);

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
    if (!(fhirClient && patient && user)) {
      closeDialog();
      blocker.proceed?.();
      return;
    }

    setIsSaving(true);
    setIsSaving(true);

    let responseToSave = cloneDeep(response);
    responseToSave = removeHiddenAnswers(
      questionnaireProvider.questionnaire,
      responseToSave,
      enableWhenContext
    );

    setIsSaving(true);
    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(
      fhirClient,
      patient,
      user,
      questionnaireProvider.questionnaire,
      responseToSave
    )
      .then((savedResponse) => {
        responseProvider.setQuestionnaireResponse(savedResponse);
        setRenderer({ response: savedResponse, hasChanges: false });
        setIsSaving(false);
        closeDialog();
        blocker.proceed?.();
        navigate('/dashboard/responses');
      })
      .catch((error) => {
        console.error(error);
        console.error('An error occurred while saving. Changes not saved.');
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
