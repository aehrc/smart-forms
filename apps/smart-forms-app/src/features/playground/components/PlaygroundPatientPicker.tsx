/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 10.59 230.
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

import { Box, CircularProgress, Fade, Grid, Stack, Typography } from '@mui/material';
import type { Patient } from 'fhir/r4';
import { StyledAlert } from '../../../components/Nav/Nav.styles.ts';
import useFetchPatients from '../hooks/useFetchPatients.ts';
import MenuItem from '@mui/material/MenuItem';
import { useMemo } from 'react';
import Select from '@mui/material/Select';
import { constructName } from '../../smartAppLaunch/utils/launchContext.ts';
import Button from '@mui/material/Button';

interface PlaygroundPatientPickerProps {
  fhirServerUrl: string;
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient | null) => void;
}

function PlaygroundPatientPicker(props: PlaygroundPatientPickerProps) {
  const { fhirServerUrl, selectedPatient, onSelectPatient } = props;

  const { patients, isInitialLoading } = useFetchPatients(fhirServerUrl);

  const selectedPatientId = useMemo(
    () => patients.find((p) => p.id === selectedPatient?.id)?.id,
    [selectedPatient?.id, patients]
  );

  function handleSelectPatient(newSelectedPatientId: string) {
    const selectedPatient = patients.find((patient) => patient.id === newSelectedPatientId);
    onSelectPatient(selectedPatient ?? null);
  }

  function handleClear() {
    onSelectPatient(null);
  }

  if (isInitialLoading) {
    return (
      <Fade in={true} timeout={300}>
        <Stack
          direction="row"
          alignItems="center"
          m={2}
          gap={3}
          width="inherit"
          justifyContent="center">
          <CircularProgress size={24} sx={{ mb: 0.5 }} />
          <Typography variant="subtitle2">Loading patients...</Typography>
        </Stack>
      </Fade>
    );
  }

  if (patients.length === 0) {
    return (
      <StyledAlert color="error" m={0.4}>
        <Typography>No patients available</Typography>
      </StyledAlert>
    );
  }

  return (
    <Stack justifyContent="left" gap={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Selected Patient
      </Typography>
      <Select
        value={selectedPatientId ?? ''}
        size="small"
        fullWidth={true}
        data-test="patient-picker-playground"
        onChange={(e) => handleSelectPatient(e.target.value)}>
        {patients.map((patient) => (
          <MenuItem key={patient.id} value={`${patient.id}`}>
            {patient.name ? constructName(patient.name) : `Patient ${patient.id}`}
          </MenuItem>
        ))}
      </Select>
      <Box display="flex" pt={1} px={0.5} alignItems="center">
        {selectedPatient ? (
          <>
            <Grid container>
              <Grid item xs={2}>
                ID:
              </Grid>
              <Grid item xs={10}>
                <Typography mb={1}>{selectedPatient.id}</Typography>
              </Grid>

              <Grid item xs={2}>
                Name:
              </Grid>
              <Grid item xs={10}>
                <Typography mb={1}>{constructName(selectedPatient.name)}</Typography>
              </Grid>

              <Grid item xs={2}>
                Gender:
              </Grid>
              <Grid item xs={10}>
                <Typography mb={1}>{selectedPatient.gender}</Typography>
              </Grid>

              <Grid item xs={2}>
                Birthdate:
              </Grid>
              <Grid item xs={10}>
                <Typography mb={1}>{selectedPatient.birthDate}</Typography>
              </Grid>
            </Grid>

            <Button onClick={handleClear}>Clear</Button>
          </>
        ) : (
          <StyledAlert color="info" width="100%">
            <Typography variant="body2" sx={{ mt: '0.5' }}>
              No patient selected
            </Typography>
          </StyledAlert>
        )}
      </Box>
    </Stack>
  );
}

export default PlaygroundPatientPicker;
