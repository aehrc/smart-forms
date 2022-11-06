import React, { useEffect, useState } from 'react';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import Renderer from './QRenderer/Renderer';
import { QuestionnaireProviderContext } from '../App';
import NavBar from './NavBar/NavBar';
import ResponsePreview from './Preview/ResponsePreview';

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
      case PageType.ResponsePreview:
        return <ResponsePreview />;
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
      <NavBar />
      <RenderPage />
    </>
  );
}

export default PageSwitcher;
