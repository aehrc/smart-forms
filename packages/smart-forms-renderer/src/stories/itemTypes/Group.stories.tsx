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
  qrFactory,
  questionnaireFactory
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
const targetGroupLinkId = 'patient-details-group';

const nameLinkid = 'name';
const ageLinkid = 'age';
const targetName = 'Vladimir';
const targetAge = 25;

const qGroupBasic = questionnaireFactory([
  {
    linkId: targetGroupLinkId,
    type: 'group',
    repeats: false,
    text: 'Patient Details',
    item: [
      {
        linkId: nameLinkid,
        type: 'string',
        repeats: false,
        text: 'Name'
      },
      {
        linkId: ageLinkid,
        type: 'integer',
        repeats: false,
        text: 'Age'
      }
    ]
  }
]);
const qrGroupBasic = qrFactory([
  {
    linkId: 'patient-details-group',
    text: 'Patient Details',
    item: [
      {
        linkId: nameLinkid,

        answer: [
          {
            valueString: targetName
          }
        ]
      },
      {
        linkId: ageLinkid,

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
    await inputText(canvasElement, nameLinkid, targetName);
    await inputText(canvasElement, ageLinkid, targetAge);

    const nameResult = await getGroupAnswers(targetGroupLinkId, nameLinkid);
    const ageResult = await getGroupAnswers(targetGroupLinkId, ageLinkid);

    expect(nameResult).toHaveLength(1);
    expect(ageResult).toHaveLength(1);

    expect(nameResult[0]).toEqual(expect.objectContaining({ valueString: targetName }));
    expect(ageResult[0]).toEqual(expect.objectContaining({ valueInteger: targetAge }));

    // Clear
    const nameClearButton = canvasElement.querySelector(
      'div[data-test="q-item-string-field"] button[aria-label="Clear"]'
    );
    const ageClearButton = canvasElement.querySelector(
      'div[data-test="q-item-integer-field"] button[aria-label="Clear"]'
    );

    fireEvent.click(nameClearButton as HTMLElement);
    fireEvent.click(ageClearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));

    const resultNameAfterClear = await getGroupAnswers(targetGroupLinkId, nameLinkid);
    const resultAgeAfterClear = await getGroupAnswers(targetGroupLinkId, ageLinkid);
    expect(resultNameAfterClear).toHaveLength(0);
    expect(resultAgeAfterClear).toHaveLength(0);

    const elementNameAfterClear = await getInputText(canvasElement, nameLinkid);
    const elementAgeAfterClear = await getInputText(canvasElement, ageLinkid);
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
    const inputName = await getInputText(canvasElement, nameLinkid);
    const inputAge = await getInputText(canvasElement, ageLinkid);

    expect(inputName).toBe(targetName);
    expect(inputAge).toBe(targetAge.toString());
  }
}) as Story;
