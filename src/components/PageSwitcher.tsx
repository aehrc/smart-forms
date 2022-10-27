import React, { useEffect, useState } from 'react';
import NavBar from './NavBar/NavBar';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import Renderer from './QRenderer/Renderer';
import { Grid } from '@mui/material';
import SideBar from './QRenderer/SideBar/SideBar';
import { QuestionnaireProviderContext } from '../App';

const drawerWidth = 320;

function PageSwitcher() {
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);

  const [firstLaunch, setFirstLaunch] = useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useEffect(() => {
    if (!questionnaireProvider.questionnaire.item) {
      pageSwitcher.goToPage(PageType.Picker);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderPage = () => {
    switch (pageSwitcher.currentPage) {
      case PageType.FormPreview:
        return <div>Form Preview</div>;
      case PageType.ResponsePreview:
        return <div>Response Preview</div>;
      case PageType.Picker:
        return (
          <Picker firstLaunch={{ status: firstLaunch, invalidate: () => setFirstLaunch(false) }} />
        );
      default:
        return <Renderer />;
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
