import { Box, IconButton, Stack } from '@mui/material';
import Iconify from '../../components/Iconify';
import { StyledRoot, StyledToolbar } from '../Header.styles';
import React from 'react';
import FaceIcon from '@mui/icons-material/Face';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountPopover from '../../components/Account/AccountPopover';
import { useTheme } from '@mui/material/styles';
import PatientPopoverMenu from '../../components/Account/PatientPopoverMenu';
import UserPopoverMenu from '../../components/Account/UserPopoverMenu';
import UserHeader from '../../components/Account/UserHeader';
import useResponsive from '../../custom-hooks/useResponsive';
import Logo from '../../components/Logo/Logo';

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
