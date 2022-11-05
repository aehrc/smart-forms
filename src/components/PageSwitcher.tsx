import React, { useEffect, useState } from 'react';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import Renderer from './QRenderer/Renderer';
import { Grid } from '@mui/material';
import SideBar from './SideBar/SideBar';
import { QuestionnaireProviderContext } from '../App';
import { MainGrid, SideBarGrid } from './StyledComponents/Grids.styles';
import Navigation from './Navigation/Navigation';

function PageSwitcher() {
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);

  const [firstLaunch, setFirstLaunch] = useState(true);

  useEffect(() => {
    if (!questionnaireProvider.questionnaire.item) {
      pageSwitcher.goToPage(PageType.Picker);
    }
  }, []);

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

  return (
    <>
      <Navigation />
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
