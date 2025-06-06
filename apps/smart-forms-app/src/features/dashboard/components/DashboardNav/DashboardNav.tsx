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

import { Box, Drawer } from '@mui/material';
import Logo from '../../../../components/Logos/Logo.tsx';
import DashboardNavSection from './DashboardNavSection.tsx';
import NavPatientDetails from '../../../../components/Nav/NavPatientDetails.tsx';
import NavErrorAlert from '../../../../components/Nav/NavErrorAlert.tsx';
import CsiroLogo from '../../../../components/Logos/CsiroLogo.tsx';
import GoToPlaygroundButton from '../DashboardPages/QuestionnairePage/Buttons/GoToPlaygroundButton.tsx';
import { CsiroLogoWrapper, NavLogoWrapper } from '../../../../components/Logos/Logo.styles.ts';
import { NavMiddleWrapper } from '../../../../components/Nav/Nav.styles.ts';
import { NAV_WIDTH } from '../../../../components/Header/Header.styles.ts';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import useDebugMode from '../../../../hooks/useDebugMode.ts';
import { useResponsive } from '@aehrc/smart-forms-renderer';

interface DashboardNavProps {
  openNav: boolean;
  onCloseNav: () => void;
}

export default function DashboardNav(props: DashboardNavProps) {
  const { openNav, onCloseNav } = props;

  const { smartClient } = useSmartClient();
  const { debugModeEnabled } = useDebugMode();

  const isLgUp = useResponsive({ query: 'up', start: 'lg' });

  const isNotLaunched = !smartClient;

  const renderContent = (
    <>
      <NavLogoWrapper>
        <Logo isNav />
      </NavLogoWrapper>

      <NavPatientDetails />

      <DashboardNavSection onCloseNav={onCloseNav} />

      <Box flexGrow={1} />

      <NavMiddleWrapper gap={2}>
        {isNotLaunched ? (
          <NavErrorAlert message="Responses not available, app not launched via SMART" />
        ) : null}
        {isNotLaunched || debugModeEnabled ? <GoToPlaygroundButton /> : null}
      </NavMiddleWrapper>

      <CsiroLogoWrapper>
        <CsiroLogo />
      </CsiroLogoWrapper>
    </>
  );

  return (
    <Box
      role="complementary"
      aria-label="Primary navigation sidebar"
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH }
      }}>
      {isLgUp ? (
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
