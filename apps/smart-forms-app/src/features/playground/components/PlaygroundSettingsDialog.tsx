/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import type { Encounter, Patient, Practitioner, PractitionerRole } from 'fhir/r4';
import { useState } from 'react';
import PlaygroundUserPicker from './PlaygroundUserPicker.tsx';
import PlaygroundFhirServerUrlInput from './PlaygroundFhirServerInput.tsx';
import StandardDialogTitle from '../../../components/Dialog/StandardDialogTitle.tsx';
import PlaygroundEncounterPicker from './PlaygroundEncounterPicker.tsx';
import PlaygroundPractitionerRolePicker from './PlaygroundPractitionerRolePicker.tsx';

export interface PlaygroundSettingsDialogProps {
  open: boolean;
  closeDialog: () => unknown;
  sourceFhirServerUrl: string;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  practitionerRole: PractitionerRole | null;
  terminologyServerUrl: string;
  onSourceFhirServerUrlChange: (url: string) => unknown;
  onPatientChange: (patient: Patient | null) => unknown;
  onUserChange: (practitioner: Practitioner | null) => unknown;
  onEncounterChange: (encounter: Encounter | null) => unknown;
  onPractitionerRoleChange: (practitionerRole: PractitionerRole | null) => unknown;
  onTerminologyServerUrlChange: (url: string) => unknown;
}

function PlaygroundSettingsDialog(props: PlaygroundSettingsDialogProps) {
  const {
    open,
    closeDialog,
    sourceFhirServerUrl,
    patient,
    user,
    encounter,
    practitionerRole,
    terminologyServerUrl,
    onSourceFhirServerUrlChange,
    onPatientChange,
    onUserChange,
    onEncounterChange,
    onPractitionerRoleChange,
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
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(encounter);
  const [selectedPractitionerRole, setSelectedPractitionerRole] = useState<PractitionerRole | null>(
    practitionerRole
  );

  // Event handlers
  function handleCancel() {
    closeDialog();
    setSourceFhirServerUrlInput(sourceFhirServerUrl);
    setTerminologyServerUrlInput(terminologyServerUrl);
    setSelectedPatient(patient);
    setSelectedUser(user);
    setSelectedEncounter(encounter);
    setSelectedPractitionerRole(practitionerRole);
  }

  function handleSave() {
    // Set Source FHIR Server URL to the input value if it is valid, otherwise use the current value
    onSourceFhirServerUrlChange(
      sourceFhirServerUrlInputValid === true ? sourceFhirServerUrlInput : sourceFhirServerUrl
    );
    onPatientChange(selectedPatient);
    onUserChange(selectedUser);
    onEncounterChange(selectedEncounter);
    onPractitionerRoleChange(selectedPractitionerRole);

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
    setSelectedEncounter(null);
    setSelectedPractitionerRole(null);
  }

  function handleValidateSourceFhirServerUrl(isValid: boolean | 'unchecked') {
    setSourceFhirServerUrlInputValid(isValid);
  }

  function handleSelectPatient(newPatient: Patient | null) {
    setSelectedPatient(newPatient);
    // Reset encounter when patient changes since it is scoped to the patient
    if (newPatient?.id !== selectedPatient?.id) {
      setSelectedEncounter(null);
    }
  }

  function handleSelectUser(newUser: Practitioner | null) {
    setSelectedUser(newUser);
    // Reset practitionerRole when user changes since it is scoped to the user
    if (newUser?.id !== selectedUser?.id) {
      setSelectedPractitionerRole(null);
    }
  }

  // SourceFhirServerEndpoint, Patient, User, Encounter or PractitionerRole has changed
  const changesMade =
    sourceFhirServerUrlInput !== sourceFhirServerUrl ||
    terminologyServerUrlInput !== terminologyServerUrl ||
    selectedPatient?.id !== patient?.id ||
    selectedUser?.id !== user?.id ||
    selectedEncounter?.id !== encounter?.id ||
    selectedPractitionerRole?.id !== practitionerRole?.id;

  const sourceFhirServerButtonIsEnabled =
    sourceFhirServerUrlInput !== sourceFhirServerUrl && sourceFhirServerUrlInputValid === true;

  const terminologyServerButtonIsEnabled =
    terminologyServerUrlInput !== terminologyServerUrl && terminologyServerUrlInputValid === true;

  return (
    <Dialog open={open} maxWidth="md" fullWidth slotProps={{ paper: { sx: { minWidth: 500 } } }}>
      <StandardDialogTitle onCloseDialog={handleCancel}>
        Launch Context Settings
      </StandardDialogTitle>
      <DialogContent dividers>
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
          onSelectPatient={handleSelectPatient}
        />
        <Box my={4} />
        <PlaygroundEncounterPicker
          sourceFhirServerUrl={sourceFhirServerUrl}
          selectedPatient={selectedPatient}
          selectedEncounter={selectedEncounter}
          onSelectEncounter={(enc) => setSelectedEncounter(enc)}
        />
        <Box my={4} />
        <PlaygroundUserPicker
          sourceFhirServerUrl={sourceFhirServerUrl}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
        />
        <Box my={4} />
        <PlaygroundPractitionerRolePicker
          sourceFhirServerUrl={sourceFhirServerUrl}
          selectedUser={selectedUser}
          selectedPractitionerRole={selectedPractitionerRole}
          onSelectPractitionerRole={(pr) => setSelectedPractitionerRole(pr)}
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
