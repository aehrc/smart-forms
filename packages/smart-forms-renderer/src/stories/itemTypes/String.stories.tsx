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
  findByLinkIdOrLabel,
  getAnswers,
  getInputText,
  inputText,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, fireEvent, within } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/String',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

/* String Basic story */
const targetLinkId = 'name';
const targetInput = 'John Doe';

const qStringBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'string',
    repeats: false,
    text: 'Name'
  }
]);

const qrStringBasicResponse = questionnaireResponseFactory([
  {
    linkId: targetLinkId,
    text: 'Name',
    answer: [
      {
        valueString: targetInput
      }
    ]
  }
]);

export const StringBasic: Story = createStory({
  args: {
    questionnaire: qStringBasic
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, targetLinkId, targetInput);

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueString: targetInput }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);
    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('textarea');
    expect(input?.value).toBe('');
  }
}) as Story;

export const StringBasicResponse: Story = createStory({
  args: {
    questionnaire: qStringBasic,
    questionnaireResponse: qrStringBasicResponse
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetLinkId);

    expect(inputText).toBe(targetInput);
  }
}) as Story;

/* String with instructions for accessibility testing */
const qStringAccessibility = questionnaireFactory([
  {
    linkId: 'email',
    type: 'string',
    repeats: false,
    text: 'Email Address',
    item: [
      {
        linkId: 'email-instructions',
        type: 'display',
        text: 'Please enter your work email address',
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

export const StringInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qStringAccessibility
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputField = canvas.getByTestId('q-item-string-field');
    const textarea = inputField.querySelector('textarea');
    const ariaDescribedBy = textarea?.getAttribute('aria-describedby');

    // Check that aria-describedby is present and references the instructions
    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-email');

    // Check that the instructions element exists with the correct ID
    const instructionsElement = document.getElementById('instructions-email');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Please enter your work email address');
  }
}) as Story;
