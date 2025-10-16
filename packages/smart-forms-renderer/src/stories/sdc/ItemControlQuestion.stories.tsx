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
  qChoiceCheckboxAnswerOption,
  qChoiceCheckboxAnswerValueSet,
  qChoiceDropDownAnswerOption,
  qChoiceDropDownAnswerValueSet,
  qChoiceRadioAnswerOption,
  qChoiceRadioAnswerValueSet,
  qOpenChoiceAutocomplete,
  qOpenChoiceCheckboxAnswerOption,
  qOpenChoiceCheckboxAnswerValueSet,
  qOpenChoiceRadioAnswerOption,
  qOpenChoiceRadioAnswerValueSet,
  qSliderStepValue
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.2 Rendering > Control Appearance - itemControl Question',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AutocompleteOpenChoice: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAutocomplete
  }
}) as Story;

export const DropDownChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qChoiceDropDownAnswerOption
  }
}) as Story;

export const DropDownChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qChoiceDropDownAnswerValueSet
  }
}) as Story;

export const CheckboxChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qChoiceCheckboxAnswerOption
  }
}) as Story;

export const CheckboxChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qChoiceCheckboxAnswerValueSet
  }
}) as Story;

export const CheckboxOpenChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qOpenChoiceCheckboxAnswerOption
  }
}) as Story;

export const CheckboxOpenChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qOpenChoiceCheckboxAnswerValueSet
  }
}) as Story;

export const RadioChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qChoiceRadioAnswerOption
  }
}) as Story;

export const RadioChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qChoiceRadioAnswerValueSet
  }
}) as Story;

export const RadioOpenChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qOpenChoiceRadioAnswerOption
  }
}) as Story;

export const RadioOpenChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qOpenChoiceRadioAnswerValueSet
  }
}) as Story;

export const SliderInteger: Story = createStory({
  args: {
    questionnaire: qSliderStepValue
  }
}) as Story;
