import React, { useEffect } from 'react';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import Renderer from './QRenderer/Renderer';
import { QuestionnaireProviderContext } from '../App';
import NavBar from './NavBar/NavBar';
import ResponsePreview from './Preview/ResponsePreview';
import SideBarContextProvider from '../custom-contexts/SideBarContext';

function PageSwitcher() {
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);

  useEffect(() => {
    if (!questionnaireProvider.questionnaire.item) {
      pageSwitcher.goToPage(PageType.Picker);
    }
  }, []);

  function RenderPage() {
    switch (pageSwitcher.currentPage) {
      case PageType.ResponsePreview:
        return <ResponsePreview />;
      case PageType.Picker:
        return <Picker />;
      default:
        return <Renderer />;
    }
  }

  return (
    <>
      <NavBar />
      <SideBarContextProvider>
        <RenderPage />
      </SideBarContextProvider>
    </>
  );
}

export default PageSwitcher;
