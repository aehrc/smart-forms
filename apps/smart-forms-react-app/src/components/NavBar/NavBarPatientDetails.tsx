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

import React from 'react';
import { Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import { PatientData } from '../../interfaces/Interfaces';
import NavBarGenderIcon from './NavBarGenderIcon';
import { NavBarPatientDetailsTypography } from './NavBar.styles';

interface Props {
  patientData: PatientData;
}

function NavBarPatientDetails(props: Props) {
  const { patientData } = props;

  if (patientData.name === '') {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <AccountCircleIcon fontSize="small" />
        <NavBarPatientDetailsTypography>No Patient</NavBarPatientDetailsTypography>
      </Stack>
    );
  } else {
    return (
      <Stack direction="row" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountCircleIcon fontSize="small" />
          <NavBarPatientDetailsTypography>{patientData.name}</NavBarPatientDetailsTypography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NavBarGenderIcon gender={patientData.gender} />
            <NavBarPatientDetailsTypography>{patientData.gender}</NavBarPatientDetailsTypography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon fontSize="small" />
            <NavBarPatientDetailsTypography>
              {patientData.dateOfBirth}
            </NavBarPatientDetailsTypography>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

export default NavBarPatientDetails;
