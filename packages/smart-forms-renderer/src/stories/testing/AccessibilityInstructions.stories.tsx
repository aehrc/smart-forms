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
import { findByLinkIdOrLabel, questionnaireFactory } from '../testUtils';
import { expect } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

const meta = {
  title: 'Testing/Accessibility/Instructions',
  component: BuildFormWrapperForStorybook,
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    // Use findByLinkIdOrLabel to wait for element to be rendered
    const element = await findByLinkIdOrLabel(canvasElement, 'email');
    const inputField = element.querySelector('[data-test="q-item-string-field"]');
    const textarea = inputField?.querySelector('textarea');
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
    // Use findByLinkIdOrLabel to wait for element to be rendered
    const element = await findByLinkIdOrLabel(canvasElement, 'comments');
    const inputField = element.querySelector('[data-test="q-item-text-field"]');
    const textarea = inputField?.querySelector('textarea');
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
    // Use findByLinkIdOrLabel to wait for element to be rendered
    const element = await findByLinkIdOrLabel(canvasElement, 'consent');
    const radioGroup = element.querySelector('[role="radiogroup"]');

    // For Boolean radio buttons, aria-describedby is on the individual radio inputs
    const radioInputs = radioGroup?.querySelectorAll('input[type="radio"]');
    const firstRadioInput = radioInputs?.[0];
    const ariaDescribedBy = firstRadioInput?.getAttribute('aria-describedby');

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

