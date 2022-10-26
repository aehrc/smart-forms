import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../NavBar/NavBar';
import QDrawer from './QDrawer/QDrawer';
import QForm from './QForm';
import { FormContainerBox } from './QLayout.styles';

const drawerWidth = 320;

function QLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box display="flex">
      <NavBar handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <QDrawer
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <FormContainerBox>
        <QForm />
      </FormContainerBox>
    </Box>
  );
}

export default QLayout;
