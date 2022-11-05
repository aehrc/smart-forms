import React, { useEffect, useState } from 'react';
import NavBar from './NavBar/NavBar';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import Renderer from './QRenderer/Renderer';
import { Grid } from '@mui/material';
import SideBar from './SideBar/SideBar';
import { QuestionnaireProviderContext } from '../App';
import { MainGrid, SideBarGrid } from './StyledComponents/Grids.styles';
import Drawer from './Drawer/Drawer';

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

  function RenderPage() {
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
  }

  // TODO add drawer here when xs
  return (
    <>
      <NavBar handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Drawer
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}></Drawer>
      <Grid container>
        <SideBarGrid item md={2.25} lg={1.75} xl={1.75}>
          <SideBar />
        </SideBarGrid>
        <MainGrid item xs={12} md={9.75} lg={10.25} xl={10.25}>
          <RenderPage />
        </MainGrid>
      </Grid>
    </>
  );
}

export default PageSwitcher;
