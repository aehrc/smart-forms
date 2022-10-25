import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import React, { useEffect, useState } from 'react';
import { oauth2 } from 'fhirclient';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import { getPatient, getUser } from '../../functions/LaunchFunctions';
import ProgressSpinner from './ProgressSpinner';
import { isStillAuthenticating } from '../../functions/LaunchContextFunctions';
import PageSwitcher from '../PageSwitcher';
import QuestionnaireActiveContextProvider from '../../custom-contexts/QuestionnaireActiveContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QAuth(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const launchContext = React.useContext(LaunchContext);

  const [hasClient, setHasClient] = useState<boolean | null>(null);

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
      <QuestionnaireActiveContextProvider>
        <PageSwitcher
          questionnaireProvider={questionnaireProvider}
          questionnaireResponseProvider={questionnaireResponseProvider}
        />
      </QuestionnaireActiveContextProvider>
    );
  }
}

export default QAuth;
