import React from 'react';
import { SideBarContext } from '../../custom-contexts/SideBarContext';
import { Box, Stack } from '@mui/material';
import logo from '../../data/images/CSIRO_Logo.png';
import { OrganisationLogoBox, SideBarIconButton } from './SideBarBottom.styles';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';

function SideBarBottomCollapsed() {
  const sideBar = React.useContext(SideBarContext);

  return (
    <Stack display="flex" flexDirection="column" alignItems="center" sx={{ m: 1 }}>
      <OrganisationLogoBox>
        <Box
          component="img"
          sx={{
            maxHeight: { xs: 30 },
            maxWidth: { xs: 30 }
          }}
          src={logo}
        />
      </OrganisationLogoBox>

      <Box>
        <SideBarIconButton onClick={() => sideBar.setIsExpanded(!sideBar.isExpanded)}>
          <KeyboardDoubleArrowRight fontSize="small" />
        </SideBarIconButton>
      </Box>
    </Stack>
  );
}

export default SideBarBottomCollapsed;
