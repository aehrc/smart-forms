import React from 'react';
import logo from '../../data/images/CSIRO_Logo.png';
import { Box, Grid } from '@mui/material';
import {
  OrganisationLogoBox,
  SideBarExpandButtonBox,
  SideBarIconButton
} from './SideBarBottom.styles';
import { KeyboardDoubleArrowLeft } from '@mui/icons-material';
import { SideBarContext } from '../../custom-contexts/SideBarContext';

function SideBarBottom() {
  const sideBar = React.useContext(SideBarContext);

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
            src={logo}
          />
        </OrganisationLogoBox>
      </Grid>

      <Grid item xs={4}>
        <SideBarExpandButtonBox>
          <SideBarIconButton
            size="small"
            onClick={() => sideBar.setIsExpanded(!sideBar.isExpanded)}>
            <KeyboardDoubleArrowLeft fontSize="small" />
          </SideBarIconButton>
        </SideBarExpandButtonBox>
      </Grid>
    </Grid>
  );
}

export default SideBarBottom;
