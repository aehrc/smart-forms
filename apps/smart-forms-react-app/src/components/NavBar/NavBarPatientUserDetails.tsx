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
import { PatientData, UserData } from '../../interfaces/Interfaces';
import { NavBarPatientDetailsTypography, NavBarPatientUserDataBox } from './NavBar.styles';
import NavBarPatientDetails from './NavBarPatientDetails';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NavBarPatientUserPopper from './NavBarPatientUserPopper';

export interface Props {
  patientData: PatientData;
  userData: UserData;
}

function NavBarPatientUserDetails(props: Props) {
  const { patientData, userData } = props;

  return (
    <>
      <NavBarPatientUserDataBox gap={2}>
        <NavBarPatientDetails patientData={patientData} />

        <Stack direction="row" alignItems="center" spacing={1}>
          <MedicalServicesIcon fontSize="small" />
          <NavBarPatientDetailsTypography>
            {userData.name === '' ? 'No User' : userData.name}
          </NavBarPatientDetailsTypography>
        </Stack>
      </NavBarPatientUserDataBox>

      {patientData.name !== '' ? (
        <NavBarPatientUserPopper patientData={patientData} userData={userData} />
      ) : null}
    </>
  );
}

export default NavBarPatientUserDetails;
