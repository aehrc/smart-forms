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
import { findByLinkId, getInputText, inputInteger } from '@aehrc/testing-toolkit';
import { expect, fireEvent } from 'storybook/test';
import { getAnswers, qrFactory, questionnaireFactory } from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Integer',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const targetlinkId = 'age';
const targetAge = 40;
const basicAge = 25;

const qIntegerBasic = questionnaireFactory([
  {
    linkId: targetlinkId,
    type: 'integer',
    repeats: false,
    text: 'Age'
  }
]);
const qrIntegerBasicResponse = qrFactory([
  {
    linkId: targetlinkId,
    text: 'Age',
    answer: [
      {
        valueInteger: targetAge
      }
    ]
  }
]);

export const IntegerBasic: Story = {
  args: {
    questionnaire: qIntegerBasic
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, targetlinkId, basicAge);

    const result = await getAnswers(targetlinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueInteger: basicAge }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetlinkId);
    expect(resultAfterClear).toHaveLength(0);
    const elementAfterClear = await findByLinkId(canvasElement, targetlinkId);
    const input = elementAfterClear.querySelector('input');
    expect(input?.getAttribute('value')).toBe('');
  }
};
export const IntegerBasicResponse: Story = {
  args: {
    questionnaire: qIntegerBasic,
    questionnaireResponse: qrIntegerBasicResponse
  },
  play: async ({ canvasElement }) => {
    const input = await getInputText(canvasElement, targetlinkId);

    expect(input).toBe(targetAge.toString());
  }
};
