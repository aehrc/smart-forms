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
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../lib';
import { populateQuestionnaire } from './populateUtilsForStorybook';
import { flushSync } from 'react-dom';

interface PrePopWrapperProps {
  questionnaire: Questionnaire;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

function PrePopWrapper(props: PrePopWrapperProps) {
  const { questionnaire, fhirClient, patient, user } = props;

  const [isPopulating, setIsPopulating] = useState(false);

  const updatePopulatedProperties = useQuestionnaireStore.use.updatePopulatedProperties();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsPopulated =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsPopulated();

  const isBuilding = useBuildFormForStorybook(questionnaire);

  const queryClient = useQueryClient();

  console.log(updatableResponse);

  function handlePrepopulate() {
    flushSync(() => {
      setIsPopulating(true);
    });

    populateQuestionnaire(questionnaire, patient, user, {
      clientEndpoint: fhirClient.state.serverUrl,
      authToken: null
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        setIsPopulating(false);
        return;
      }

      const { populated } = populateResult;
      const updatedResponse = updatePopulatedProperties(populated);
      // console.log(updatedResponse);
      setUpdatableResponseAsPopulated(updatedResponse);

      await new Promise((resolve) => setTimeout(resolve, 500));

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
          {isPopulating ? <div>Pre-populating...</div> : <BaseRenderer />}
          <>
            <button
              className="increase-button-hitbox"
              onClick={handlePrepopulate}
              disabled={isPopulating}>
              Pre-populate!
            </button>
            {isPopulating ? <span style={{ marginLeft: '1em' }}>Pre-populating...</span> : null}
          </>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default PrePopWrapper;
