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

import { Avatar, Box, useTheme } from '@mui/material';
import { useContext } from 'react';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { AccountDetailsTypography, AccountNameTypography } from '../Misc/Typography';
import { constructName } from '../../functions/LaunchContextFunctions';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

function UserHeader() {
  const theme = useTheme();
  const { user } = useContext(LaunchContext);

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar sx={{ bgcolor: theme.palette.error.main }}>
        <MedicalServicesIcon sx={{ color: theme.palette.common.white }} />
      </Avatar>
      <Box>
        <AccountNameTypography name={user ? constructName(user.name) : 'No User'} />
        {user && user.gender ? <AccountDetailsTypography details={`${user.gender}`} /> : null}
      </Box>
    </Box>
  );
}

export default UserHeader;
