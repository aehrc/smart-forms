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
import React from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { BaseRenderer } from '../../components';
import { QueryClientProvider } from '@tanstack/react-query';
import RendererThemeProvider from '../../theme/Theme';
import { useBuildForm } from '../../hooks';
import useRendererQueryClient from '../../hooks/useRendererQueryClient';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';

// iframeResizerChild.js needs to be called at least once in the used storybook wrappers to be included in storybook-static
import './iframeResizerChild';

interface BuildFormWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormWrapperForStorybook(props: BuildFormWrapperForStorybookProps) {
  const { questionnaire, questionnaireResponse } = props;

  const queryClient = useRendererQueryClient();
  const isBuilding = useBuildForm(
    questionnaire,
    questionnaireResponse,
    undefined,
    STORYBOOK_TERMINOLOGY_SERVER_URL
  );

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default BuildFormWrapperForStorybook;
