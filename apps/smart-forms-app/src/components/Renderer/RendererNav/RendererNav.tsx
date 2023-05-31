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

import { useContext } from 'react';
import { Box, Drawer, Grid, IconButton, Tooltip } from '@mui/material';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../Misc/Logo';
import Scrollbar from '../../Scrollbar/Scrollbar';
import NavAccounts from '../../Nav/NavAccounts';
import RendererNavSection from './RendererNavSection';
import RendererOperationSection from './RendererOperationSection';
import { SmartAppLaunchContext } from '../../../custom-contexts/SmartAppLaunchContext.tsx';
import NavErrorAlert from '../../Nav/NavErrorAlert';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import CsiroLogo from '../../Misc/CsiroLogo';

const NAV_WIDTH = 240;

interface Props {
  openNav: boolean;
  navCollapsed: boolean;
  onCloseNav: () => void;
  setNavCollapsed: () => void;
}

function RendererNav(props: Props) {
  const { openNav, onCloseNav, navCollapsed, setNavCollapsed } = props;

  const { fhirClient } = useContext(SmartAppLaunchContext);

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
      <RendererOperationSection />

      <Box sx={{ flexGrow: 1 }} />

      {!fhirClient ? (
        <Box sx={{ px: 2.5, py: 10 }}>
          <NavErrorAlert message={'Save operations disabled, app not launched via SMART'} />
        </Box>
      ) : null}

      <Box sx={{ mx: 0.5, pb: 2 }}>
        <Grid container alignItems="center">
          <Grid item xs={4} />
          <Grid item xs={4}>
            <CsiroLogo />
          </Grid>
          <Grid item xs={4}>
            {navCollapsed || !isDesktop ? null : (
              <Box display="flex" justifyContent="end" alignItems="center">
                <Tooltip title="Collapse Sidebar" placement="right">
                  <span>
                    <IconButton onClick={setNavCollapsed}>
                      <KeyboardDoubleArrowLeftIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
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
