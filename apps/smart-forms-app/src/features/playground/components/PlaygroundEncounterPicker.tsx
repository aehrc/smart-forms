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

import { Box, CircularProgress, Fade, Grid, Stack, Typography } from '@mui/material';
import type { Encounter, Patient } from 'fhir/r4';
import { StyledAlert } from '../../../components/Nav/Nav.styles.ts';
import MenuItem from '@mui/material/MenuItem';
import { useMemo } from 'react';
import Select from '@mui/material/Select';
import useFetchEncounters from '../hooks/useFetchEncounters.ts';
import Button from '@mui/material/Button';

interface PlaygroundEncounterPickerProps {
  sourceFhirServerUrl: string;
  selectedPatient: Patient | null;
  selectedEncounter: Encounter | null;
  onSelectEncounter: (encounter: Encounter | null) => void;
}

function PlaygroundEncounterPicker(props: PlaygroundEncounterPickerProps) {
  const { sourceFhirServerUrl, selectedPatient, selectedEncounter, onSelectEncounter } = props;

  const { encounters, isLoading } = useFetchEncounters(
    sourceFhirServerUrl,
    selectedPatient?.id ?? null
  );

  const selectedEncounterId = useMemo(
    () => encounters.find((e) => e.id === selectedEncounter?.id)?.id,
    [selectedEncounter?.id, encounters]
  );

  function handleSelectEncounter(newSelectedEncounterId: string) {
    const selected = encounters.find((encounter) => encounter.id === newSelectedEncounterId);
    onSelectEncounter(selected ?? null);
  }

  function handleClear() {
    onSelectEncounter(null);
  }

  if (!selectedPatient) {
    return (
      <Stack justifyContent="left" gap={0.5}>
        <Typography variant="subtitle2" color="text.secondary">
          Selected Encounter
        </Typography>
        <StyledAlert color="info" width="100%">
          <Typography variant="body2" sx={{ mt: '0.5' }}>
            Select a patient first to load encounters
          </Typography>
        </StyledAlert>
      </Stack>
    );
  }

  if (isLoading) {
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
          <Typography variant="subtitle2">Loading encounters...</Typography>
        </Stack>
      </Fade>
    );
  }

  if (encounters.length === 0) {
    return (
      <Stack justifyContent="left" gap={0.5}>
        <Typography variant="subtitle2" color="text.secondary">
          Selected Encounter
        </Typography>
        <StyledAlert color="error" m={0.4}>
          <Typography>No encounters available for this patient</Typography>
        </StyledAlert>
      </Stack>
    );
  }

  return (
    <Stack justifyContent="left" gap={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Selected Encounter
      </Typography>
      <Select
        value={selectedEncounterId ?? ''}
        size="small"
        fullWidth={true}
        data-test="encounter-picker-playground"
        onChange={(e) => handleSelectEncounter(e.target.value)}>
        {encounters.map((encounter) => (
          <MenuItem key={encounter.id} value={`${encounter.id}`}>
            {encounter.id}
          </MenuItem>
        ))}
      </Select>
      <Box display="flex" pt={1} px={0.5} alignItems="center">
        {selectedEncounter ? (
          <>
            <Grid container sx={{ flex: 1 }}>
              <Grid size={{ xs: 2 }}>ID:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedEncounter.id}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>Status:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedEncounter.status}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>Class:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>
                  {selectedEncounter.class?.display ?? selectedEncounter.class?.code ?? '-'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>Period:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>
                  {selectedEncounter.period?.start
                    ? `${selectedEncounter.period.start.slice(0, 10)}${selectedEncounter.period.end ? ` → ${selectedEncounter.period.end.slice(0, 10)}` : ''}`
                    : '-'}
                </Typography>
              </Grid>
            </Grid>

            <Button onClick={handleClear}>Clear</Button>
          </>
        ) : (
          <StyledAlert color="info" width="100%">
            <Typography variant="body2" sx={{ mt: '0.5' }}>
              No encounter selected
            </Typography>
          </StyledAlert>
        )}
      </Box>
    </Stack>
  );
}

export default PlaygroundEncounterPicker;
