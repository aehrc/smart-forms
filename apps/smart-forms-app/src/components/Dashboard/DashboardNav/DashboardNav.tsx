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
import { Box, Drawer, Stack } from '@mui/material';
import useResponsive from '../../../hooks/useResponsive';
import Logo from '../../Misc/Logo';
import Scrollbar from '../../Scrollbar/Scrollbar';
import NavSection from './DashboardNavSection';
import NavAccounts from '../../Nav/NavAccounts';
import { SmartAppLaunchContext } from '../../../features/smartAppLaunch/contexts/SmartAppLaunchContext.tsx';
import NavErrorAlert from '../../Nav/NavErrorAlert';
import CsiroLogo from '../../Misc/CsiroLogo';
import GoToPlaygroundButton from '../QuestionnairePage/QuestionnairePageComponents/GoToPlaygroundButton.tsx';
import { DebugModeContext } from '../../../features/debug/contexts/DebugModeContext.tsx';

const NAV_WIDTH = 240;

interface Props {
  openNav: boolean;
  onCloseNav: () => void;
}

export default function DashboardNav(props: Props) {
  const { openNav, onCloseNav } = props;

  const { fhirClient } = useContext(SmartAppLaunchContext);
  const { debugMode } = useContext(DebugModeContext);

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

      <Stack sx={{ px: 2.5, py: 10 }} gap={2}>
        {!fhirClient ? (
          <NavErrorAlert message={'Viewing responses disabled, app not launched via SMART'} />
        ) : null}
        {!fhirClient || debugMode ? <GoToPlaygroundButton /> : null}
      </Stack>

      <Box sx={{ px: 2.5, pb: 2 }}>
        <CsiroLogo />
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
