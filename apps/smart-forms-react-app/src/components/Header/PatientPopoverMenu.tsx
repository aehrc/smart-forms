import { Box } from '@mui/material';
import React, { useContext } from 'react';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import {
  AccountDetailsTypography,
  AccountDetailsTypographyNoCaps,
  AccountNameTypographyNoWrap
} from '../Misc/Typography';
import { constructName } from '../../functions/LaunchContextFunctions';
import dayjs from 'dayjs';

function PatientPopoverMenu() {
  const { patient } = useContext(LaunchContext);

  return (
    <Box sx={{ my: 1.5, px: 2.5 }}>
      <AccountNameTypographyNoWrap name={patient ? constructName(patient.name) : 'No Patient'} />
      <AccountDetailsTypography details={patient ? `${patient.gender}` : ''} />
      <AccountDetailsTypographyNoCaps
        details={
          patient ? `${dayjs().diff(dayjs(patient.birthDate), 'year').toString()} years` : ''
        }
      />
      <AccountDetailsTypography details={patient ? dayjs(patient.birthDate).format('LL') : ''} />
    </Box>
  );
}

export default PatientPopoverMenu;
