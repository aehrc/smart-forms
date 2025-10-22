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
import { createStory } from '../storybookWrappers/createStory';

import {
  findByLinkIdOrLabel,
  getAnswers,
  getInputText,
  inputInteger,
  questionnaireFactory,
  questionnaireResponseFactory,
  unitExtFactory
} from '../testUtils';
import { expect, fireEvent, within } from 'storybook/test';

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

/* Integer Basic story */
const targetLinkId = 'age';
const targetAge = 40;
const basicAge = 25;

const qIntegerBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'integer',
    repeats: false,
    text: 'Age'
  }
]);
const qrIntegerBasicResponse = questionnaireResponseFactory([
  {
    linkId: targetLinkId,
    text: 'Age',
    answer: [
      {
        valueInteger: targetAge
      }
    ]
  }
]);

export const IntegerBasic: Story = createStory({
  args: {
    questionnaire: qIntegerBasic
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, targetLinkId, basicAge);

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueInteger: basicAge }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);
    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('input');
    expect(input?.getAttribute('value')).toBe('');
  }
}) as Story;

export const IntegerBasicResponse: Story = createStory({
  args: {
    questionnaire: qIntegerBasic,
    questionnaireResponse: qrIntegerBasicResponse
  },
  play: async ({ canvasElement }) => {
    const input = await getInputText(canvasElement, targetLinkId);

    expect(input).toBe(targetAge.toString());
  }
}) as Story;

/* Integer Unit Accessibility story */
const accessibilityTargetLinkId = 'heart-rate';
const qIntegerAccessibility = questionnaireFactory([
  {
    linkId: accessibilityTargetLinkId,
    extension: [unitExtFactory('bpm', 'beats per minute')],
    type: 'integer',
    text: 'Heart Rate'
  }
]);

export const IntegerUnitAccessibility: Story = createStory({
  args: {
    questionnaire: qIntegerAccessibility
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the integer input field by its data-test attribute
    const inputField = canvas.getByTestId('q-item-integer-field');
    const input = inputField.querySelector('input');

    // Verify the aria-label includes the item text and unit for screen reader accessibility
    expect(input?.getAttribute('aria-label')).toBe('Heart Rate (beats per minute)');
  }
}) as Story;
