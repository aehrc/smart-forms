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

import { getAnswers, qrFactory, questionnaireFactory } from '../testUtils';
import { getInputText, inputTime } from '@aehrc/testing-toolkit';
import { expect } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Time',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const targetlinkId = 'last-meal';
const targetText = 'Time of last meal';
const targetTime = '11:00:00';
const targetTimeString = '11:00 am';

const qTimeBasic = questionnaireFactory([
  {
    linkId: targetlinkId,
    type: 'time',
    repeats: false,
    text: targetText
  }
]);
const qrTimeBasic = qrFactory([
  {
    linkId: targetlinkId,
    answer: [{ valueTime: targetTime }]
  }
]);

export const TimeBasic: Story = {
  args: {
    questionnaire: qTimeBasic
  },
  play: async ({ canvasElement }) => {
    await inputTime(canvasElement, targetlinkId, targetTimeString);

    const result = await getAnswers(targetlinkId);
    expect(result).toHaveLength(1);
    expect(result[0].valueTime).toBe(targetTime);
  }
};
export const TimeBasicResponse: Story = {
  args: {
    questionnaire: qTimeBasic,
    questionnaireResponse: qrTimeBasic
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetlinkId);

    expect(inputText).toBe(targetTimeString);
  }
};
