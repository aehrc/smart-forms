/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import { BaseRenderer } from '../../components';
import { QueryClientProvider } from '@tanstack/react-query';
import { RendererThemeProvider } from '../../theme';
import { useBuildForm, useRendererQueryClient } from '../../hooks';
import type Client from 'fhirclient/lib/Client';
import PrePopButtonForStorybook from './PrePopButtonForStorybook';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { buildForm } from '../../utils';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';
import { fetchResourceCallback } from '../../api/callback';
import ActionBarForStorybook from './ActionBarForStorybook';
import CopyButtonsForStorybook from './CopyButtonsForStorybook';

interface PrePopWrapperForStorybookProps {
  questionnaire: Questionnaire;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

/**
 * This is a demo wrapper which initialises the BaseRenderer with the passed in questionnaire using useBuildForm.
 * It also provides a button to pre-populate the questionnaire on the fly using populateQuestionnaire() from '@aehrc/sdc-populate'.
 * This does in-app population and you have to define your own callback function to retrieve resources from your source server.
 *
 * Use this pattern if you do not have a pre-populated/pre-filled/draft response and want to pre-populate on the fly.
 * If you already have a questionnaireResponse, see https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/BuildFormButtonTesterWrapperForStorybook.tsx instead
 *
 * @author Sean Fong
 */
function PrePopWrapperForStorybook(props: PrePopWrapperForStorybookProps) {
  const { questionnaire, fhirClient, patient, user } = props;

  const [isPopulating, setIsPopulating] = useState(false);

  const isBuilding = useBuildForm({
    questionnaire,
    terminologyServerUrl: STORYBOOK_TERMINOLOGY_SERVER_URL
  });

  const queryClient = useRendererQueryClient();

  function handlePrepopulate() {
    setIsPopulating(true);

    populateQuestionnaire({
      questionnaire: questionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: fhirClient.state.serverUrl,
        authToken: null
      },
      patient: patient,
      user: user
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        setIsPopulating(false);
        return;
      }

      const { populatedResponse, populatedContext } = populateResult;

      // Call to buildForm to pre-populate the QR which repaints the entire BaseRenderer view
      await buildForm({
        questionnaire: questionnaire,
        questionnaireResponse: populatedResponse,
        terminologyServerUrl: STORYBOOK_TERMINOLOGY_SERVER_URL,
        additionalContext: {
          patient: patient,
          user: user,
          ...populatedContext
        }
      });

      setIsPopulating(false);
    });
  }

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          <ActionBarForStorybook>
            <PrePopButtonForStorybook isPopulating={isPopulating} onPopulate={handlePrepopulate} />
            <CopyButtonsForStorybook />
          </ActionBarForStorybook>
          {isPopulating ? null : <BaseRenderer />}
        </div>
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default PrePopWrapperForStorybook;
