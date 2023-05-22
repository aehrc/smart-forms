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
import { useContext } from 'react';
import { SmartAppLaunchContext } from '../../custom-contexts/SmartAppLaunchContext.tsx';
import { AccountDetailsTypography, AccountNameTypographyNoWrap } from '../Misc/Typography';
import { constructName } from '../../functions/LaunchContextFunctions';

function UserPopoverMenu() {
  const { user } = useContext(SmartAppLaunchContext);

  return (
    <Box sx={{ my: 1.5, px: 2.5 }}>
      <AccountNameTypographyNoWrap name={user ? constructName(user.name) : 'No User'} />
      {user ? <AccountDetailsTypography details={user.gender ? `${user.gender}` : ''} /> : null}
    </Box>
  );
}

export default UserPopoverMenu;
