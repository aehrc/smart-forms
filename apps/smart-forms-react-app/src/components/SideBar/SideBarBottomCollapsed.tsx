import React, { useContext } from 'react';
import { SideBarContext } from '../../custom-contexts/SideBarContext';
import { Box, Stack, Tooltip } from '@mui/material';
import logo from '../../data/images/CSIRO_Logo.png';
import { OrganisationLogoBox, SideBarIconButton } from './SideBarBottom.styles';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

function SideBarBottomCollapsed() {
  const sideBar = useContext(SideBarContext);

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
        <Tooltip title="Expand Sidebar" placement="right">
          <span>
            <SideBarIconButton onClick={() => sideBar.setIsExpanded(!sideBar.isExpanded)}>
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            </SideBarIconButton>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}

export default SideBarBottomCollapsed;
