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
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook'; // More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
import {
  checkCheckBox,
  checkRadioOption,
  findByLinkIdOrLabel,
  getAnswers,
  getInputText,
  itemControlExtFactory,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, fireEvent, within } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Boolean',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

/* Boolean Basic story */
const targetLinkId = 'eaten';

const qBooleanBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'boolean',
    repeats: false,
    text: 'Have you eaten yet?'
  }
]);

const qrBooleanBasicResponse = questionnaireResponseFactory([
  {
    linkId: targetLinkId,
    text: 'Have you eaten yet?',
    answer: [
      {
        valueBoolean: true
      }
    ]
  }
]);

export const BooleanBasic: Story = createStory({
  args: {
    questionnaire: qBooleanBasic
  },
  play: async ({ canvasElement }) => {
    await checkRadioOption(canvasElement, targetLinkId, 'Yes');

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueBoolean: true }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);

    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('input');
    expect(input).not.toBeChecked();
  }
}) as Story;

export const BooleanBasicResponse: Story = createStory({
  args: {
    questionnaire: qBooleanBasic,
    questionnaireResponse: qrBooleanBasicResponse
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetLinkId);

    expect(inputText).toBe('true');
  }
}) as Story;

/* Boolean Checkbox story */
const qBooleanCheckbox = questionnaireFactory([
  {
    extension: [itemControlExtFactory('check-box')],
    linkId: 'eaten',
    type: 'boolean',
    repeats: false,
    text: 'Have you eaten yet?'
  }
]);
const qrBooleanCheckboxResponse = questionnaireResponseFactory([
  {
    linkId: 'eaten',
    text: 'Have you eaten yet?',
    answer: [
      {
        valueBoolean: true
      }
    ]
  }
]);

export const BooleanCheckbox: Story = createStory({
  args: {
    questionnaire: qBooleanCheckbox
  },
  play: async ({ canvasElement }) => {
    await checkCheckBox(canvasElement, targetLinkId);

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueBoolean: true }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);

    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('input');
    expect(input).not.toBeChecked();
  }
}) as Story;

export const BooleanCheckboxResponse: Story = createStory({
  args: {
    questionnaire: qBooleanCheckbox,
    questionnaireResponse: qrBooleanCheckboxResponse
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = element.querySelector('input');

    expect(input).toBeChecked();
  }
}) as Story;

/* Boolean with instructions for accessibility testing */
const qBooleanAccessibility = questionnaireFactory([
  {
    linkId: 'consent',
    type: 'boolean',
    repeats: false,
    text: 'I agree to the terms and conditions',
    item: [
      {
        linkId: 'consent-instructions',
        type: 'display',
        text: 'Please read the terms carefully before agreeing',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/questionnaire-display-category',
                  code: 'instructions'
                }
              ]
            }
          }
        ]
      }
    ]
  }
]);

export const BooleanInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qBooleanAccessibility
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputField = canvas.getByTestId('q-item-boolean-field');
    const radioGroup = inputField.querySelector('[role="radiogroup"]');
    const ariaDescribedBy = radioGroup?.getAttribute('aria-describedby');

    // Check that aria-describedby is present and references the instructions
    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-consent');

    // Check that the instructions element exists with the correct ID
    const instructionsElement = document.getElementById('instructions-consent');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain(
      'Please read the terms carefully before agreeing'
    );
  }
}) as Story;
