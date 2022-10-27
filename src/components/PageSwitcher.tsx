import React, { useState } from 'react';
import NavBar from './NavBar/NavBar';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import QRenderer from './QRenderer/QRenderer';
import { Grid } from '@mui/material';
import SideBar from './QRenderer/SideBar/SideBar';

const drawerWidth = 320;

function PageSwitcher() {
  const pageSwitcherContext = React.useContext(PageSwitcherContext);

  const [firstLaunch, setFirstLaunch] = useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderPage = () => {
    switch (pageSwitcherContext.currentPage) {
      case PageType.FormPreview:
        return <div>Form Preview</div>;
      case PageType.ResponsePreview:
        return <div>Response Preview</div>;
      case PageType.Picker:
        return (
          <Picker firstLaunch={{ status: firstLaunch, invalidate: () => setFirstLaunch(false) }} />
        );
      default:
        return <QRenderer />;
    }
  };

  // TODO add drawer here when xs
  return (
    <>
      <NavBar handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Grid container spacing={2}>
        <Grid item xs={2} lg={2} xl={1.75}>
          <SideBar />
        </Grid>
        <Grid item xs={10} lg={10} xl={10.25}>
          {renderPage()}
        </Grid>
      </Grid>
    </>
  );
}

export default PageSwitcher;
