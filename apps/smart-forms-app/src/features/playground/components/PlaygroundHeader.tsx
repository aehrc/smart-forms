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
import { memo } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSmartClient from '../../../hooks/useSmartClient.ts';

const PlaygroundHeader = memo(function PlaygroundHeader() {
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
            <Logo />
          </LogoWrapper>
        </Box>

        <Box flexGrow={1} />

        <Typography variant="h6" color="text.primary">
          Playground
        </Typography>
      </StyledToolbar>
    </StyledRoot>
  );
});

export default PlaygroundHeader;
