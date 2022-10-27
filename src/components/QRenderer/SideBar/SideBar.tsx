import * as React from 'react';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';
import QDrawerOrganisationLogo from '../QDrawer/QDrawerOrganisationLogo';
import { SideBarCard, SideBarListBox } from './SideBar.styles';
import SideBarOperationList from './SideBarOperationList';

function SideBar() {
  return (
    <SideBarCard>
      <SideBarListBox>
        <SideBarOperationList />
        <Box sx={{ flexGrow: 1 }}></Box>
        <Divider />
        <QDrawerOrganisationLogo />
      </SideBarListBox>
    </SideBarCard>
  );
}

export default SideBar;
