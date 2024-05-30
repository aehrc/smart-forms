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
import { Patient, Practitioner } from 'fhir/r4';
import { useState } from 'react';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { useSnackbar } from 'notistack';
import PlaygroundPractitionerPicker from './PlaygroundPractitionerPicker.tsx';

export interface Props {
  open: boolean;
  closeDialog: () => unknown;
  patient: Patient | null;
  practitioner: Practitioner | null;
  onPatientChange: (patient: Patient | null) => unknown;
  onPractitionerChange: (practitioner: Practitioner | null) => unknown;
}

function PlaygroundSettingsDialog(props: Props) {
  const { open, closeDialog, patient, practitioner, onPatientChange, onPractitionerChange } = props;

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient);
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(
    practitioner
  );

  const { enqueueSnackbar } = useSnackbar();

  const endpointUrl = 'https://proxy.smartforms.io/v/r4/fhir';
  // Event handlers
  function handleCancel() {
    closeDialog();
    setSelectedPatient(patient);
    setSelectedPractitioner(practitioner);
  }

  function handleSave() {
    onPatientChange(selectedPatient);
    onPractitionerChange(selectedPractitioner);

    enqueueSnackbar('Changes made successfully', {
      variant: 'success',
      preventDuplicate: true,
      action: <CloseSnackbar />
    });
    closeDialog();
  }

  // Patient or Practitioner has changed
  const changesMade =
    selectedPatient?.id !== patient?.id || selectedPractitioner?.id !== practitioner?.id;

  return (
    <Dialog open={open}>
      <DialogTitle variant="h5">Launch Context Settings</DialogTitle>
      <DialogContent>
        <PlaygroundPatientPicker
          endpointUrl={endpointUrl}
          selectedPatient={selectedPatient}
          onSelectPatient={(patient) => setSelectedPatient(patient)}
        />
        <Box my={2} />
        <PlaygroundPractitionerPicker
          endpointUrl={endpointUrl}
          selectedPractitioner={selectedPractitioner}
          onSelectPractitioner={(practitioner) => setSelectedPractitioner(practitioner)}
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
