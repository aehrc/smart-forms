import Iconify from '../../Misc/Iconify';

import { StyledRoot, StyledToolbar } from '../../StyledComponents/Header.styles';
import React, { useContext } from 'react';
import FaceIcon from '@mui/icons-material/Face';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountPopover from '../../Header/AccountPopover';
import { useTheme } from '@mui/material/styles';
import PatientPopoverMenu from '../../Header/PatientPopoverMenu';
import UserPopoverMenu from '../../Header/UserPopoverMenu';
import UserHeader from '../../Header/UserHeader';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../Misc/Logo';
import { QuestionnaireProviderContext } from '../../../App';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuestionnairePopoverMenu from '../../Header/QuestionnairePopoverMenu';
import { Box, IconButton, Stack, Typography } from '@mui/material';

interface Props {
  navCollapsed: boolean;
  onOpenNav: () => void;
}

function RendererHeader(props: Props) {
  const { navCollapsed, onOpenNav } = props;

  const theme = useTheme();

  const isDesktop = useResponsive('up', 'lg');
  const { questionnaire } = useContext(QuestionnaireProviderContext);

  return (
    <StyledRoot sx={{ boxShadow: theme.customShadows.z4 }} navCollapsed={navCollapsed}>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            ...(!navCollapsed && { display: { lg: 'none' } })
          }}
          data-test="button-expand-nav">
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        {isDesktop && !navCollapsed ? null : (
          <Box sx={{ p: 1, display: 'inline-flex' }}>
            <Logo />
          </Box>
        )}

        {isDesktop && !navCollapsed ? (
          <Box sx={{ px: 1 }}>
            <Typography variant="subtitle1" color="text.primary">
              {questionnaire.title}
            </Typography>
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
          {isDesktop && !navCollapsed ? (
            <UserHeader />
          ) : (
            <>
              <AccountPopover
                bgColor={theme.palette.primary.main}
                displayIcon={<AssignmentIcon sx={{ color: theme.palette.common.white }} />}
                menuContent={<QuestionnairePopoverMenu />}
              />
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

export default RendererHeader;
