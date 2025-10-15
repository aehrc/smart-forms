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
  getAnswers,
  getInputText,
  inputDateTime,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

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

/* DateTime Basic story */
const targetLinkId = 'dob';
const targetText = 'Datetime of birth';
const targetDateTextWithoutTZ = '1990-01-01T13:15:00';
const targetDate = '01/01/1990';

const qDateTimeBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'dateTime',
    repeats: false,
    text: targetText
  }
]);
const qrDateTimeBasicResponse = questionnaireResponseFactory([
  {
    linkId: targetLinkId,
    answer: [
      {
        valueDateTime: '1990-01-01T00:53:00Z'
      }
    ]
  }
]);

export const DateTimeBasic: Story = createStory({
  args: {
    questionnaire: qDateTimeBasic
  },
  play: async ({ canvasElement }) => {
    await inputDateTime(canvasElement, targetLinkId, targetDate, '01:15', 'PM');

    const result = await getAnswers(targetLinkId);

    expect(result).toHaveLength(1);

    // Taking into account timezone
    expect(result[0]).toEqual(
      expect.objectContaining({
        valueDateTime: expect.stringContaining(targetDateTextWithoutTZ)
      })
    );

    // TODO : ADD CLEAR BUTTON
  }
}) as Story;

export const DateTimeBasicResponse: Story = createStory({
  args: {
    questionnaire: qDateTimeBasic,
    questionnaireResponse: qrDateTimeBasicResponse
  },
  play: async ({ canvasElement }) => {
    const input = await getInputText(canvasElement, targetLinkId);

    expect(input).toBe('01/01/1990');
  }
}) as Story;
