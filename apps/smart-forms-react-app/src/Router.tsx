import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
// layouts
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Launch from './components/Launch/Launch';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LaunchContext } from './custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from './App';
import { oauth2 } from 'fhirclient';
import { getPatient, getUser } from './functions/LaunchFunctions';
import {
  assembleIfRequired,
  getInitialQuestionnaireFromBundle,
  getQuestionnaireFromUrl
} from './functions/LoadServerResourceFunctions';
import { isStillAuthenticating } from './functions/LaunchContextFunctions';
import ProgressSpinner from './components/Misc/ProgressSpinner';
import PageSwitcherContextProvider from './custom-contexts/PageSwitcherContext';
import QuestionnairesPage from './components/Dashboard/QuestionnairePage/QuestionnairesPage';
import ResponsesPage from './components/Dashboard/ResponsesPage/ResponsesPage';
import { SourceContextType } from './interfaces/ContextTypes';
import RendererLayout from './components/Renderer/RendererLayout';
import Form from './components/QRenderer/Form';
import FormPreview from './components/Preview/FormPreview';
import ViewerLayout from './components/Viewer/ViewerLayout';
import ResponsePreview from './components/Preview/ResponsePreview';
import { useSnackbar } from 'notistack';
import { postQuestionnaireToSMARTHealthIT } from './functions/SaveQrFunctions';

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

  const [source, setSource] = useState<'local' | 'remote'>(fhirClient ? 'remote' : 'local');

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        setFhirClient(client);
        setSource('remote');
        setHasClient(true);

        getPatient(client)
          .then((patient) => setPatient(patient))
          .catch((error) => {
            console.error(error);
            enqueueSnackbar('Fail to fetch patient. Try launching the app again', {
              variant: 'error'
            });
          });

        getUser(client)
          .then((user) => setUser(user))
          .catch((error) => {
            console.error(error);
            enqueueSnackbar('Fail to fetch user. Try launching the app again', {
              variant: 'error'
            });
          });

        const questionnaireUrl = sessionStorage.getItem('questionnaireUrl');
        if (questionnaireUrl) {
          getQuestionnaireFromUrl(questionnaireUrl)
            .then((bundle) => {
              const questionnaire = getInitialQuestionnaireFromBundle(bundle);

              // return early if no matching questionnaire
              if (!questionnaire) {
                setQuestionnaireIsLoading(false);
                sessionStorage.removeItem('questionnaireUrl');
                enqueueSnackbar(
                  'An error occurred while fetching initially specified questionnaire',
                  { variant: 'error' }
                );
                return;
              }

              // set questionnaire in provider context
              // perform assembly if required
              assembleIfRequired(questionnaire).then((questionnaire) => {
                if (questionnaire) {
                  // Post questionnaire to client if it is SMART Health IT
                  if (
                    fhirClient?.state.serverUrl === 'https://launch.smarthealthit.org/v/r4/fhir'
                  ) {
                    postQuestionnaireToSMARTHealthIT(fhirClient, questionnaire);
                  }

                  questionnaireProvider.setQuestionnaire(questionnaire);
                } else {
                  sessionStorage.removeItem('questionnaireUrl');
                  enqueueSnackbar(
                    'An error occurred while fetching initially specified questionnaire',
                    { variant: 'error' }
                  );
                }
                setQuestionnaireIsLoading(false);
              });
            })
            .catch(() => {
              enqueueSnackbar(
                'An error occurred while fetching initially specified questionnaire',
                { variant: 'error' }
              );
              setQuestionnaireIsLoading(false);
            });
        } else {
          setQuestionnaireIsLoading(false);
        }
      })
      .catch((error: Error) => {
        if (!error.message.includes("No 'state' parameter found")) {
          console.error(error);
          enqueueSnackbar('An error occurred while launching the app', { variant: 'error' });
        }
        setQuestionnaireIsLoading(false);
        setHasClient(false);
      });
  }, []); // only authenticate once, leave dependency array empty

  const router = createBrowserRouter([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/questionnaires" />, index: true },
        { path: 'questionnaires', element: <QuestionnairesPage /> },
        { path: 'responses', element: <ResponsesPage /> }
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
      path: '/viewer/',
      element: <ViewerLayout />,
      children: [{ path: '', element: <ResponsePreview /> }]
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

  if (isStillAuthenticating(hasClient, patient, user) || questionnaireIsLoading) {
    return <ProgressSpinner message={'Authorising user'} />;
  } else {
    return (
      <SourceContext.Provider value={{ source, setSource }}>
        <PageSwitcherContextProvider
          questionnairePresent={!!questionnaireProvider.questionnaire.item}>
          <RouterProvider router={router} />
        </PageSwitcherContextProvider>
      </SourceContext.Provider>
    );
  }
}
