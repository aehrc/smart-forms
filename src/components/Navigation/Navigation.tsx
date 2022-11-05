import React from 'react';
import NavBar from '../NavBar/NavBar';
import Drawer from '../Drawer/Drawer';

const drawerWidth = 320;

function Navigation() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <NavBar handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Drawer
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}></Drawer>
    </>
  );
}

export default Navigation;
