import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { AppBar, Box, Toolbar, Typography, Container, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import { PatientContext } from '../App';
import NavBarGenderIcon from './NavBarGenderIcon';

function NavBar() {
  let patientName = 'Patient Name';
  let gender = 'Gender';
  let dateOfBirth = 'Date of Birth';

  const patient = useContext(PatientContext);
  if (patient) {
    const dateOfBirthDayJs = dayjs(patient.birthDate);
    const age = dayjs().diff(dateOfBirthDayJs, 'year');

    patientName = `${patient.name?.[0].given?.[0]}`;
    gender = `${patient.gender}`;
    dateOfBirth = `${dateOfBirthDayJs.format('LL')} (${age} years)`;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6">Smart Health Checks</Typography>
            <Box sx={{ flexGrow: 1, mx: 4 }}></Box>
            <Box sx={{ flexGrow: 0 }}>
              <Stack direction={'row'} spacing={4}>
                <Stack direction={'row'} spacing={1}>
                  <AccountCircleIcon />
                  <Typography>{patientName}</Typography>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                  <NavBarGenderIcon gender={gender} />
                  <Typography sx={{ textTransform: 'capitalize' }}>{gender}</Typography>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                  <EventIcon />
                  <Typography>{dateOfBirth}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default NavBar;
