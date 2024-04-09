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

import { NavLogoWrapper } from '../../../../components/Logos/Logo.styles.ts';
import Logo from '../../../../components/Logos/Logo.tsx';
import NavPatientDetails from '../../../../components/Nav/NavPatientDetails.tsx';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import { NavErrorAlertWrapper } from '../../../../components/Nav/Nav.styles.ts';
import NavErrorAlert from '../../../../components/Nav/NavErrorAlert.tsx';
import CsiroLogo from '../../../../components/Logos/CsiroLogo.tsx';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Scrollbar from '../../../../components/Scrollbar/Scrollbar.tsx';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';
import RendererNavStandardActions from './RendererNavStandardActions.tsx';
import RendererNavLaunchQuestionnaireActions from './RendererNavLaunchQuestionnaireActions.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';

interface RendererNavProps {
  isNotLaunched: boolean;
  navIsShown: boolean;
  onCollapseNav: () => void;
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererNav(props: RendererNavProps) {
  const { isNotLaunched, navIsShown, onCollapseNav, spinner, onSpinnerChange } = props;

  const { launchQuestionnaire } = useSmartClient();

  return (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
      }}>
      <NavLogoWrapper>
        <Logo isNav />
      </NavLogoWrapper>

      <NavPatientDetails />

      {launchQuestionnaire ? (
        <RendererNavLaunchQuestionnaireActions
          spinner={spinner}
          onSpinnerChange={onSpinnerChange}
        />
      ) : (
        <RendererNavStandardActions spinner={spinner} onSpinnerChange={onSpinnerChange} />
      )}

      <Box flexGrow={1} />

      {isNotLaunched ? (
        <NavErrorAlertWrapper>
          <NavErrorAlert message="Saving is disabled, app not launched via SMART" />
        </NavErrorAlertWrapper>
      ) : null}

      <Box sx={{ mx: 0.5, pb: 2 }}>
        <Grid container alignItems="center">
          <Grid item xs={4} />
          <Grid item xs={4}>
            <CsiroLogo />
          </Grid>
          <Grid item xs={4}>
            {navIsShown ? (
              <Box display="flex" justifyContent="end" alignItems="center">
                <Tooltip title="Collapse Sidebar" placement="right">
                  <span>
                    <IconButton onClick={onCollapseNav}>
                      <KeyboardDoubleArrowLeftIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </Scrollbar>
  );
}

export default RendererNav;
