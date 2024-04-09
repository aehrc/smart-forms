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
import useResponsive from '../../../hooks/useResponsive.ts';
import Logo from '../../../components/Logos/Logo.tsx';
import Scrollbar from '../../../components/Scrollbar/Scrollbar.tsx';
import NavPatientDetails from '../../../components/Nav/NavPatientDetails.tsx';
import ViewerNavSection from './ViewerNavSection.tsx';
import ViewerOperationSection from './ViewerOperationSection.tsx';
import NavErrorAlert from '../../../components/Nav/NavErrorAlert.tsx';
import CsiroLogo from '../../../components/Logos/CsiroLogo.tsx';
import { CsiroLogoWrapper, NavLogoWrapper } from '../../../components/Logos/Logo.styles.ts';
import { NavErrorAlertWrapper } from '../../../components/Nav/Nav.styles.ts';
import { NAV_WIDTH } from '../../../components/Header/Header.styles.ts';
import ViewerLaunchQuestionnaireNavSection from './ViewerLaunchQuestionnaireNavSection.tsx';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../hooks/useSmartClient.ts';

interface Props {
  openNav: boolean;
  onCloseNav: () => void;
}

function ViewerNav(props: Props) {
  const { openNav, onCloseNav } = props;

  const { smartClient, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const isDesktop = useResponsive('up', 'lg');

  const launchQuestionnaireExists = !!launchQuestionnaire;
  const isNotLaunched = !smartClient;

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
      }}>
      <NavLogoWrapper>
        <Logo isNav />
      </NavLogoWrapper>

      <NavPatientDetails />
      {launchQuestionnaireExists ? <ViewerLaunchQuestionnaireNavSection /> : <ViewerNavSection />}

      {/*<ViewerNavSection />*/}

      {smartClient && sourceQuestionnaire.item && sourceResponse.item ? (
        <ViewerOperationSection />
      ) : null}

      <Box flexGrow={1} />

      {isNotLaunched ? (
        <NavErrorAlertWrapper>
          <NavErrorAlert message="Saving is disabled, app not launched via SMART" />
        </NavErrorAlertWrapper>
      ) : null}

      <CsiroLogoWrapper>
        <CsiroLogo />
      </CsiroLogoWrapper>
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

export default ViewerNav;
