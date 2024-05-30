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
import type { Practitioner } from 'fhir/r4';
import { StyledAlert } from '../../../components/Nav/Nav.styles.ts';
import MenuItem from '@mui/material/MenuItem';
import { useMemo } from 'react';
import Select from '@mui/material/Select';
import { constructName } from '../../smartAppLaunch/utils/launchContext.ts';
import useFetchPractitioners from '../hooks/useFetchPractitioners.ts';
import Button from '@mui/material/Button';

interface PlaygroundPractitionerPickerProps {
  fhirServerUrl: string;
  selectedUser: Practitioner | null;
  onSelectUser: (user: Practitioner | null) => void;
}

function PlaygroundUserPicker(props: PlaygroundPractitionerPickerProps) {
  const { fhirServerUrl, selectedUser, onSelectUser } = props;

  const { practitioners, isInitialLoading } = useFetchPractitioners(fhirServerUrl);

  const selectedUserId = useMemo(
    () => practitioners.find((p) => p.id === selectedUser?.id)?.id,
    [selectedUser?.id, practitioners]
  );

  function handleSelectUser(newSelectedPatientId: string) {
    const selectedUser = practitioners.find(
      (practitioner) => practitioner.id === newSelectedPatientId
    );
    onSelectUser(selectedUser ?? null);
  }

  function handleClear() {
    onSelectUser(null);
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
          <Typography variant="subtitle2">Loading practitioners...</Typography>
        </Stack>
      </Fade>
    );
  }

  if (practitioners.length === 0) {
    return (
      <StyledAlert color="error" m={0.4}>
        <Typography>No practitioners available</Typography>
      </StyledAlert>
    );
  }

  return (
    <Stack justifyContent="left" gap={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Selected User (Practitioner)
      </Typography>
      <Select
        value={selectedUserId ?? ''}
        size="small"
        fullWidth={true}
        onChange={(e) => handleSelectUser(e.target.value)}>
        {practitioners.map((patient) => (
          <MenuItem key={patient.id} value={`${patient.id}`}>
            {patient.name ? constructName(patient.name) : `Patient ${patient.id}`}
          </MenuItem>
        ))}
      </Select>
      <Box display="flex" pt={1} px={0.5} alignItems="center">
        {selectedUser ? (
          <>
            <Grid container>
              <Grid item xs={2}>
                ID:
              </Grid>
              <Grid item xs={10}>
                <Typography mb={1}>{selectedUser.id}</Typography>
              </Grid>

              <Grid item xs={2}>
                Name:
              </Grid>
              <Grid item xs={10}>
                <Typography mb={1}>{constructName(selectedUser.name)}</Typography>
              </Grid>
            </Grid>

            <Button onClick={handleClear}>Clear</Button>
          </>
        ) : (
          <StyledAlert color="info" width="100%">
            <Typography variant="body2" sx={{ mt: '0.5' }}>
              No user selected
            </Typography>
          </StyledAlert>
        )}
      </Box>
    </Stack>
  );
}

export default PlaygroundUserPicker;
