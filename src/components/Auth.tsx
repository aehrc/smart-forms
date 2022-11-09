import React, { useEffect, useState } from 'react';
import { oauth2 } from 'fhirclient';
import { LaunchContext } from '../custom-contexts/LaunchContext';
import { getPatient, getUser } from '../functions/LaunchFunctions';
import ProgressSpinner from './ProgressSpinner';
import { isStillAuthenticating } from '../functions/LaunchContextFunctions';
import PageSwitcher from './PageSwitcher';
import QuestionnaireActiveContextProvider from '../custom-contexts/QuestionnaireActiveContext';
import PageSwitcherContextProvider from '../custom-contexts/PageSwitcherContext';
import { getQuestionnaireFromUrl } from '../functions/LoadServerResourceFunctions';
import { QuestionnaireProviderContext } from '../App';

function Auth() {
  const launchContext = React.useContext(LaunchContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);

  const [hasClient, setHasClient] = useState<boolean | null>(null);

  if (!questionnaireProvider.questionnaire.item) {
    const questionnaireUrl = sessionStorage.getItem('questionnaireUrl');
    if (questionnaireUrl) {
      getQuestionnaireFromUrl(questionnaireUrl).then((questionnaire) =>
        questionnaireProvider.setQuestionnaire(questionnaire)
      );
    }
  }

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        launchContext.setFhirClient(client);
        setHasClient(true);

        getPatient(client)
          .then((patient) => launchContext.setPatient(patient))
          .catch((error) => console.error(error));

        getUser(client)
          .then((user) => launchContext.setUser(user))
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        console.error(error);
        setHasClient(false);
      });
  }, []);

  if (isStillAuthenticating(hasClient, launchContext.patient, launchContext.user)) {
    return <ProgressSpinner message="Fetching patient" />;
  } else {
    return (
      <PageSwitcherContextProvider>
        <QuestionnaireActiveContextProvider>
          <PageSwitcher />
        </QuestionnaireActiveContextProvider>
      </PageSwitcherContextProvider>
    );
  }
}

export default Auth;
