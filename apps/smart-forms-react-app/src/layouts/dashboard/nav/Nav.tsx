import React, { useContext } from 'react';
import { Box, Drawer, Typography } from '@mui/material';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../../components/Logo/Logo';
import csiroLogo from '../../../data/images/csiro-logo.png';
import Scrollbar from '../../../components/Scrollbar/Scrollbar';
import NavSection from '../../../components/Nav/DashboardNav/NavSection';
import { NAV_WIDTH } from '../../Nav.styles';
import NavAccounts from '../../../components/Nav/NavAccounts';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import NavErrorAlert from '../../../components/Nav/NavErrorAlert';

interface Props {
  openNav: boolean;
  onCloseNav: () => void;
}

export default function Nav(props: Props) {
  const { openNav, onCloseNav } = props;

  const { fhirClient } = useContext(LaunchContext);

  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
      }}>
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <NavAccounts />

      <NavSection />

      <Box sx={{ flexGrow: 1 }} />

      {!fhirClient ? (
        <NavErrorAlert
          message={'Viewing responses are disabled when app is not connected to a FHIR server'}
        />
      ) : null}

      <Box sx={{ px: 2.5, pb: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Typography sx={{ color: 'text.secondary' }}>By</Typography>
          <Box
            component="img"
            sx={{
              maxHeight: { xs: 35 },
              maxWidth: { xs: 35 }
            }}
            src={csiroLogo}
          />
        </Box>
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH }
      }}>
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed'
            }
          }}>
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH }
          }}>
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
