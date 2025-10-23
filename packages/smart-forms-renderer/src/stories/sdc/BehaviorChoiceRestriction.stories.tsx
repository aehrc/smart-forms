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
  qAnswerExpression,
  qAnswerOption,
  qAnswerOptionToggleExpressionAnswerOption,
  qAnswerOptionToggleExpressionContained,
  qAnswerValueSet,
  qReadOnlyDuplicate,
  qRepeatsDuplicate,
  qRequiredDuplicate,
  qUnitOptionDuplicate
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/10.1.2 Behavior > Choice Restriction',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AnswerOption: Story = createStory({
  args: {
    questionnaire: qAnswerOption
  }
}) as Story;

export const AnswerValueSet: Story = createStory({
  args: {
    questionnaire: qAnswerValueSet
  }
}) as Story;

export const AnswerExpression: Story = createStory({
  args: {
    questionnaire: qAnswerExpression
  }
}) as Story;

export const AnswerOptionToggleExpressionAnswerOption: Story = createStory({
  args: {
    questionnaire: qAnswerOptionToggleExpressionAnswerOption
  }
}) as Story;

export const AnswerOptionToggleExpressionAnswerValueSetContained: Story = createStory({
  args: {
    questionnaire: qAnswerOptionToggleExpressionContained
  }
}) as Story;

export const Required: Story = createStory({
  args: {
    questionnaire: qRequiredDuplicate
  }
}) as Story;

export const Repeats: Story = createStory({
  args: {
    questionnaire: qRepeatsDuplicate
  }
}) as Story;

export const ReadOnly: Story = createStory({
  args: {
    questionnaire: qReadOnlyDuplicate
  }
}) as Story;

export const UnitOption: Story = createStory({
  args: {
    questionnaire: qUnitOptionDuplicate
  }
}) as Story;
