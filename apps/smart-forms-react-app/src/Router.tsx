import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard/DashboardLayout';
import Launch from './components/LaunchPage/Launch';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LaunchContext } from './custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from './App';
import { AuthFailDialog } from './interfaces/Interfaces';
import { oauth2 } from 'fhirclient';
import { getPatient, getUser } from './functions/LaunchFunctions';
import {
  getInitialQuestionnaireFromResponse,
  getQuestionnaireFromUrl
} from './functions/LoadServerResourceFunctions';
import { isStillAuthenticating } from './functions/LaunchContextFunctions';
import NoQuestionnaireDialog from './components/Dialogs/AuthorisationFailedDialog';
import ProgressSpinner from './components/ProgressSpinner';
import PageSwitcherContextProvider from './custom-contexts/PageSwitcherContext';
import QuestionnairePage from './pages/QuestionnairePage';
import ResponsePage from './pages/ResponsePage';
import { SourceContextType } from './interfaces/ContextTypes';
import RendererLayout from './layouts/renderer/RendererLayout';
import Form from './components/QRenderer/Form';
import FormPreview from './components/Preview/FormPreview';

export const SourceContext = createContext<SourceContextType>({
  source: 'local',
  setSource: () => void 0
});

export default function Router() {
  const { fhirClient, patient, user, setFhirClient, setPatient, setUser } =
    useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const [hasClient, setHasClient] = useState<boolean | null>(null);
  const [questionnaireIsLoading, setQuestionnaireIsLoading] = useState<boolean>(true);
  const [authFailDialog, setAuthFailDialog] = useState<AuthFailDialog>({
    dialogOpen: null,
    errorMessage: ''
  });

  const [source, setSource] = useState<'local' | 'remote'>(fhirClient ? 'remote' : 'local');

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        setFhirClient(client);
        setSource('remote');
        setHasClient(true);

        getPatient(client)
          .then((patient) => setPatient(patient))
          .catch((error) => console.error(error));

        getUser(client)
          .then((user) => setUser(user))
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
        // Display auth fail dialog only when app is launched but fail to authorise
        const errorString: string = error.toString();
        if (!errorString.includes("No 'state' parameter found")) {
          setAuthFailDialog({
            dialogOpen: true,
            errorMessage: error.toString()
          });
        }
        console.error(error);

        setQuestionnaireIsLoading(false);
        setHasClient(false);
      });
  }, []); // only authenticate once, leave dependency array empty

  const routes = useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/questionnaires" />, index: true },
        { path: 'questionnaires', element: <QuestionnairePage /> },
        { path: 'responses', element: <ResponsePage /> }
      ]
    },
    {
      path: '/renderer/',
      element: <RendererLayout />,
      children: [
        { path: '', element: <Form /> },
        { path: 'preview', element: <FormPreview /> }
      ]
    },
    {
      path: '/launch',
      element: <Launch />
    },
    {
      path: '*',
      element: <Navigate to="/questionnaires" replace />
    }
  ]);

  if (
    isStillAuthenticating(hasClient, patient, user) ||
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
        <ProgressSpinner message="Authorising launch" />
      </>
    );
  } else {
    return (
      <SourceContext.Provider value={{ source, setSource }}>
        <PageSwitcherContextProvider
          questionnairePresent={!!questionnaireProvider.questionnaire.item}>
          {routes}
        </PageSwitcherContextProvider>
      </SourceContext.Provider>
    );
  }
}
