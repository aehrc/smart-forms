/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import React, { useLayoutEffect, useState } from 'react';
import type { Questionnaire } from 'fhir/r4';
import { BaseRenderer } from '../components';
import { QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from '../theme/Theme';
import useQueryClient from '../hooks/useQueryClient';
import { buildForm } from '../utils';
import useSmartClient from './useSmartClientForStorybook';
import { useQuestionnaireResponseStore } from '../stores';
import SmartClientContextProvider from './SmartClientContextForStorybook';
import useAuthorisationForStorybook from './useAuthorisationForStorybook';
import useLaunchForStorybook from './useLaunchForStorybook';

interface PrePopWrapperProps {
  questionnaire: Questionnaire;
  formsServerUrl: string;
  iss: string;
  clientId: string;
  scope: string;
  patientId: string;
  userId: string;
  encounterId?: string;
  questionnaireCanonical?: string;
}

function PrePopWrapper(props: PrePopWrapperProps) {
  const {
    questionnaire,
    formsServerUrl,
    iss,
    clientId,
    scope,
    patientId,
    userId,
    encounterId,
    questionnaireCanonical
  } = props;

  const { smartClient, patient, user } = useSmartClient();

  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const [isBuildingForm, setIsBuildingForm] = useState(true);

  // Init population spinner
  let initialSpinner = { isSpinning: false, message: '' };
  if (smartClient && patient && user && !sourceResponse.id) {
    initialSpinner = {
      // isSpinning: true,
      isSpinning: false,
      message: 'Populating form'
    };
  }
  const [spinner, setSpinner] = useState(initialSpinner);

  // 1. Perform launch
  const launchState = useLaunchForStorybook(
    iss,
    clientId,
    scope,
    patientId,
    userId,
    encounterId,
    questionnaireCanonical
  );

  // 2. Authorise with fhirClient

  const isAuthorising = useAuthorisationForStorybook(launchState, formsServerUrl);

  // 3. Build Form
  useLayoutEffect(() => {
    buildForm(questionnaire).then(() => {
      setIsBuildingForm(false);
    });
  }, [questionnaire]);

  // 4. Pre-populate
  // usePopulate(spinner, () => setSpinner({ isSpinning: false, status: null, message: '' }));

  const queryClient = useQueryClient();

  if (launchState === 'loading') {
    return <div>Launching...</div>;
  }

  if (launchState === 'error') {
    return <div>There is a SMART App Launch error.</div>;
  }

  if (isAuthorising) {
    return <div>Authorising...</div>;
  }

  if (isBuildingForm) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>{patient?.id ?? ''}</div>
      <div>{user?.id ?? ''}</div>
    </>
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SmartClientContextProvider>
          {spinner.isSpinning ? <div>{spinner.message}</div> : <BaseRenderer />}
        </SmartClientContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default PrePopWrapper;
