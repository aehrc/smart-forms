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
import type { Practitioner, PractitionerRole } from 'fhir/r4';
import { StyledAlert } from '../../../components/Nav/Nav.styles.ts';
import MenuItem from '@mui/material/MenuItem';
import { useMemo } from 'react';
import Select from '@mui/material/Select';
import useFetchPractitionerRoles from '../hooks/useFetchPractitionerRoles.ts';
import Button from '@mui/material/Button';

interface PlaygroundPractitionerRolePickerProps {
  sourceFhirServerUrl: string;
  selectedUser: Practitioner | null;
  selectedPractitionerRole: PractitionerRole | null;
  onSelectPractitionerRole: (practitionerRole: PractitionerRole | null) => void;
}

function PlaygroundPractitionerRolePicker(props: PlaygroundPractitionerRolePickerProps) {
  const { sourceFhirServerUrl, selectedUser, selectedPractitionerRole, onSelectPractitionerRole } =
    props;

  const { practitionerRoles, isLoading } = useFetchPractitionerRoles(
    sourceFhirServerUrl,
    selectedUser?.id ?? null
  );

  const selectedPractitionerRoleId = useMemo(
    () => practitionerRoles.find((pr) => pr.id === selectedPractitionerRole?.id)?.id,
    [selectedPractitionerRole?.id, practitionerRoles]
  );

  function handleSelectPractitionerRole(newSelectedId: string) {
    const selected = practitionerRoles.find((pr) => pr.id === newSelectedId);
    onSelectPractitionerRole(selected ?? null);
  }

  function handleClear() {
    onSelectPractitionerRole(null);
  }

  if (!selectedUser) {
    return (
      <Stack justifyContent="left" gap={0.5}>
        <Typography variant="subtitle2" color="text.secondary">
          Selected PractitionerRole
        </Typography>
        <StyledAlert color="info" width="100%">
          <Typography variant="body2" sx={{ mt: '0.5' }}>
            Select a user first to load practitioner roles
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
          <Typography variant="subtitle2">Loading practitioner roles...</Typography>
        </Stack>
      </Fade>
    );
  }

  if (practitionerRoles.length === 0) {
    return (
      <Stack justifyContent="left" gap={0.5}>
        <Typography variant="subtitle2" color="text.secondary">
          Selected PractitionerRole
        </Typography>
        <StyledAlert color="error" m={0.4}>
          <Typography>No practitioner roles available for this user</Typography>
        </StyledAlert>
      </Stack>
    );
  }

  return (
    <Stack justifyContent="left" gap={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Selected PractitionerRole
      </Typography>
      <Select
        value={selectedPractitionerRoleId ?? ''}
        size="small"
        fullWidth={true}
        data-test="practitioner-role-picker-playground"
        onChange={(e) => handleSelectPractitionerRole(e.target.value)}>
        {practitionerRoles.map((pr) => (
          <MenuItem key={pr.id} value={`${pr.id}`}>
            {pr.id}
          </MenuItem>
        ))}
      </Select>
      <Box display="flex" pt={1} px={0.5} alignItems="center">
        {selectedPractitionerRole ? (
          <>
            <Grid container sx={{ flex: 1 }}>
              <Grid size={{ xs: 2 }}>ID:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedPractitionerRole.id}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>Role:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>
                  {selectedPractitionerRole.code?.[0]?.coding?.[0]?.display ??
                    selectedPractitionerRole.code?.[0]?.text ??
                    '-'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>Specialty:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>
                  {selectedPractitionerRole.specialty?.[0]?.coding?.[0]?.display ??
                    selectedPractitionerRole.specialty?.[0]?.text ??
                    '-'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>Organisation:</Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>
                  {selectedPractitionerRole.organization?.display ??
                    selectedPractitionerRole.organization?.reference ??
                    '-'}
                </Typography>
              </Grid>
            </Grid>

            <Button onClick={handleClear}>Clear</Button>
          </>
        ) : (
          <StyledAlert color="info" width="100%">
            <Typography variant="body2" sx={{ mt: '0.5' }}>
              No practitioner role selected
            </Typography>
          </StyledAlert>
        )}
      </Box>
    </Stack>
  );
}

export default PlaygroundPractitionerRolePicker;
