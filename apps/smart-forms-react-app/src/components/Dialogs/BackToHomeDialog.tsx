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

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import { RendererContext } from '../Renderer/RendererLayout';
import { useNavigate } from 'react-router-dom';

export interface Props {
  open: boolean;
  closeDialog: () => unknown;
}

// TODO implement this with home button
// also bind to back button

function BackToHomeDialog(props: Props) {
  const { open, closeDialog } = props;
  const { fhirClient, patient, user } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const { response } = renderer;
  const isLaunched = !!(fhirClient && patient && user);

  // Event handlers
  function handleClose() {
    closeDialog();
  }

  function handleSave() {
    if (!(fhirClient && patient && user)) {
      handleClose();
      return;
    }

    setIsSaving(true);

    let responseToSave = JSON.parse(JSON.stringify(response));
    responseToSave = removeHiddenAnswers(
      questionnaireProvider.questionnaire,
      responseToSave,
      enableWhenContext
    );

    setIsSaving(true);
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
        handleClose();
        navigate('/responses');
      })
      .catch((error) => {
        console.error(error);
        handleClose();
      });
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h5">Changes unsaved</DialogTitle>
      <DialogContent>
        <DialogContentText variant="body1">
          {'The form has unsaved changes. Are you sure you want to exit?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            handleClose();
          }}>
          {isLaunched ? 'Proceed without saving' : 'Proceed'}
        </Button>
        {isLaunched ? (
          <Button
            disabled={isSaving}
            endIcon={isSaving ? <CircularProgress size={20} /> : null}
            onClick={handleSave}>
            Save as draft and proceed
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default BackToHomeDialog;
