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
  qPreferredTerminologyServer,
  qReadOnly,
  qRepeatsAutocomplete,
  qRepeatsCheckbox,
  qRepeatsGroup,
  qRepeatsGroupNested,
  qRequired
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.4 Rendering > Other',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Required: Story = createStory({
  args: {
    questionnaire: qRequired
  }
}) as Story;

export const RepeatsAutocomplete: Story = createStory({
  args: {
    questionnaire: qRepeatsAutocomplete
  }
}) as Story;

export const RepeatsCheckbox: Story = createStory({
  args: {
    questionnaire: qRepeatsCheckbox
  }
}) as Story;

export const RepeatsGroup: Story = createStory({
  args: {
    questionnaire: qRepeatsGroup
  }
}) as Story;

export const RepeatsGroupNested: Story = createStory({
  args: {
    questionnaire: qRepeatsGroupNested
  }
}) as Story;

export const ReadOnly: Story = createStory({
  args: {
    questionnaire: qReadOnly
  }
}) as Story;

export const PreferredTerminologyServer: Story = createStory({
  args: {
    questionnaire: qPreferredTerminologyServer
  }
}) as Story;
