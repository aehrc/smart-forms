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

import { Box, IconButton, Stack } from '@mui/material';
import Iconify from '../../Misc/Iconify';
import { StyledRoot, StyledToolbar } from '../../StyledComponents/Header.styles';
import React from 'react';
import FaceIcon from '@mui/icons-material/Face';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountPopover from '../../Header/AccountPopover';
import { useTheme } from '@mui/material/styles';
import PatientPopoverMenu from '../../Header/PatientPopoverMenu';
import UserPopoverMenu from '../../Header/UserPopoverMenu';
import UserHeader from '../../Header/UserHeader';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../Misc/Logo';

interface Props {
  onOpenNav: () => void;
}

function DashboardHeader(props: Props) {
  const { onOpenNav } = props;

  const theme = useTheme();

  const isDesktop = useResponsive('up', 'lg');

  return (
    <StyledRoot>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            display: { lg: 'none' }
          }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        {!isDesktop ? (
          <Box sx={{ p: 1, display: 'inline-flex' }}>
            <Logo />
          </Box>
        ) : null}
        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1
          }}
          sx={{ color: theme.palette.grey['700'] }}>
          {isDesktop ? (
            <UserHeader />
          ) : (
            <>
              <AccountPopover
                bgColor={theme.palette.secondary.main}
                displayIcon={<FaceIcon sx={{ color: theme.palette.common.white }} />}
                menuContent={<PatientPopoverMenu />}
              />
              <AccountPopover
                bgColor={theme.palette.error.main}
                displayIcon={<MedicalServicesIcon sx={{ color: theme.palette.common.white }} />}
                menuContent={<UserPopoverMenu />}
              />
            </>
          )}
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}

export default DashboardHeader;
