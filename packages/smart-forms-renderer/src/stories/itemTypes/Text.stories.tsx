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
import { qTextCalculation } from '../assets/questionnaires';
import { inputText, getInputText } from '@aehrc/testing-toolkit'
import { expect, fireEvent } from "storybook/test"
import { getAnswers, qrFactory, questionnaireFactory } from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

const meta = {
  title: 'ItemType/Text',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const targetText = 'mytext';
const targetlinkId = 'details';

const basicQuestionnare = questionnaireFactory([{ linkId: targetlinkId, type: 'string', text: targetText }])
const basicQr = qrFactory([{ linkId: targetlinkId, answer: [{ valueString: targetText }] }])

export const TextBasic: Story = {

  args: {
    questionnaire: basicQuestionnare
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, targetlinkId, targetText);

    const result = await getAnswers(targetlinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueString: targetText }));

    // Clear value 
    const clear = canvasElement.querySelector('button#Clear');
    fireEvent.click(clear as HTMLElement);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const resultAfterDelete = await getAnswers(targetlinkId);
    expect(resultAfterDelete).toHaveLength(0);
  }
};

export const TextBasicResponse: Story = {
  args: {
    questionnaire: basicQuestionnare,
    questionnaireResponse: basicQr
  }, play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetlinkId);

    expect(inputText).toBe(targetText)
  }
};

// TODO: Move to separate storybook
export const TextCalculation: Story = {
  args: {
    questionnaire: qTextCalculation
  }
};
