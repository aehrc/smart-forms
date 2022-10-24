import React from 'react';
import dayjs from 'dayjs';
import { AppBar, Box, Toolbar, Container } from '@mui/material';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import NavBarPatientData from './NavBarPatientData';
import { Patient, Practitioner } from 'fhir/r5';
import NavBarUserData from './NavBarUserData';
import { constructName } from '../../functions/LaunchContextFunctions';

interface Props {
  patient: Patient | null;
  user: Practitioner | null;
}

function NavBar(props: Props) {
  const { patient, user } = props;

  const patientData: PatientData = {
    name: '',
    gender: '',
    dateOfBirth: ''
  };

  const userData: UserData = {
    name: ''
  };

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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 0 }}>
              <NavBarPatientData patientData={patientData} />
            </Box>
            <Box sx={{ flexGrow: 1, mx: 4 }}></Box>
            <Box>
              <NavBarUserData userData={userData} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default React.memo(NavBar);
