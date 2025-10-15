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
  qItemControlDisplayTabContainer,
  qItemControlGroupGridMultiRow,
  qItemControlGroupGridSingleRow,
  qItemControlGroupGTableRepeats,
  qItemControlGroupGTableSingle,
  qItemControlGroupPage,
  qItemControlGroupPageContainer,
  qItemControlGroupPageNonTopLevelPageContainer
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/8.1.2 Advanced Control Appearance - Item Control Group',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const GTableRepeats: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGTableRepeats
  }
}) as Story;

export const GTableSingle: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGTableSingle
  }
}) as Story;

export const GridSingleRow: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGridSingleRow
  }
}) as Story;

export const GridMultiRow: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGridMultiRow
  }
}) as Story;

export const TabContainer: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayTabContainer
  }
}) as Story;

export const Page: Story = createStory({
  args: {
    questionnaire: qItemControlGroupPage
  }
}) as Story;

export const PageContainer: Story = createStory({
  args: {
    questionnaire: qItemControlGroupPageContainer
  }
}) as Story;

export const PageContainerNonSingleTopLevel: Story = createStory({
  args: {
    questionnaire: qItemControlGroupPageNonTopLevelPageContainer
  }
}) as Story;
