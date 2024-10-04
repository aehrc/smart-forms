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
import { RendererThemeProvider } from '../../theme';
import { useBuildForm, useRendererQueryClient } from '../../hooks';
import BuildFormButtonForStorybook from './BuildFormButtonForStorybook';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';

interface BuildFormButtonTesterWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

/**
 * This is a demo wrapper which initialises the BaseRenderer with the passed in questionnaire using useBuildForm.
 * It also provides a button to build the form with the passed in questionnaire + questionnaireResponse.
 * It was done as a two-step process for demo purposes.
 *
 * Use this pattern if you already have a pre-populated/pre-filled/draft response.
 * If you want to pre-pop on the fly, see https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/PrePopWrapperForStorybook.tsx instead
 *
 * @author Sean Fong
 */
function BuildFormButtonTesterWrapperForStorybook(
  props: BuildFormButtonTesterWrapperForStorybookProps
) {
  const { questionnaire, questionnaireResponse } = props;

  const queryClient = useRendererQueryClient();

  const isBuilding = useBuildForm(
    questionnaire,
    undefined,
    undefined,
    STORYBOOK_TERMINOLOGY_SERVER_URL
  );

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          <BuildFormButtonForStorybook
            questionnaire={questionnaire}
            questionnaireResponse={questionnaireResponse}
          />
          <BaseRenderer />
        </div>
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default BuildFormButtonTesterWrapperForStorybook;
