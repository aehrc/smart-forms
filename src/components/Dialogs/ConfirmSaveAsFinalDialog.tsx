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
import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';

export interface Props {
  dialogOpen: boolean;
  closeDialog: () => unknown;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

function ConfirmSaveAsFinalDialog(props: Props) {
  const {
    dialogOpen,
    closeDialog,
    removeQrHasChanges,
    questionnaireResponse,
    fhirClient,
    patient,
    user
  } = props;
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = React.useContext(PageSwitcherContext);

  const [isSaving, setIsSaving] = useState(false);

  function handleClose() {
    closeDialog();
  }

  return (
    <Dialog open={dialogOpen} onClose={handleClose}>
      <DialogTitle>Confirm save</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Are you sure you want to save this form as final? You won't be able to edit it after."}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isSaving}
          endIcon={isSaving ? <CircularProgress size={20} /> : null}
          onClick={() => {
            setIsSaving(true);
            questionnaireResponse.status = 'completed';
            questionnaireResponseProvider.setQuestionnaireResponse(questionnaireResponse);
            saveQuestionnaireResponse(fhirClient, patient, user, questionnaireResponse)
              .then(() => {
                removeQrHasChanges();
                pageSwitcher.goToPage(PageType.Picker);
                handleClose();
                setIsSaving(false);
              })
              .catch((error) => {
                console.log(error);
                handleClose();
              });
          }}>
          Save as final
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmSaveAsFinalDialog;
