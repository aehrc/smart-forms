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
        <AccountCircleIcon />
        <NavBarPatientDetailsTypography>No Patient</NavBarPatientDetailsTypography>
      </Stack>
    );
  } else {
    return (
      <Stack direction="row" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountCircleIcon />
          <NavBarPatientDetailsTypography>{patientData.name}</NavBarPatientDetailsTypography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NavBarGenderIcon gender={patientData.gender} />
            <NavBarPatientDetailsTypography>{patientData.gender}</NavBarPatientDetailsTypography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon />
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
