import React from 'react';
import dayjs from 'dayjs';
import { AppBar, Box, Toolbar, Container } from '@mui/material';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import NavBarPatientData from './NavBarPatientData';
import { Patient, Practitioner } from 'fhir/r5';
import NavBarUserData from './NavBarUserData';

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

    // dealing with name variations between different implementations
    if (patient.name?.[0]['text']) {
      patientData.name = `${patient.name?.[0].text}`;
    } else {
      const prefix = `${patient.name?.[0].prefix?.[0]}`;
      const givenName = `${patient.name?.[0].given?.[0]}`;
      const familyName = `${patient.name?.[0].family}`;

      patientData.name = `${prefix} ${givenName} ${familyName}`;
    }

    patientData.gender = `${patient.gender}`;
    patientData.dateOfBirth = `${dateOfBirthDayJs.format('LL')} (${age} years)`;
  }

  if (user) {
    // dealing with name variations between different implementations
    if (user.name?.[0]['text']) {
      userData.name = `${user.name?.[0].text}`;
    } else {
      const prefix = `${user.name?.[0].prefix?.[0]}`;
      const givenName = `${user.name?.[0].given?.[0]}`;
      const familyName = `${user.name?.[0].family}`;

      userData.name = `${prefix} ${givenName} ${familyName}`;
    }
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

export default NavBar;
