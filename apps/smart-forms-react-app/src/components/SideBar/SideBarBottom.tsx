import React from 'react';
import CSIROLogo from '../../data/images/CSIRO_Logo.png';
import { Box, Grid, IconButton } from '@mui/material';
import { ListExpandButtonBox, OrganisationLogoBox } from './SideBarBottom.styles';
import { KeyboardDoubleArrowLeft } from '@mui/icons-material';

function SideBarBottom() {
  return (
    <Grid container alignItems="center">
      <Grid item xs={4}></Grid>
      <Grid item xs={4}>
        <OrganisationLogoBox>
          <Box
            component="img"
            sx={{
              maxHeight: { xs: 40 },
              maxWidth: { xs: 40 }
            }}
            src={CSIROLogo}
          />
        </OrganisationLogoBox>
      </Grid>

      <Grid item xs={4}>
        <ListExpandButtonBox>
          <IconButton size="small" onClick={() => console.log()}>
            <KeyboardDoubleArrowLeft fontSize="small" />
          </IconButton>
        </ListExpandButtonBox>
      </Grid>
    </Grid>
  );
}

export default SideBarBottom;
