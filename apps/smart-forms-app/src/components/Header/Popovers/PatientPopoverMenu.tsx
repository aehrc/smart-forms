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

import {
  AccountDetailsTypography,
  AccountDetailsTypographyNoCaps,
  AccountNameTypographyNoWrap
} from '../../Typography/Typography.tsx';
import { constructName } from '../../../features/smartAppLaunch/utils/launchContext.ts';
import dayjs from 'dayjs';
import { PopoverMenuWrapper } from './Popover.styles.ts';
import { Typography } from '@mui/material';
import useSmartClient from '../../../hooks/useSmartClient.ts';

function PatientPopoverMenu() {
  const { patient } = useSmartClient();

  return (
    <PopoverMenuWrapper>
      <Typography variant="body2">Patient</Typography>
      <AccountNameTypographyNoWrap name={patient ? constructName(patient.name) : 'No Patient'} />
      <AccountDetailsTypography details={patient ? `${patient.gender}` : ''} />
      <AccountDetailsTypographyNoCaps
        details={
          patient ? `${dayjs().diff(dayjs(patient.birthDate), 'year').toString()} years` : ''
        }
      />
      <AccountDetailsTypography details={patient ? dayjs(patient.birthDate).format('LL') : ''} />
    </PopoverMenuWrapper>
  );
}

export default PatientPopoverMenu;
