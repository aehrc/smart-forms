import React, { useState } from 'react';
import NavBar from './NavBar/NavBar';
import QRenderer from './QRenderer/QRenderer';
import QuestionnairePicker from './QuestionnairePicker/QuestionnairePicker';
import { QuestionnaireActiveContext } from '../custom-contexts/QuestionnaireActiveContext';
import PreviewModeContextProvider from '../custom-contexts/PreviewModeContext';

function PageSwitcher() {
  const questionnaireActiveContext = React.useContext(QuestionnaireActiveContext);

  const [firstLaunch, setFirstLaunch] = useState(true);

  const renderComponent = questionnaireActiveContext.questionnaireActive ? (
    <QRenderer />
  ) : (
    <QuestionnairePicker
      firstLaunch={{ status: firstLaunch, invalidate: () => setFirstLaunch(false) }}
    />
  );

  return (
    <PreviewModeContextProvider>
      <NavBar />
      {renderComponent}
    </PreviewModeContextProvider>
  );
}

export default PageSwitcher;
