import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
interface Props {
  isDisplayed: boolean;
}
function QRSavedSnackbar(props: Props) {
  const { isDisplayed } = props;
  const [open, setOpen] = React.useState(isDisplayed);

  useEffect(() => {
    if (isDisplayed) {
      setOpen(isDisplayed);
    }
  }, [isDisplayed]);

  // do not display snackbar at first render
  useEffect(() => {
    setOpen(false);
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={4500} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        Response saved!
      </Alert>
    </Snackbar>
  );
}

export default QRSavedSnackbar;
