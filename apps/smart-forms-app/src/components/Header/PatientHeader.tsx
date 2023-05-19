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

import { Avatar, Box, Tooltip, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { SmartAppLaunchContext } from '../../custom-contexts/SmartAppLaunchContext.tsx';
import { AccountDetailsTypography, AccountNameTypography } from '../Misc/Typography';
import FaceIcon from '@mui/icons-material/Face';
import { constructName } from '../../functions/LaunchContextFunctions';
import dayjs from 'dayjs';

function PatientHeader() {
  const theme = useTheme();
  const { patient } = useContext(SmartAppLaunchContext);

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
        <FaceIcon sx={{ color: theme.palette.common.white }} />
      </Avatar>
      <Box>
        <AccountNameTypography name={patient ? constructName(patient.name) : 'No Patient'} />
        {patient ? (
          <>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccountDetailsTypography details={`${patient.gender}`} />
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title={dayjs(patient.birthDate).format('LL')}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }} noWrap>
                  {`${dayjs().diff(dayjs(patient.birthDate), 'year').toString()} years`}
                </Typography>
              </Tooltip>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}

export default PatientHeader;
