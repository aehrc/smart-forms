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
  qOpenChoiceAnswerAutoCompleteFromValueSet,
  qOpenChoiceAnswerOptionBasic,
  qOpenChoiceAnswerValueSetBasic,
  qrOpenChoiceAnswerOptionBasicResponse,
  qrOpenChoiceAnswerValueSetBasicResponse
} from '../assets/questionnaires';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/OpenChoice',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const OpenChoiceAnswerOptionBasic: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic
  }
};

export const OpenChoiceAnswerOptionBasicResponse: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic,
    questionnaireResponse: qrOpenChoiceAnswerOptionBasicResponse
  }
};

export const OpenChoiceAnswerValueSetBasic: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic
  }
};

export const OpenChoiceAnswerValueSetBasicResponse: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic,
    questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  }
};

//Story for OpenChoiceAutoCompleteItem in Tabbed environment
export const OpenChoiceAutoCompleteFromValueSetsWithTabs: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerAutoCompleteFromValueSet,
    // questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  }
};