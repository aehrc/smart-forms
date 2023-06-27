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
import { Box } from '@mui/material';
import NavErrorAlert from '../Nav/NavErrorAlert.tsx';
import PersonPopover from './Popovers/PersonPopover.tsx';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuestionnairePopoverMenu from './Popovers/QuestionnairePopoverMenu.tsx';
import FaceIcon from '@mui/icons-material/Face';
import PatientPopoverMenu from './Popovers/PatientPopoverMenu.tsx';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import UserPopoverMenu from './Popovers/UserPopoverMenu.tsx';
import { useTheme } from '@mui/material/styles';
import { SmartAppLaunchContext } from '../../features/smartAppLaunch/contexts/SmartAppLaunchContext.tsx';

function MobileHeaderWithQuestionnaire() {
  const { fhirClient } = useContext(SmartAppLaunchContext);

  const theme = useTheme();

  const isNotLaunched = !fhirClient;

  return (
    <>
      {isNotLaunched ? (
        <Box sx={{ m: 0.5 }}>
          <NavErrorAlert message={'Save operations disabled, app not launched via SMART'} />
        </Box>
      ) : null}
      <PersonPopover
        bgColor={theme.palette.primary.main}
        displayIcon={<AssignmentIcon sx={{ color: theme.palette.common.white }} />}
        menuContent={<QuestionnairePopoverMenu />}
      />
      <PersonPopover
        bgColor={theme.palette.secondary.main}
        displayIcon={<FaceIcon sx={{ color: theme.palette.common.white }} />}
        menuContent={<PatientPopoverMenu />}
      />
      <PersonPopover
        bgColor={theme.palette.error.main}
        displayIcon={<MedicalServicesIcon sx={{ color: theme.palette.common.white }} />}
        menuContent={<UserPopoverMenu />}
      />
    </>
  );
}

export default MobileHeaderWithQuestionnaire;
