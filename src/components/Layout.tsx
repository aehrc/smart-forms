import { QuestionnaireProvider } from '../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../classes/QuestionnaireResponseProvider';
import React, { useState } from 'react';
import NavBar from './NavBar/NavBar';
import QRenderer from './QRenderer/QRenderer';
import QuestionnairePicker from './QuestionnairePicker/QuestionnairePicker';
import { LaunchContext } from '../custom-contexts/LaunchContext';
import { QuestionnaireActiveContext } from '../custom-contexts/QuestionnaireActiveContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function Layout(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const questionnaireActiveContext = React.useContext(QuestionnaireActiveContext);
  const launchContext = React.useContext(LaunchContext);

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
    <>
      <NavBar questionnaire={questionnaireProvider.questionnaire} launchContext={launchContext} />
      {renderComponent}
    </>
  );
}

export default Layout;
