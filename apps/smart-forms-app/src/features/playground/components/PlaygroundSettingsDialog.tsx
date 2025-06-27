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

import { Box, Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import PlaygroundPatientPicker from './PlaygroundPatientPicker.tsx';
import type { Patient, Practitioner } from 'fhir/r4';
import { useState } from 'react';
import PlaygroundUserPicker from './PlaygroundUserPicker.tsx';
import PlaygroundFhirServerUrlInput from './PlaygroundFhirServerInput.tsx';
import StandardDialogTitle from '../../../components/Dialog/StandardDialogTitle.tsx';

export interface PlaygroundSettingsDialogProps {
  open: boolean;
  closeDialog: () => unknown;
  sourceFhirServerUrl: string;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  onSourceFhirServerUrlChange: (url: string) => unknown;
  onPatientChange: (patient: Patient | null) => unknown;
  onUserChange: (practitioner: Practitioner | null) => unknown;
  onTerminologyServerUrlChange: (url: string) => unknown;
}

function PlaygroundSettingsDialog(props: PlaygroundSettingsDialogProps) {
  const {
    open,
    closeDialog,
    sourceFhirServerUrl,
    patient,
    user,
    terminologyServerUrl,
    onSourceFhirServerUrlChange,
    onPatientChange,
    onUserChange,
    onTerminologyServerUrlChange
  } = props;

  const [sourceFhirServerUrlInput, setSourceFhirServerUrlInput] = useState(sourceFhirServerUrl);
  const [sourceFhirServerUrlInputValid, setSourceFhirServerUrlInputValid] = useState<
    boolean | 'unchecked'
  >(true);

  const [terminologyServerUrlInput, setTerminologyServerUrlInput] = useState(terminologyServerUrl);
  const [terminologyServerUrlInputValid, setTerminologyServerUrlInputValid] = useState<
    boolean | 'unchecked'
  >(true);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient);
  const [selectedUser, setSelectedUser] = useState<Practitioner | null>(user);

  // Event handlers
  function handleCancel() {
    closeDialog();
    setSourceFhirServerUrlInput(sourceFhirServerUrl);
    setTerminologyServerUrlInput(terminologyServerUrl);
    setSelectedPatient(patient);
    setSelectedUser(user);
  }

  function handleSave() {
    // Set Source FHIR Server URL to the input value if it is valid, otherwise use the current value
    onSourceFhirServerUrlChange(
      sourceFhirServerUrlInputValid === true ? sourceFhirServerUrlInput : sourceFhirServerUrl
    );
    onPatientChange(selectedPatient);
    onUserChange(selectedUser);

    // Set Terminology Server URL to the input value if it is valid, otherwise use the current value
    onTerminologyServerUrlChange(
      terminologyServerUrlInputValid === true ? terminologyServerUrlInput : terminologyServerUrl
    );

    closeDialog();
  }

  function handleSetSourceFhirServerUrl() {
    onSourceFhirServerUrlChange(sourceFhirServerUrlInput);
    setSelectedPatient(null);
    setSelectedUser(null);
  }

  function handleValidateSourceFhirServerUrl(isValid: boolean | 'unchecked') {
    setSourceFhirServerUrlInputValid(isValid);
  }

  // SourceFhirServerEndpoint, Patient or Practitioner has changed
  const changesMade =
    sourceFhirServerUrlInput !== sourceFhirServerUrl ||
    terminologyServerUrlInput !== terminologyServerUrl ||
    selectedPatient?.id !== patient?.id ||
    selectedUser?.id !== user?.id;

  const sourceFhirServerButtonIsEnabled =
    sourceFhirServerUrlInput !== sourceFhirServerUrl && sourceFhirServerUrlInputValid === true;

  const terminologyServerButtonIsEnabled =
    terminologyServerUrlInput !== terminologyServerUrl && terminologyServerUrlInputValid === true;

  return (
    <Dialog open={open} maxWidth="md" fullWidth slotProps={{ paper: { sx: { minWidth: 500 } } }}>
      <StandardDialogTitle onCloseDialog={handleCancel}>
        Launch Context Settings
      </StandardDialogTitle>
      <DialogContent>
        {/* Source FHIR Server url config */}
        <PlaygroundFhirServerUrlInput
          fhirServerId="source"
          fhirServerUrlInput={sourceFhirServerUrlInput}
          fhirServerUrlInputValid={sourceFhirServerUrlInputValid}
          onFhirServerUrlInputChange={(changedInput) => setSourceFhirServerUrlInput(changedInput)}
          onValidateFhirServerUrlInput={handleValidateSourceFhirServerUrl}
        />

        <Box display="flex" justifyContent="right" mt={0.5}>
          <Button
            disabled={!sourceFhirServerButtonIsEnabled}
            data-test="set-fhir-server-button-playground"
            onClick={handleSetSourceFhirServerUrl}>
            Save URL as Source FHIR Server
          </Button>
        </Box>

        <Box my={3} />

        {/* Terminology Server url config */}
        <PlaygroundFhirServerUrlInput
          fhirServerId="terminology"
          fhirServerUrlInput={terminologyServerUrlInput}
          fhirServerUrlInputValid={terminologyServerUrlInputValid}
          onFhirServerUrlInputChange={(changedInput) => setTerminologyServerUrlInput(changedInput)}
          onValidateFhirServerUrlInput={(isValid) => setTerminologyServerUrlInputValid(isValid)}
        />
        <Box display="flex" justifyContent="right" mt={0.5}>
          <Button
            disabled={!terminologyServerButtonIsEnabled}
            data-test="set-terminology-server-button-playground"
            onClick={() => {
              onTerminologyServerUrlChange(terminologyServerUrlInput);
            }}>
            Save URL as Terminology Server
          </Button>
        </Box>

        <Box my={3} />

        <PlaygroundPatientPicker
          sourceFhirServerUrl={sourceFhirServerUrl}
          selectedPatient={selectedPatient}
          onSelectPatient={(patient) => setSelectedPatient(patient)}
        />
        <Box my={4} />
        <PlaygroundUserPicker
          sourceFhirServerUrl={sourceFhirServerUrl}
          selectedUser={selectedUser}
          onSelectUser={(practitioner) => setSelectedUser(practitioner)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          disabled={!changesMade}
          data-test="save-launch-settings-button-playground"
          onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlaygroundSettingsDialog;
