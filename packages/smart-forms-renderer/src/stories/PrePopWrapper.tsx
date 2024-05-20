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

// @ts-ignore
import React, { useState } from 'react';
import type { Patient, Practitioner, Questionnaire } from 'fhir/r4';
import { BaseRenderer } from '../components';
import { QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from '../theme/Theme';
import useQueryClient from '../hooks/useQueryClient';
import type Client from 'fhirclient/lib/Client';
import useBuildFormForStorybook from './useBuildFormForStorybook';
import { buildForm } from '../utils';
import PrePopButtonForStorybook from './PrePopButtonForStorybook';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from './populateCallbackForStorybook';

interface PrePopWrapperProps {
  questionnaire: Questionnaire;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

function PrePopWrapper(props: PrePopWrapperProps) {
  const { questionnaire, fhirClient, patient, user } = props;

  const [isPopulating, setIsPopulating] = useState(false);

  const isBuilding = useBuildFormForStorybook(questionnaire);

  const queryClient = useQueryClient();

  function handlePrepopulate() {
    setIsPopulating(true);

    populateQuestionnaire({
      questionnaire: questionnaire,
      fetchResourceCallback: fetchResourceCallback,
      requestConfig: {
        clientEndpoint: fhirClient.state.serverUrl,
        authToken: null
      },
      patient: patient,
      user: user
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        setIsPopulating(false);
        return;
      }

      const { populatedResponse } = populateResult;

      // buildForm is used here because there is a really bizarre bug - using the store hooks directly doesn't update the baseRenderer
      // could be the fact that it doesn't play well with storybook
      await buildForm(questionnaire, populatedResponse);

      setIsPopulating(false);
    });
  }

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          <PrePopButtonForStorybook isPopulating={isPopulating} onPopulate={handlePrepopulate} />
          {isPopulating ? null : <BaseRenderer />}
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default PrePopWrapper;
