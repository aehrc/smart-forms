import React from 'react';
import { Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import { PatientData } from '../../interfaces/Interfaces';
import NavBarGenderIcon from './NavBarGenderIcon';
import { NavBarIconTypography } from './NavBar.styles';

interface Props {
  patientData: PatientData;
}

function NavBarPatientDetails(props: Props) {
  const { patientData } = props;

  if (patientData.name === '') {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <AccountCircleIcon />
        <NavBarIconTypography>No Patient</NavBarIconTypography>
      </Stack>
    );
  } else {
    return (
      <Stack direction="row" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountCircleIcon />
          <NavBarIconTypography>{patientData.name}</NavBarIconTypography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NavBarGenderIcon gender={patientData.gender} />
            <NavBarIconTypography>{patientData.gender}</NavBarIconTypography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon />
            <NavBarIconTypography>{patientData.dateOfBirth}</NavBarIconTypography>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

export default NavBarPatientDetails;
