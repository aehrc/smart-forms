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

import { Box } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { useContext } from 'react';
import { SmartAppLaunchContext } from '../../features/smartAppLaunch/contexts/SmartAppLaunchContext.tsx';
import { constructName } from '../../features/smartAppLaunch/utils/launchContext.ts';
import dayjs from 'dayjs';
import { AccountDetailsTypography, AccountNameTypography } from '../Typography/Typography.tsx';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTheme } from '@mui/material/styles';
import { NavPatientDetailsWrapper } from './Nav.styles.ts';

dayjs.extend(localizedFormat);

function NavPatientDetails() {
  const { patient } = useContext(SmartAppLaunchContext);

  const theme = useTheme();

  return (
    <NavPatientDetailsWrapper columnGap={2}>
      <FaceIcon fontSize="large" sx={{ color: theme.palette.primary.dark }} />

      <Box>
        <AccountNameTypography name={patient ? constructName(patient.name) : 'No Patient'} />
        {patient ? (
          <>
            <AccountDetailsTypography details={patient ? `${patient.gender}` : ''} />
            <AccountDetailsTypography
              details={patient ? dayjs(patient.birthDate).format('LL') : ''}
            />
          </>
        ) : null}
      </Box>
    </NavPatientDetailsWrapper>
  );
}

export default NavPatientDetails;
