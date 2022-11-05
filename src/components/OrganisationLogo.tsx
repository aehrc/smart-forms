import CSIROLogo from '../data/images/CSIRO_Logo.png';
import React from 'react';
import { Box } from '@mui/material';
import { OrganisationLogoBox } from './StyledComponents/Logos.styles';

function OrganisationLogo() {
  return (
    <OrganisationLogoBox>
      <Box
        component="img"
        sx={{
          maxHeight: { xs: 50, md: 50 },
          maxWidth: { xs: 50, md: 50 }
        }}
        src={CSIROLogo}
      />
    </OrganisationLogoBox>
  );
}

export default OrganisationLogo;
