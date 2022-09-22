import React from 'react';
import dayjs from 'dayjs';
import { AppBar, Box, Toolbar, Typography, Container } from '@mui/material';
import { PatientData } from './Interfaces';
import NavBarPatientData from './NavBarPatientData';
import { Patient } from 'fhir/r5';

interface Props {
  patient: Patient | null;
}

function NavBar(props: Props) {
  const { patient } = props;

  const patientData: PatientData = {
    patientName: '',
    gender: '',
    dateOfBirth: ''
  };

  if (patient) {
    const dateOfBirthDayJs = dayjs(patient.birthDate);
    const age = dayjs().diff(dateOfBirthDayJs, 'year');

    patientData.patientName = `${patient.name?.[0].given?.[0]}`;
    patientData.gender = `${patient.gender}`;
    patientData.dateOfBirth = `${dateOfBirthDayJs.format('LL')} (${age} years)`;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6">Smart Health Checks</Typography>
            <Box sx={{ flexGrow: 1, mx: 4 }}></Box>
            <Box sx={{ flexGrow: 0 }}>
              <NavBarPatientData patientData={patientData} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default NavBar;
