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

import type { Meta, StoryObj } from '@storybook/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import sourceQuestionnaireJson from '../assets/sourceQuestionnaire.json';
import populatedResponseJson from '../assets/populatedResponse.json';
import { BaseRenderer } from '@aehrc/smart-forms-renderer';
import type { DefaultOptions } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BaseRendererWrapper from './BaseRendererWrapper.tsx';

const DEFAULT_QUERY_OPTIONS: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    keepPreviousData: true
  }
};

const queryClient = new QueryClient({
  defaultOptions: DEFAULT_QUERY_OPTIONS
});

const sourceQuestionnaire = sourceQuestionnaireJson as Questionnaire;
const populatedResponse = populatedResponseJson as QuestionnaireResponse;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Renderer/BaseRenderer',
  component: BaseRenderer,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof BaseRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RendererWithEmptyResponse: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <BaseRendererWrapper questionnaire={sourceQuestionnaire}>
          <Story />
        </BaseRendererWrapper>
      </QueryClientProvider>
    )
  ]
};

export const RendererWithPopulatedResponse: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <BaseRendererWrapper
          questionnaire={sourceQuestionnaire}
          questionnaireResponse={populatedResponse}>
          <Story />
        </BaseRendererWrapper>
      </QueryClientProvider>
    )
  ]
};
