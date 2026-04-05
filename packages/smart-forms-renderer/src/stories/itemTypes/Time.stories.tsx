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
  inputTime,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, waitFor } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

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

/* Time Basic story */
const targetLinkId = 'last-meal';
const targetTimeInput = '11:00:00';
/** Matches what users type in the default 12h TimeField (hh:mm a) */
const targetTimeDisplayString = '11:00 am';

const qTimeBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'time',
    repeats: false,
    text: 'Time of last meal'
  }
]);

const qrTimeBasic = questionnaireResponseFactory([
  {
    linkId: targetLinkId,
    text: 'Time of last meal',
    answer: [{ valueTime: targetTimeInput }]
  }
]);

export const TimeBasic: Story = createStory({
  args: {
    questionnaire: qTimeBasic
  },
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        expect(canvasElement.querySelector(`[data-linkid="${targetLinkId}"]`)).toBeTruthy();
        expect(canvasElement.querySelector('[data-test="q-item-time-field"]')).toBeTruthy();
      },
      { timeout: 60000 }
    );

    await inputTime(canvasElement, targetLinkId, targetTimeDisplayString);

    let result: Awaited<ReturnType<typeof getAnswers>> = [];
    await waitFor(
      async () => {
        result = await getAnswers(targetLinkId);
        expect(result).toHaveLength(1);
      },
      { timeout: 30000 }
    );
    expect(result[0].valueTime).toBe(targetTimeInput);
  }
}) as Story;

export const TimeBasicResponse: Story = createStory({
  args: {
    questionnaire: qTimeBasic,
    questionnaireResponse: qrTimeBasic
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetLinkId);

    // TimeField defaults to 12-hour format; locale may use "am" or "AM"
    expect(inputText.toLowerCase().replace(/\s+/g, ' ').trim()).toBe('11:00 am');
  }
}) as Story;
