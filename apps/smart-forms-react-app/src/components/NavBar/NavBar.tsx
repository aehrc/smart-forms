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

import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import { constructName } from '../../functions/LaunchContextFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { NavBarTitleTypography, NavToolBar } from './NavBar.styles';
import NavBarPatientUserDetails from './NavBarPatientUserDetails';

const patientData: PatientData = {
  name: '',
  gender: '',
  dateOfBirth: ''
};

const userData: UserData = {
  name: ''
};

function NavBar() {
  const { patient, user } = useContext(LaunchContext);

  if (patient) {
    const dateOfBirthDayJs = dayjs(patient.birthDate);
    const age = dayjs().diff(dateOfBirthDayJs, 'year');

    patientData.name = constructName(patient.name);
    patientData.gender = `${patient.gender}`;
    patientData.dateOfBirth = `${dateOfBirthDayJs.format('LL')} (${age} years)`;
  }

  if (user) {
    userData.name = constructName(user.name);
  }

  return (
    <>
      <NavToolBar variant="dense">
        <Box>
          <NavBarTitleTypography>SMART Forms</NavBarTitleTypography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <NavBarPatientUserDetails patientData={patientData} userData={userData} />
      </NavToolBar>
    </>
  );
}

export default React.memo(NavBar);
