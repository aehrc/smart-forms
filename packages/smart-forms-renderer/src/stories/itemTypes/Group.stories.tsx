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
  getGroupAnswers,
  getInputText,
  inputText,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, fireEvent } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Group',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

/* Group Basic story */
const targetGroupLinkId = 'patient-details-group';

const nameLinkId = 'name';
const ageLinkId = 'age';
const targetName = 'John Doe';
const targetAge = 25;

const qGroupBasic = questionnaireFactory([
  {
    linkId: targetGroupLinkId,
    type: 'group',
    repeats: false,
    text: 'Patient Details',
    item: [
      {
        linkId: nameLinkId,
        type: 'string',
        repeats: false,
        text: 'Name'
      },
      {
        linkId: ageLinkId,
        type: 'integer',
        repeats: false,
        text: 'Age'
      }
    ]
  }
]);

const qrGroupBasic = questionnaireResponseFactory([
  {
    linkId: 'patient-details-group',
    text: 'Patient Details',
    item: [
      {
        linkId: nameLinkId,

        answer: [
          {
            valueString: targetName
          }
        ]
      },
      {
        linkId: ageLinkId,

        answer: [
          {
            valueDecimal: targetAge
          }
        ]
      }
    ]
  }
]);

export const GroupBasic: Story = createStory({
  args: {
    questionnaire: qGroupBasic
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, nameLinkId, targetName);
    await inputText(canvasElement, ageLinkId, targetAge);

    const nameResult = await getGroupAnswers(targetGroupLinkId, nameLinkId);
    const ageResult = await getGroupAnswers(targetGroupLinkId, ageLinkId);

    expect(nameResult).toHaveLength(1);
    expect(ageResult).toHaveLength(1);

    expect(nameResult[0]).toEqual(expect.objectContaining({ valueString: targetName }));
    expect(ageResult[0]).toEqual(expect.objectContaining({ valueInteger: targetAge }));

    // Clear
    const nameClearButton = canvasElement.querySelector(
      'div[data-test="q-item-string-field"] button[title="Clear"]'
    );
    const ageClearButton = canvasElement.querySelector(
      'div[data-test="q-item-integer-field"] button[title="Clear"]'
    );

    fireEvent.click(nameClearButton as HTMLElement);
    fireEvent.click(ageClearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));

    const resultNameAfterClear = await getGroupAnswers(targetGroupLinkId, nameLinkId);
    const resultAgeAfterClear = await getGroupAnswers(targetGroupLinkId, ageLinkId);
    expect(resultNameAfterClear).toHaveLength(0);
    expect(resultAgeAfterClear).toHaveLength(0);

    const elementNameAfterClear = await getInputText(canvasElement, nameLinkId);
    const elementAgeAfterClear = await getInputText(canvasElement, ageLinkId);
    expect(elementNameAfterClear).toBe('');
    expect(elementAgeAfterClear).toBe('');
  }
}) as Story;

export const GroupBasicResponse: Story = createStory({
  args: {
    questionnaire: qGroupBasic,
    questionnaireResponse: qrGroupBasic
  },
  play: async ({ canvasElement }) => {
    const inputName = await getInputText(canvasElement, nameLinkId);
    const inputAge = await getInputText(canvasElement, ageLinkId);

    expect(inputName).toBe(targetName);
    expect(inputAge).toBe(targetAge.toString());
  }
}) as Story;
