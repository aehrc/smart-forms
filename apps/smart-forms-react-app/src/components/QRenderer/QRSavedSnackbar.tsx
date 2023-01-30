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

import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
interface Props {
  isDisplayed: boolean;
}
function QRSavedSnackbar(props: Props) {
  const { isDisplayed } = props;
  const [open, setOpen] = useState(isDisplayed);

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
