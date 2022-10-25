import React from 'react';
import { Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import { PatientData } from '../../interfaces/Interfaces';
import NavBarGenderIcon from './NavBarGenderIcon';
import NavBarText from './NavBarText';

interface Props {
  patientData: PatientData;
}

function NavBarPatientData(props: Props) {
  const { patientData } = props;

  if (patientData.name === '') {
    return <NavBarText icon={<AccountCircleIcon />} text={'No Patient'} />;
  } else {
    return (
      <Stack direction="row" spacing={2}>
        <NavBarText icon={<AccountCircleIcon />} text={patientData.name} />
        <Stack direction="row" spacing={2}>
          <NavBarText
            icon={<NavBarGenderIcon gender={patientData.gender} />}
            text={patientData.gender}
          />
          <NavBarText icon={<EventIcon />} text={patientData.dateOfBirth} />
        </Stack>
      </Stack>
    );
  }
}

export default NavBarPatientData;
