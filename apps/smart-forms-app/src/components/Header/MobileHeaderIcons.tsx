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

import HeaderPopover from './Popovers/HeaderPopover.tsx';
import FaceIcon from '@mui/icons-material/Face';
import PatientPopoverMenu from './Popovers/PatientPopoverMenu.tsx';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import UserPopoverMenu from './Popovers/UserPopoverMenu.tsx';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import NotLaunchedPopover from './Popovers/NotLaunchedPopover.tsx';
import { constructShortName } from '../../features/smartAppLaunch/utils/launchContext.ts';
import useSmartClient from '../../hooks/useSmartClient.ts';

function MobileHeaderIcons() {
  const theme = useTheme();

  const { smartClient, patient, user } = useSmartClient();

  const isNotLaunched = !smartClient;

  return (
    <>
      {isNotLaunched ? (
        <Box sx={{ mx: 1 }}>
          <NotLaunchedPopover />
        </Box>
      ) : null}
      <HeaderPopover
        entity={patient ? constructShortName(patient.name) : 'Patient'}
        bgColor={theme.palette.primary.main}
        displayIcon={<FaceIcon fontSize="small" sx={{ color: theme.palette.common.white }} />}
        menuContent={<PatientPopoverMenu />}
      />
      <HeaderPopover
        entity={user ? constructShortName(user.name) : 'user'}
        bgColor={theme.palette.error.main}
        displayIcon={
          <MedicalServicesIcon fontSize="small" sx={{ color: theme.palette.common.white }} />
        }
        menuContent={<UserPopoverMenu />}
      />
    </>
  );
}

export default MobileHeaderIcons;
