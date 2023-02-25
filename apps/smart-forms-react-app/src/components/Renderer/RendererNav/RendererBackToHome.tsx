import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { NavItem } from './RendererNavSection';

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
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { RendererContext } from '../RendererLayout';

function RendererBackToHome() {
  const { renderer } = useContext(RendererContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { hasChanges } = renderer;

  return (
    <>
      <NavItem
        title="Back to Home"
        icon={<HomeIcon />}
        onClick={() => {
          if (hasChanges) {
            setDialogOpen(true);
          } else {
            navigate('/questionnaires');
          }
        }}
      />
      {hasChanges ? (
        <BackToHomeDialog open={dialogOpen} closeDialog={() => setDialogOpen(false)} />
      ) : null}
    </>
  );
}

export interface Props {
  open: boolean;
  closeDialog: () => unknown;
}

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
            navigate('/questionnaires');
            handleClose();
          }}>
          {isLaunched ? 'Proceed anyway' : 'Proceed'}
        </Button>
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

export default RendererBackToHome;
