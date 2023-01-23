import React, { useEffect, useState } from 'react';
import { oauth2 } from 'fhirclient';
import { LaunchContext } from '../custom-contexts/LaunchContext';
import { getPatient, getUser } from '../functions/LaunchFunctions';
import { isStillAuthenticating } from '../functions/LaunchContextFunctions';
import PageSwitcher from './PageSwitcher';
import PageSwitcherContextProvider from '../custom-contexts/PageSwitcherContext';
import {
  getInitialQuestionnaireFromResponse,
  getQuestionnaireFromUrl
} from '../functions/LoadServerResourceFunctions';
import { QuestionnaireProviderContext } from '../App';
import NoQuestionnaireDialog from './Dialogs/AuthorisationFailedDialog';
import ProgressSpinner from './ProgressSpinner';
import { AuthFailDialog } from '../interfaces/Interfaces';

function Auth() {
  const launchContext = React.useContext(LaunchContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);

  const [hasClient, setHasClient] = useState<boolean | null>(null);
  const [questionnaireIsLoading, setQuestionnaireIsLoading] = useState<boolean>(true);
  const [authFailDialog, setAuthFailDialog] = useState<AuthFailDialog>({
    dialogOpen: null,
    errorMessage: ''
  });

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

        const questionnaireUrl = sessionStorage.getItem('questionnaireUrl');
        if (questionnaireUrl) {
          getQuestionnaireFromUrl(client, questionnaireUrl)
            .then((response) => {
              const questionnaire = getInitialQuestionnaireFromResponse(response);
              if (questionnaire) {
                questionnaireProvider.setQuestionnaire(questionnaire, false, client);
              }
              setQuestionnaireIsLoading(false);
            })
            .catch(() => setQuestionnaireIsLoading(false));
        } else {
          setQuestionnaireIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setAuthFailDialog({ dialogOpen: true, errorMessage: error.toString() });
        setQuestionnaireIsLoading(false);
        setHasClient(false);
      });
  }, []);

  if (
    isStillAuthenticating(hasClient, launchContext.patient, launchContext.user) ||
    questionnaireIsLoading ||
    authFailDialog.dialogOpen
  ) {
    return (
      <>
        <NoQuestionnaireDialog
          dialogOpen={authFailDialog.dialogOpen}
          closeDialog={() => setAuthFailDialog({ ...authFailDialog, dialogOpen: false })}
          errorMessage={authFailDialog.errorMessage}
        />
        <ProgressSpinner message="Fetching patient" />
      </>
    );
  } else {
    return (
      <PageSwitcherContextProvider>
        <PageSwitcher />
      </PageSwitcherContextProvider>
    );
  }
}

export default Auth;
