import * as React from 'react';
import { MobileDrawer } from './Drawer.styles';
import { SideBarListBox } from '../SideBar/SideBar.styles';
import SideBarOperationList from '../SideBar/SideBarOperationList';
import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import OrganisationLogo from '../OrganisationLogo';

interface Props {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => unknown;
}

function Drawer(props: Props) {
  const { drawerWidth, mobileOpen, handleDrawerToggle } = props;

  return (
    <MobileDrawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      drawerWidth={drawerWidth}
      ModalProps={{
        keepMounted: true // Better open performance on mobile.
      }}>
      <SideBarListBox>
        <SideBarOperationList />
        <Box sx={{ flexGrow: 1 }}></Box>
        <Divider />
        <OrganisationLogo />
      </SideBarListBox>
    </MobileDrawer>
  );
}

export default Drawer;
