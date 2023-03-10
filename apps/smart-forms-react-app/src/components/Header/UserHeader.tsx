import { Avatar, Box, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { AccountDetailsTypography, AccountNameTypography } from '../Misc/Typography';
import { constructName } from '../../functions/LaunchContextFunctions';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

function UserHeader() {
  const theme = useTheme();
  const { user } = useContext(LaunchContext);

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar sx={{ bgcolor: theme.palette.error.main }}>
        <MedicalServicesIcon sx={{ color: theme.palette.common.white }} />
      </Avatar>
      <Box>
        <AccountNameTypography name={user ? constructName(user.name) : 'No User'} />
        {user && user.gender ? <AccountDetailsTypography details={`${user.gender}`} /> : null}
      </Box>
    </Box>
  );
}

export default UserHeader;
