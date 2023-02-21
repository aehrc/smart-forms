/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useState } from 'react';
import { oauth2 } from 'fhirclient';
import { LaunchContext } from '../custom-contexts/LaunchContext';
import { getPatient, getUser } from '../functions/LaunchFunctions';
import { isStillAuthenticating } from '../functions/LaunchContextFunctions';
import PageSwitcherContextProvider from '../custom-contexts/PageSwitcherContext';
import {
  getInitialQuestionnaireFromResponse,
  getQuestionnaireFromUrl
} from '../functions/LoadServerResourceFunctions';
import { QuestionnaireProviderContext } from '../App';
import NoQuestionnaireDialog from './Dialogs/AuthorisationFailedDialog';
import ProgressSpinner from './ProgressSpinner';
import { AuthFailDialog } from '../interfaces/Interfaces';
import DashboardLayout from '../layouts/dashboard/DashboardLayout';

function Auth() {
  const { patient, user, setFhirClient, setPatient, setUser } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

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
        setFhirClient(client);
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
  }, []);

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
        <ProgressSpinner message="Fetching patient" />
      </>
    );
  } else {
    return (
      <PageSwitcherContextProvider
        questionnairePresent={!!questionnaireProvider.questionnaire.item}>
        <DashboardLayout />
      </PageSwitcherContextProvider>
    );
  }
}

export default Auth;
