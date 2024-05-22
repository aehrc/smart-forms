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

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SDC/8.1.2 Advanced Control Appearance - Item Control Question',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AutocompleteOpenChoice: Story = {
  args: {
    questionnaire: qOpenChoiceAutocomplete
  }
};

export const DropDownChoiceAnswerOption: Story = {
  args: {
    questionnaire: qChoiceDropDownAnswerOption
  }
};

export const DropDownChoiceAnswerValueSet: Story = {
  args: {
    questionnaire: qChoiceDropDownAnswerValueSet
  }
};

export const CheckboxChoiceAnswerOption: Story = {
  args: {
    questionnaire: qChoiceCheckboxAnswerOption
  }
};

export const CheckboxChoiceAnswerValueSet: Story = {
  args: {
    questionnaire: qChoiceCheckboxAnswerValueSet
  }
};

export const CheckboxOpenChoiceAnswerOption: Story = {
  args: {
    questionnaire: qOpenChoiceCheckboxAnswerOption
  }
};

export const CheckboxOpenChoiceAnswerValueSet: Story = {
  args: {
    questionnaire: qOpenChoiceCheckboxAnswerValueSet
  }
};

export const RadioChoiceAnswerOption: Story = {
  args: {
    questionnaire: qChoiceRadioAnswerOption
  }
};

export const RadioChoiceAnswerValueSet: Story = {
  args: {
    questionnaire: qChoiceRadioAnswerValueSet
  }
};

export const RadioOpenChoiceAnswerOption: Story = {
  args: {
    questionnaire: qOpenChoiceRadioAnswerOption
  }
};

export const RadioOpenChoiceAnswerValueSet: Story = {
  args: {
    questionnaire: qOpenChoiceRadioAnswerValueSet
  }
};

export const SliderInteger: Story = {
  args: {
    questionnaire: qSliderStepValue
  }
};
