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
import React, { useEffect } from 'react';
import type { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { BaseRenderer } from '../../components';
import { QueryClientProvider } from '@tanstack/react-query';
import { useBuildForm } from '../../hooks';
import useRendererQueryClient from '../../hooks/useRendererQueryClient';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';
// This stylesheet is using for testing the RenderingXhtmlGroupPropagationClassStyles story
import './TestCssSheet.css';
// iframeResizerChild.js needs to be called at least once in the used storybook wrappers to be included in storybook-static
import './iframeResizerChild';
import RendererThemeProvider from '../../theme/RendererThemeProvider';
import CopyButtonsForStorybook from './CopyButtonsForStorybook';
import ActionBarForStorybook from './ActionBarForStorybook';
import { useSmartConfigStore } from '../../stores';
import type Client from 'fhirclient/lib/Client';

interface BuildFormWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  fhirClient?: Client;
  patient?: Patient;
  user?: Practitioner;
}

function BuildFormWrapperForStorybook(props: BuildFormWrapperForStorybookProps) {
  const { questionnaire, questionnaireResponse, fhirClient, patient, user } = props;

  // If a fhirClient is provided, set it in the store so that it can be used by InitialExpressionRepopulatable button
  const setClient = useSmartConfigStore.use.setClient();
  const setPatient = useSmartConfigStore.use.setPatient();
  const setUser = useSmartConfigStore.use.setUser();

  useEffect(() => {
    if (fhirClient) {
      setClient(fhirClient);
    }

    if (patient) {
      setPatient(patient);
    }

    if (user) {
      setUser(user);
    }
  }, [fhirClient, patient, setClient, setPatient, setUser, user]);

  const queryClient = useRendererQueryClient();

  const isBuilding = useBuildForm({
    questionnaire,
    questionnaireResponse,
    terminologyServerUrl: STORYBOOK_TERMINOLOGY_SERVER_URL
  });

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ActionBarForStorybook>
          <CopyButtonsForStorybook />
        </ActionBarForStorybook>
        <BaseRenderer />
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default BuildFormWrapperForStorybook;
