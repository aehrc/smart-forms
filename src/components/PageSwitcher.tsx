import React, { useState } from 'react';
import NavBar from './NavBar/NavBar';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import QuestionnairePicker from './QuestionnairePicker/QuestionnairePicker';
import QRenderer from './QRenderer/QRenderer';
import { Grid } from '@mui/material';
import QDrawerList from './QRenderer/QDrawer/QDrawerList';

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
      case PageType.Preview:
        return <div>Preview</div>;
      case PageType.Picker:
        return (
          <QuestionnairePicker
            firstLaunch={{ status: firstLaunch, invalidate: () => setFirstLaunch(false) }}
          />
        );
      default:
        return <QRenderer />;
    }
  };

  return (
    <>
      <NavBar handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Grid container spacing={2}>
        <Grid item xs={1.75}>
          <QDrawerList />
        </Grid>
        <Grid item xs={10.25}>
          {renderPage()}
        </Grid>
      </Grid>
    </>
  );
}

export default PageSwitcher;
