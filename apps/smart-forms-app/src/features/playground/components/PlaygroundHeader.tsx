/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import Iconify from '../../../components/Iconify/Iconify.tsx';

import { useTheme } from '@mui/material/styles';
import Logo from '../../../components/Logos/Logo.tsx';
import { Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LogoWrapper } from '../../../components/Logos/Logo.styles.ts';
import { StyledRoot } from '../../../components/Header/Header.styles.ts';
import { memo } from 'react';

const HEADER_PLAYGROUND = 64;

const PlaygroundHeader = memo(function PlaygroundHeader() {
  const theme = useTheme();

  const navigate = useNavigate();

  return (
    <StyledRoot sx={{ boxShadow: theme.customShadows.z4 }} navCollapsed={true}>
      <Toolbar
        sx={{
          height: HEADER_PLAYGROUND
        }}>
        <Tooltip title="Exit playground">
          <IconButton
            onClick={() => {
              navigate('/dashboard/questionnaires');
            }}
            sx={{
              mr: 1,
              color: 'text.primary'
            }}>
            <Iconify icon="uil:exit" />
          </IconButton>
        </Tooltip>

        <LogoWrapper>
          <Logo />
        </LogoWrapper>

        <Box flexGrow={1} />
        <Typography variant="h6" sx={{ color: 'common.black' }}>
          Playground
        </Typography>
      </Toolbar>
    </StyledRoot>
  );
});

export default PlaygroundHeader;
