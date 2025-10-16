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
import type { Meta, StoryObj } from '@storybook/react-vite';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import { createStory } from '../storybookWrappers/createStory';
import {
  qGroupHideAddItemButton,
  qInitialExpressionRepopulatable,
  qItemControlDisplayContextDisplay,
  qQuestionnaireItemTextHidden,
  qrGroupHideAddItemButton
} from '../assets/questionnaires/QCustomExtensions';
import { mockFhirClient } from '../assets/fhirClient/mockFhirClient';
import { patSmartForm } from '../assets/patients/PatSmartForm';
import { pracPrimaryPeter } from '../assets/practitioners/PracPrimaryPeter';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Custom/CustomExtensions',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const CustomContextDisplay: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayContextDisplay
  }
}) as Story;

export const QuestionnaireItemTextHidden: Story = createStory({
  args: {
    questionnaire: qQuestionnaireItemTextHidden
  }
}) as Story;

export const GroupHideAddItemButton: Story = createStory({
  args: {
    questionnaire: qGroupHideAddItemButton,
    questionnaireResponse: qrGroupHideAddItemButton
  }
}) as Story;

export const InitialExpressionRepopulatable: Story = createStory({
  args: {
    questionnaire: qInitialExpressionRepopulatable,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;
