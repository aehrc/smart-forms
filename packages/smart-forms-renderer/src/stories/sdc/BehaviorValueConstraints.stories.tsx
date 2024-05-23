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
  qMaxDecimalPlaces,
  qMaxLength,
  qMaxValue,
  qMinLength,
  qMinValue,
  qRegex,
  qrMaxDecimalPlaces,
  qrMaxLength,
  qrMaxValue,
  qrMinLength,
  qrMinValue,
  qrRegex
} from '../assets/questionnaires'; // More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SDC/9.1.1 Form Behavior Value Constraints',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const MaxLength: Story = {
  args: {
    questionnaire: qMaxLength,
    questionnaireResponse: qrMaxLength
  }
};

export const MinLength: Story = {
  args: {
    questionnaire: qMinLength,
    questionnaireResponse: qrMinLength
  }
};

export const Regex: Story = {
  args: {
    questionnaire: qRegex,
    questionnaireResponse: qrRegex
  }
};

export const MinValue: Story = {
  args: {
    questionnaire: qMinValue,
    questionnaireResponse: qrMinValue
  }
};

export const MaxValue: Story = {
  args: {
    questionnaire: qMaxValue,
    questionnaireResponse: qrMaxValue
  }
};

export const MaxDecimalPlaces: Story = {
  args: {
    questionnaire: qMaxDecimalPlaces,
    questionnaireResponse: qrMaxDecimalPlaces
  }
};
