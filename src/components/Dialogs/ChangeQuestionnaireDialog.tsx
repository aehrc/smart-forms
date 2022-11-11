import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React, { useState } from 'react';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { PageType } from '../../interfaces/Enums';
import { saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import { QuestionnaireResponseProviderContext } from '../../App';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';

export interface Props {
  dialogOpen: boolean;
  closeDialog: () => unknown;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function ChangeQuestionnaireDialog(props: Props) {
  const { dialogOpen, closeDialog, removeQrHasChanges, questionnaireResponse } = props;
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const launchContext = React.useContext(LaunchContext);

  const [isSaving, setIsSaving] = useState(false);

  function handleClose() {
    closeDialog();
  }

  return (
    <Dialog open={dialogOpen} onClose={handleClose}>
      <DialogTitle>Changes unsaved</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {'The form has unsaved changes. Are you sure you want to change the questionnaire?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            pageSwitcher.goToPage(PageType.Picker);
            handleClose();
          }}>
          Proceed without saving
        </Button>
        <Button
          disabled={isSaving}
          endIcon={isSaving ? <CircularProgress size={20} /> : null}
          onClick={() => {
            if (launchContext.fhirClient && launchContext.patient && launchContext.user) {
              setIsSaving(true);
              questionnaireResponseProvider.setQuestionnaireResponse(questionnaireResponse);
              saveQuestionnaireResponse(
                launchContext.fhirClient,
                launchContext.patient,
                launchContext.user,
                questionnaireResponse
              )
                .then(() => {
                  removeQrHasChanges();
                  pageSwitcher.goToPage(PageType.Picker);
                  handleClose();
                  setIsSaving(false);
                })
                .catch((error) => console.log(error));
            } else {
              handleClose();
            }
          }}>
          Save and proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeQuestionnaireDialog;
