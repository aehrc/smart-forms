import * as React from 'react';
import QDrawerList from './QDrawerList';
import { Questionnaire } from 'fhir/r5';
import { DesktopDrawer, DrawerContainerBox, MobileDrawer } from './QDrawer.styles';

interface Props {
  questionnaire: Questionnaire;
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => unknown;
}
function QDrawer(props: Props) {
  const { questionnaire, drawerWidth, mobileOpen, handleDrawerToggle } = props;

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
        <QDrawerList questionnaire={questionnaire} />
      </MobileDrawer>

      {/*  desktop */}
      <DesktopDrawer variant="permanent" open drawerWidth={drawerWidth}>
        <QDrawerList questionnaire={questionnaire} />
      </DesktopDrawer>
    </DrawerContainerBox>
  );
}

export default QDrawer;
