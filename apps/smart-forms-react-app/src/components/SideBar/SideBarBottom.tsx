import React from 'react';
import logo from '../../data/images/CSIRO_Logo.png';
import { Box, Grid, Tooltip } from '@mui/material';
import {
  OrganisationLogoBox,
  SideBarExpandButtonBox,
  SideBarIconButton
} from './SideBarBottom.styles';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
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
              maxHeight: { xs: 35 },
              maxWidth: { xs: 35 }
            }}
            src={logo}
          />
        </OrganisationLogoBox>
      </Grid>

      <Grid item xs={4}>
        <SideBarExpandButtonBox>
          <Tooltip title="Collapse Sidebar" placement="right">
            <span>
              <SideBarIconButton onClick={() => sideBar.setIsExpanded(!sideBar.isExpanded)}>
                <KeyboardDoubleArrowLeftIcon fontSize="small" />
              </SideBarIconButton>
            </span>
          </Tooltip>
        </SideBarExpandButtonBox>
      </Grid>
    </Grid>
  );
}

export default SideBarBottom;
