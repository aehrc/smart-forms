import CSIROLogo from '../../../data/images/CSIRO_Logo.png';
import React from 'react';
import { Box } from '@mui/material';
import { DrawerOrganisationLogoBox } from './QDrawerOrganisationLogo.styles';

function QDrawerOrganisationLogo() {
  return (
    <DrawerOrganisationLogoBox>
      <Box
        component="img"
        sx={{
          maxHeight: { xs: 50, md: 50 },
          maxWidth: { xs: 50, md: 50 }
        }}
        src={CSIROLogo}
      />
    </DrawerOrganisationLogoBox>
  );
}

export default QDrawerOrganisationLogo;
