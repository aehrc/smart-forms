import React from 'react';
import { Stack, Typography } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { UserData } from './Interfaces';

interface Props {
  userData: UserData;
}

function NavBarUserData(props: Props) {
  const { userData } = props;

  if (userData.name === '') {
    return (
      <Stack direction={'row'} spacing={1}>
        <MedicalServicesIcon />
        <Typography>No User</Typography>
      </Stack>
    );
  } else {
    return (
      <Stack direction={'row'} spacing={4}>
        <Stack direction={'row'} spacing={1}>
          <MedicalServicesIcon />
          <Typography>{userData.name}</Typography>
        </Stack>
      </Stack>
    );
  }
}

export default NavBarUserData;
