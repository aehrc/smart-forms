import React, { useContext } from 'react';
import { Box, Drawer, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../Misc/Logo';
import csiroLogo from '../../../data/images/csiro-logo.png';
import Scrollbar from '../../Scrollbar/Scrollbar';
import { NAV_WIDTH } from '../../StyledComponents/Nav.styles';
import NavAccounts from '../../Nav/NavAccounts';
import RendererNavSection from './RendererNavSection';
import RendererOperationSection from './RendererOperationSection';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import NavErrorAlert from '../../Nav/NavErrorAlert';
import { QuestionnaireProviderContext } from '../../../App';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

interface Props {
  openNav: boolean;
  navCollapsed: boolean;
  onCloseNav: () => void;
  setNavCollapsed: () => void;
}

function RendererNav(props: Props) {
  const { openNav, onCloseNav, navCollapsed, setNavCollapsed } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
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

      <RendererNavSection />

      {fhirClient && questionnaireProvider.questionnaire.item ? <RendererOperationSection /> : null}

      <Box sx={{ flexGrow: 1 }} />

      {!fhirClient ? (
        <NavErrorAlert
          message={'Save operations are disabled when app is not connected to a FHIR server'}
        />
      ) : null}

      <Box sx={{ mx: 0.5, pb: 2 }}>
        <Grid container alignItems="center">
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1.5}>
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
          </Grid>
          <Grid item xs={4}>
            <Box display="flex" justifyContent="end" alignItems="center">
              <Tooltip title="Collapse Sidebar" placement="right">
                <span>
                  <IconButton onClick={setNavCollapsed}>
                    <KeyboardDoubleArrowLeftIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          flexShrink: { lg: 0 },
          width: { lg: navCollapsed ? 0 : NAV_WIDTH }
        }}>
        {isDesktop && !navCollapsed ? (
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
    </>
  );
}

export default RendererNav;
