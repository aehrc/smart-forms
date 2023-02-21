import { Box, Typography } from '@mui/material';
import { StyledAccount } from '../../layouts/dashboard/nav/Nav.styles';
import FaceIcon from '@mui/icons-material/Face';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import React, { useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { constructName } from '../../functions/LaunchContextFunctions';
import dayjs from 'dayjs';

function NavAccounts() {
  const { patient, user } = useContext(LaunchContext);

  const theme = useTheme();

  return (
    <Box sx={{ my: 4, mx: 2.5 }}>
      <StyledAccount sx={{ backgroundColor: theme.palette.accent1.main }}>
        <FaceIcon fontSize="large" />

        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            {patient ? constructName(patient.name) : 'No Patient'}
          </Typography>
          {patient ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {patient ? `${patient.gender}` : ''}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {patient ? dayjs(patient.birthDate).format('LL') : ''}
              </Typography>
            </>
          ) : null}
        </Box>
      </StyledAccount>

      <StyledAccount sx={{ backgroundColor: theme.palette.accent2.main }}>
        <MedicalServicesIcon fontSize="large" />

        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            {user ? constructName(user.name) : 'No User'}
          </Typography>
        </Box>
      </StyledAccount>
    </Box>
  );
}

export default NavAccounts;
