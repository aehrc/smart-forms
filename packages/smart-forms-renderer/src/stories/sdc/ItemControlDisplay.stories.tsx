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
import {
  qItemControlDisplayFlyover,
  qItemControlDisplayLowerAndUpper,
  qItemControlDisplayPrompt,
  qItemControlDisplayUnit
} from '../assets/questionnaires'; // More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.2 Rendering > Control Appearance - itemControl Display',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Prompt: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayPrompt
  }
}) as Story;

export const Unit: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayUnit
  }
}) as Story;

export const LowerAndUpper: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayLowerAndUpper
  }
}) as Story;

export const Flyover: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayFlyover
  }
}) as Story;
