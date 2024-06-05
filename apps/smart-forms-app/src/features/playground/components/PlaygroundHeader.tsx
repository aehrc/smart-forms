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

import { useTheme } from '@mui/material/styles';
import Logo from '../../../components/Logos/Logo.tsx';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LogoWrapper } from '../../../components/Logos/Logo.styles.ts';
import { StyledRoot, StyledToolbar } from '../../../components/Header/Header.styles.ts';
import { memo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import type { Patient, Practitioner } from 'fhir/r4';
import PlaygroundSettingsDialog from './PlaygroundSettingsDialog.tsx';
import SettingsIcon from '@mui/icons-material/Settings';

interface PlaygroundHeaderProps {
  fhirServerUrl: string;
  patient: Patient | null;
  user: Practitioner | null;
  onFhirServerUrlChange: (url: string) => void;
  onPatientChange: (patient: Patient | null) => void;
  onUserChange: (practitioner: Practitioner | null) => void;
}

const PlaygroundHeader = memo(function PlaygroundHeader(props: PlaygroundHeaderProps) {
  const { fhirServerUrl, patient, user, onFhirServerUrlChange, onPatientChange, onUserChange } =
    props;

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const theme = useTheme();

  const { launchQuestionnaire } = useSmartClient();
  const launchQuestionnaireExists = !!launchQuestionnaire;

  const navigate = useNavigate();

  return (
    <StyledRoot sx={{ boxShadow: theme.customShadows.z4 }} navCollapsed={true}>
      <StyledToolbar>
        <Tooltip title="Exit playground">
          <IconButton
            onClick={() => {
              navigate(
                launchQuestionnaireExists ? '/dashboard/existing' : '/dashboard/questionnaires'
              );
            }}
            sx={{
              mr: 1,
              color: 'text.primary'
            }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Box color="text.primary">
          <LogoWrapper>
            <Logo isRendererHeader />
          </LogoWrapper>
        </Box>
        <Typography variant="h6" color="text.primary" sx={{ mx: 0.5 }}>
          Playground
        </Typography>

        <Box flexGrow={1} />

        <Tooltip title="Change launch context settings" placement="left">
          <span>
            <IconButton
              onClick={() => {
                setSettingsDialogOpen(true);
              }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <PlaygroundSettingsDialog
          open={settingsDialogOpen}
          closeDialog={() => {
            setSettingsDialogOpen(false);
          }}
          fhirServerUrl={fhirServerUrl}
          patient={patient}
          user={user}
          onFhirServerUrlChange={onFhirServerUrlChange}
          onPatientChange={onPatientChange}
          onUserChange={onUserChange}
        />
      </StyledToolbar>
    </StyledRoot>
  );
});

export default PlaygroundHeader;
