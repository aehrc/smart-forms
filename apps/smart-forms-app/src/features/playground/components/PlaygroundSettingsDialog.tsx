/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import PlaygroundPatientPicker from './PlaygroundPatientPicker.tsx';
import type { Patient, Practitioner } from 'fhir/r4';
import { useState } from 'react';
import PlaygroundUserPicker from './PlaygroundUserPicker.tsx';
import PlaygroundFhirServerUrlInput from './PlaygroundSourceFhirServerInput.tsx';

export interface Props {
  open: boolean;
  closeDialog: () => unknown;
  fhirServerUrl: string;
  patient: Patient | null;
  user: Practitioner | null;
  onFhirServerUrlChange: (url: string) => unknown;
  onPatientChange: (patient: Patient | null) => unknown;
  onUserChange: (practitioner: Practitioner | null) => unknown;
}

function PlaygroundSettingsDialog(props: Props) {
  const {
    open,
    closeDialog,
    fhirServerUrl,
    patient,
    user,
    onFhirServerUrlChange,
    onPatientChange,
    onUserChange
  } = props;

  const [fhirServerUrlInput, setFhirServerUrlInput] = useState(fhirServerUrl);
  const [fhirServerUrlInputValid, setFhirServerUrlInputValid] = useState<boolean | 'unchecked'>(
    true
  );

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient);
  const [selectedUser, setSelectedUser] = useState<Practitioner | null>(user);

  // Event handlers
  function handleCancel() {
    closeDialog();
    setFhirServerUrlInput(fhirServerUrl);
    setSelectedPatient(patient);
    setSelectedUser(user);
  }

  function handleSave() {
    // Set FHIR Server URL to the input value if it is valid, otherwise use the current value
    onFhirServerUrlChange(fhirServerUrlInputValid === true ? fhirServerUrlInput : fhirServerUrl);

    onPatientChange(selectedPatient);
    onUserChange(selectedUser);

    closeDialog();
  }

  function handleSetFhirServerUrl() {
    onFhirServerUrlChange(fhirServerUrlInput);
    setSelectedPatient(null);
    setSelectedUser(null);
  }

  function handleValidateFhirServerUrl(isValid: boolean | 'unchecked') {
    setFhirServerUrlInputValid(isValid);
  }

  // SourceFhirServerEndpoint, Patient or Practitioner has changed
  const changesMade =
    fhirServerUrlInput !== fhirServerUrl ||
    selectedPatient?.id !== patient?.id ||
    selectedUser?.id !== user?.id;

  const setFhirServerButtonIsEnabled =
    fhirServerUrlInput !== fhirServerUrl && fhirServerUrlInputValid === true;

  return (
    <Dialog open={open}>
      <DialogTitle variant="h5">Launch Context Settings</DialogTitle>
      <DialogContent>
        <PlaygroundFhirServerUrlInput
          fhirServerUrlInput={fhirServerUrlInput}
          fhirServerUrlInputValid={fhirServerUrlInputValid}
          onFhirServerUrlInputChange={(changedInput) => setFhirServerUrlInput(changedInput)}
          onValidateFhirServerUrlInput={handleValidateFhirServerUrl}
        />
        <Box display="flex" justifyContent="right" mt={0.5}>
          <Button disabled={!setFhirServerButtonIsEnabled} onClick={handleSetFhirServerUrl}>
            Save URL as FHIR Server
          </Button>
        </Box>

        <Box my={3} />
        <PlaygroundPatientPicker
          fhirServerUrl={fhirServerUrl}
          selectedPatient={selectedPatient}
          onSelectPatient={(patient) => setSelectedPatient(patient)}
        />
        <Box my={4} />
        <PlaygroundUserPicker
          fhirServerUrl={fhirServerUrl}
          selectedUser={selectedUser}
          onSelectUser={(practitioner) => setSelectedUser(practitioner)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button disabled={!changesMade} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlaygroundSettingsDialog;
