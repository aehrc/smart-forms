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
