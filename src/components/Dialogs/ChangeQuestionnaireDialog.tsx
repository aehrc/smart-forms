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
import Client from 'fhirclient/lib/Client';

export interface Props {
  dialogOpen: boolean;
  closeDialog: () => unknown;
  removeQrHasChanges: () => unknown;
  fhirClient: Client | null;
  questionnaireResponse: QuestionnaireResponse;
}

function ChangeQuestionnaireDialog(props: Props) {
  const { dialogOpen, closeDialog, removeQrHasChanges, fhirClient, questionnaireResponse } = props;
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = React.useContext(PageSwitcherContext);

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
        <Button onClick={handleClose}>Go back</Button>
        <Button
          disabled={isSaving}
          endIcon={isSaving ? <CircularProgress size={20} /> : null}
          onClick={() => {
            if (fhirClient) {
              setIsSaving(true);
              questionnaireResponseProvider.setQuestionnaireResponse(questionnaireResponse);
              saveQuestionnaireResponse(fhirClient, questionnaireResponse)
                .then(() => {
                  removeQrHasChanges();
                  pageSwitcher.goToPage(PageType.Picker);
                  handleClose();
                  setIsSaving(false);
                })
                .catch((error) => {
                  if (error.message.includes('400 Bad Request')) {
                    saveQuestionnaireResponse(fhirClient, questionnaireResponse)
                      .then(() => removeQrHasChanges())
                      .catch((error) => {
                        console.log(error);
                        pageSwitcher.goToPage(PageType.Picker);
                        handleClose();
                        setIsSaving(false);
                      });
                  }
                });
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
