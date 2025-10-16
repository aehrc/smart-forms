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
  qChoiceOrientation,
  qCollapsibleGroupDefaultClosed,
  qCollapsibleGroupDefaultOpen,
  qCollapsibleGroupNested,
  qCollapsibleSingleDefaultClosed,
  qCollapsibleSingleDefaultOpen,
  qItemControl,
  qSliderStepValue,
  qWidthGrid,
  qWidthGTable
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.2 Rendering > Control Appearance',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const ItemControl: Story = createStory({
  args: {
    questionnaire: qItemControl
  }
}) as Story;

export const ChoiceOrientation: Story = createStory({
  args: {
    questionnaire: qChoiceOrientation
  }
}) as Story;

export const SliderStepValue: Story = createStory({
  args: {
    questionnaire: qSliderStepValue
  }
}) as Story;

export const WidthGTable: Story = createStory({
  args: {
    questionnaire: qWidthGTable
  }
}) as Story;

export const WidthGrid: Story = createStory({
  args: {
    questionnaire: qWidthGrid
  }
}) as Story;

export const CollapsibleSingleDefaultOpen: Story = createStory({
  args: {
    questionnaire: qCollapsibleSingleDefaultOpen
  }
}) as Story;

export const CollapsibleSingleDefaultClosed: Story = createStory({
  args: {
    questionnaire: qCollapsibleSingleDefaultClosed
  }
}) as Story;

export const CollapsibleGroupDefaultOpen: Story = createStory({
  args: {
    questionnaire: qCollapsibleGroupDefaultOpen
  }
}) as Story;

export const CollapsibleGroupDefaultClosed: Story = createStory({
  args: {
    questionnaire: qCollapsibleGroupDefaultClosed
  }
}) as Story;

export const CollapsibleGroupNested: Story = createStory({
  args: {
    questionnaire: qCollapsibleGroupNested
  }
}) as Story;
