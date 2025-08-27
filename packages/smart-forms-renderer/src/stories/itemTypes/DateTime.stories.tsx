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
import { getInputText, inputDateTime } from '@aehrc/testing-toolkit';
import { expect } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/DateTime',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const targetlinkId = 'dob'
const targetText = 'Datetime of birth'
const targetDateText = "1990-01-01T13:15:00+03:00"
const targetDate = '1990-01-01'

const qDateTimeBasic = questionnaireFactory([{
  linkId: targetlinkId,
  type: 'dateTime',
  repeats: false,
  text: targetText
}])
const qrDateTimeBasicResponse = qrFactory([{
  linkId: targetlinkId,
  answer: [
    {
      valueDateTime: targetDate
    }
  ]
}])


export const DateTimeBasic: Story = {
  args: {
    questionnaire: qDateTimeBasic
  }, play: async ({ canvasElement }) => {
    await inputDateTime(canvasElement, targetlinkId, targetDate, '01:15', 'PM');

    const result = await getAnswers(targetlinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueDateTime: targetDateText }));
  }
};
export const DateTimeBasicResponse: Story = {
  args: {
    questionnaire: qDateTimeBasic,
    questionnaireResponse: qrDateTimeBasicResponse
  }, play: async ({ canvasElement }) => {
    const input = await getInputText(canvasElement, targetlinkId);

    expect(input).toBe("01/01/1990")

  }
};
