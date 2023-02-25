import { Box } from '@mui/material';
import React, { useContext } from 'react';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { AccountDetailsTypography, AccountNameTypographyNoWrap } from '../Misc/Typography';
import { constructName } from '../../functions/LaunchContextFunctions';

function UserPopoverMenu() {
  const { user } = useContext(LaunchContext);

  return (
    <Box sx={{ my: 1.5, px: 2.5 }}>
      <AccountNameTypographyNoWrap name={user ? constructName(user.name) : 'No User'} />
      {user ? <AccountDetailsTypography details={user ? `${user.gender}` : ''} /> : null}
    </Box>
  );
}

export default UserPopoverMenu;
