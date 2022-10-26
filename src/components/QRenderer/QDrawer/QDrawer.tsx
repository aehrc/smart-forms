import * as React from 'react';
import QDrawerList from './QDrawerList';
import { DesktopDrawer, DrawerContainerBox, MobileDrawer } from './QDrawer.styles';

interface Props {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => unknown;
}

function QDrawer(props: Props) {
  const { drawerWidth, mobileOpen, handleDrawerToggle } = props;

  return (
    <DrawerContainerBox drawerWidth={drawerWidth}>
      {/*  mobile */}
      <MobileDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        drawerWidth={drawerWidth}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}>
        <QDrawerList />
      </MobileDrawer>

      {/*  desktop */}
      <DesktopDrawer variant="permanent" open drawerWidth={drawerWidth}>
        <QDrawerList />
      </DesktopDrawer>
    </DrawerContainerBox>
  );
}

export default QDrawer;
