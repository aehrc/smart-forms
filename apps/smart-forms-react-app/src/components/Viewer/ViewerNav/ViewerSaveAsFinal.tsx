import TaskAltIcon from '@mui/icons-material/TaskAlt';
import React, { useContext, useState } from 'react';
import { saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OperationItem } from './ViewerOperationSection';
import { useSnackbar } from 'notistack';

function ViewerSaveAsFinal() {
  const { fhirClient } = useContext(LaunchContext);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <OperationItem
        title="Save as Final"
        icon={<TaskAltIcon />}
        onClick={() => {
          if (!fhirClient) return;
          setDialogOpen(true);
        }}
      />
      <ConfirmSaveAsFinalDialog open={dialogOpen} closeDialog={() => setDialogOpen(false)} />
    </>
  );
}

export interface Props {
  open: boolean;
  closeDialog: () => unknown;
}

function ConfirmSaveAsFinalDialog(props: Props) {
  const { open, closeDialog } = props;
  const { fhirClient, patient, user } = useContext(LaunchContext);
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
    const responseToSave = JSON.parse(JSON.stringify(responseProvider.response));

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
        navigate('/responses');
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

export default ViewerSaveAsFinal;
