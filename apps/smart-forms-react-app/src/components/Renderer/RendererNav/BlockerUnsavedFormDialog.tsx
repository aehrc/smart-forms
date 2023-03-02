import React, { useContext, useState } from 'react';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
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

export interface Props {
  blocker: Blocker;
  open: boolean;
  closeDialog: () => unknown;
}

function BlockerUnsavedFormDialog(props: Props) {
  const { blocker, open, closeDialog } = props;

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
        closeDialog();
        blocker.proceed?.();
        navigate('/responses');
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
