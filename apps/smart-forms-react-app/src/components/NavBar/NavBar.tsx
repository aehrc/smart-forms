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
  const launchContext = useContext(LaunchContext);

  const patient = launchContext.patient;
  const user = launchContext.user;

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
