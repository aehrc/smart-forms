import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React from 'react';

export interface Props {
  dialogOpen: boolean | null;
  closeDialog: () => unknown;
  errorMessage: string;
}

function NoQuestionnaireDialog(props: Props) {
  const { dialogOpen, closeDialog, errorMessage } = props;

  if (dialogOpen === null) return null;

  return (
    <Dialog open={dialogOpen} onClose={closeDialog}>
      <DialogTitle>CMS Authorisation failed</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <span>
            {
              "Uh oh, we can't seem to connect to the CMS. Save and response-viewing operations cannot be performed."
            }
          </span>
          <br />
          <br />
          <span>{errorMessage}</span>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Ok, got it</Button>
      </DialogActions>
    </Dialog>
  );
}

export default NoQuestionnaireDialog;
