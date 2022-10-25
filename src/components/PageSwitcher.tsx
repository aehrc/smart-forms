import { QuestionnaireProvider } from '../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../classes/QuestionnaireResponseProvider';
import React, { useState } from 'react';
import NavBar from './NavBar/NavBar';
import QRenderer from './QRenderer/QRenderer';
import QuestionnairePicker from './QuestionnairePicker/QuestionnairePicker';
import { QuestionnaireActiveContext } from '../custom-contexts/QuestionnaireActiveContext';
import PreviewModeContextProvider from '../custom-contexts/PreviewModeContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function PageSwitcher(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const questionnaireActiveContext = React.useContext(QuestionnaireActiveContext);

  const [firstLaunch, setFirstLaunch] = useState(true);

  const renderComponent = questionnaireActiveContext.questionnaireActive ? (
    <QRenderer
      questionnaireProvider={questionnaireProvider}
      questionnaireResponseProvider={questionnaireResponseProvider}
    />
  ) : (
    <QuestionnairePicker
      questionnaireProvider={questionnaireProvider}
      questionnaireResponseProvider={questionnaireResponseProvider}
      firstLaunch={{ status: firstLaunch, invalidate: () => setFirstLaunch(false) }}
    />
  );

  return (
    <PreviewModeContextProvider>
      <NavBar
        questionnaire={questionnaireProvider.questionnaire}
        handleDrawerToggle={() => console.log('hello')}
      />
      {renderComponent}
    </PreviewModeContextProvider>
  );
}

export default PageSwitcher;
