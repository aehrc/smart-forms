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
  title: 'ItemType/Text',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

/* Text Basic story */
const targetLinkId = 'details';
const targetInput =
  '- 8 hour eating window\n' +
  '- Cup of black coffee in the morning\n' +
  '- Small portions of lunch and dinner';

const basicQuestionnaire = questionnaireFactory([
  { linkId: targetLinkId, type: 'text', text: 'Details of intermittent fasting' }
]);

const basicQr = questionnaireResponseFactory([
  {
    linkId: targetLinkId,
    text: 'Details of intermittent fasting',
    answer: [{ valueString: targetInput }]
  }
]);

export const TextBasic: Story = createStory({
  args: {
    questionnaire: basicQuestionnaire
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, targetLinkId, targetInput);

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueString: targetInput }));

    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('textarea');

    // Clear value
    if (input) {
      await fireEvent.focus(input);
      await fireEvent.input(input, { target: { value: '' } });
    }

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);
    expect(input?.value).toBe('');
  }
}) as Story;

export const TextBasicResponse: Story = createStory({
  args: {
    questionnaire: basicQuestionnaire,
    questionnaireResponse: basicQr
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetLinkId);

    expect(inputText).toBe(targetInput);
  }
}) as Story;

/* Text with instructions for accessibility testing */
const qTextAccessibility = questionnaireFactory([
  {
    linkId: 'comments',
    type: 'text',
    repeats: false,
    text: 'Additional Comments',
    item: [
      {
        linkId: 'comments-instructions',
        type: 'display',
        text: 'Please provide any additional information you think is relevant',
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

export const TextInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qTextAccessibility
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputField = canvas.getByTestId('q-item-text-field');
    const textarea = inputField.querySelector('textarea');
    const ariaDescribedBy = textarea?.getAttribute('aria-describedby');

    // Check that aria-describedby is present and references the instructions
    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-comments');

    // Check that the instructions element exists with the correct ID
    const instructionsElement = document.getElementById('instructions-comments');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain(
      'Please provide any additional information you think is relevant'
    );
  }
}) as Story;
