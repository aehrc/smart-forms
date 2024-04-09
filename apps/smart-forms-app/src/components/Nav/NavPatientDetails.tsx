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

import { Box, Typography } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { constructName } from '../../features/smartAppLaunch/utils/launchContext.ts';
import dayjs from 'dayjs';
import { AccountDetailsTypography, AccountNameTypography } from '../Typography/Typography.tsx';
import { useTheme } from '@mui/material/styles';
import { NavPatientDetailsWrapper } from './Nav.styles.ts';
import useSmartClient from '../../hooks/useSmartClient.ts';

function NavPatientDetails() {
  const { patient } = useSmartClient();

  const theme = useTheme();

  return (
    <NavPatientDetailsWrapper columnGap={1.5}>
      <FaceIcon fontSize="large" sx={{ color: theme.palette.primary.dark }} />

      <Box>
        <Typography fontSize={10} variant="subtitle1" color={'text.secondary'}>
          Patient
        </Typography>
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
