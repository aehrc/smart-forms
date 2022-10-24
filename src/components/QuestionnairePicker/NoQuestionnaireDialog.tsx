import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React from 'react';
import { FirstLaunch } from '../../interfaces/Interfaces';

export interface Props {
  firstLaunch: FirstLaunch;
}

function NoQuestionnaireDialog(props: Props) {
  const { firstLaunch } = props;

  const [open, setOpen] = React.useState(firstLaunch.status);

  function handleClose() {
    setOpen(false);
    firstLaunch.invalidate();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Questionnaire not found</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            "Uh oh, we can't seem to locate a questionnaire. Select a questionnaire from the list to proceed to the form."
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Ok, got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NoQuestionnaireDialog;
