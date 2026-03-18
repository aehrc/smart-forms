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
    // String fields use multiline TextField which renders as textarea
    const input = inputField?.querySelector('textarea');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

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

/* Integer with instructions for accessibility testing */
const qIntegerAccessibility = questionnaireFactory([
  {
    linkId: 'age',
    type: 'integer',
    repeats: false,
    text: 'Age',
    item: [
      {
        linkId: 'age-instructions',
        type: 'display',
        text: 'Please enter your age in years',
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

export const IntegerInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qIntegerAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'age');
    const inputField = element.querySelector('[data-test="q-item-integer-field"]');
    const input = inputField?.querySelector('input');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-age');

    const instructionsElement = document.getElementById('instructions-age');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Please enter your age in years');
  }
}) as Story;

/* Decimal with instructions for accessibility testing */
const qDecimalAccessibility = questionnaireFactory([
  {
    linkId: 'temperature',
    type: 'decimal',
    repeats: false,
    text: 'Body Temperature',
    item: [
      {
        linkId: 'temperature-instructions',
        type: 'display',
        text: 'Enter temperature in degrees Celsius',
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

export const DecimalInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qDecimalAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'temperature');
    const inputField = element.querySelector('[data-test="q-item-decimal-field"]');
    const input = inputField?.querySelector('input');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-temperature');

    const instructionsElement = document.getElementById('instructions-temperature');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Enter temperature in degrees Celsius');
  }
}) as Story;

/* Quantity with instructions for accessibility testing */
const qQuantityAccessibility = questionnaireFactory([
  {
    linkId: 'weight',
    type: 'quantity',
    repeats: false,
    text: 'Weight',
    item: [
      {
        linkId: 'weight-instructions',
        type: 'display',
        text: 'Enter your weight in kilograms',
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

export const QuantityInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qQuantityAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'weight');
    const inputField = element.querySelector('[data-test="q-item-quantity-field"]');
    const input = inputField?.querySelector('input');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-weight');

    const instructionsElement = document.getElementById('instructions-weight');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Enter your weight in kilograms');
  }
}) as Story;

/* URL with instructions for accessibility testing */
const qUrlAccessibility = questionnaireFactory([
  {
    linkId: 'website',
    type: 'url',
    repeats: false,
    text: 'Website URL',
    item: [
      {
        linkId: 'website-instructions',
        type: 'display',
        text: 'Enter a valid website URL starting with http:// or https://',
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

export const UrlInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qUrlAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'website');
    const inputField = element.querySelector('[data-test="q-item-url-field"]');
    // URL fields use multiline TextField which renders as textarea
    const input = inputField?.querySelector('textarea');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-website');

    const instructionsElement = document.getElementById('instructions-website');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain(
      'Enter a valid website URL starting with http:// or https://'
    );
  }
}) as Story;

/* Attachment with instructions for accessibility testing */
const qAttachmentAccessibility = questionnaireFactory([
  {
    linkId: 'document',
    type: 'attachment',
    repeats: false,
    text: 'Upload Document',
    item: [
      {
        linkId: 'document-instructions',
        type: 'display',
        text: 'Please upload your document in PDF format',
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

export const AttachmentInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qAttachmentAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'document');
    const uploadButton = element.querySelector('[data-test="q-item-attachment-file-input"]');
    const input = uploadButton?.querySelector('input[type="file"]');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-document');

    const instructionsElement = document.getElementById('instructions-document');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Please upload your document in PDF format');
  }
}) as Story;

/* Date with instructions for accessibility testing */
const qDateAccessibility = questionnaireFactory([
  {
    linkId: 'birthdate',
    type: 'date',
    repeats: false,
    text: 'Date of Birth',
    item: [
      {
        linkId: 'birthdate-instructions',
        type: 'display',
        text: 'Enter your date of birth in DD/MM/YYYY format',
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

export const DateInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qDateAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'birthdate');
    const inputField = element.querySelector('[data-test="date"]');
    const input = inputField?.querySelector('input');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-birthdate');

    const instructionsElement = document.getElementById('instructions-birthdate');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain(
      'Enter your date of birth in DD/MM/YYYY format'
    );
  }
}) as Story;

/* DateTime with instructions for accessibility testing */
const qDateTimeAccessibility = questionnaireFactory([
  {
    linkId: 'appointment',
    type: 'dateTime',
    repeats: false,
    text: 'Appointment Date and Time',
    item: [
      {
        linkId: 'appointment-instructions',
        type: 'display',
        text: 'Select the date and time for your appointment',
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

export const DateTimeInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qDateTimeAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'appointment');
    const inputField = element.querySelector('[data-test="date"]');
    const input = inputField?.querySelector('input');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-appointment');

    const instructionsElement = document.getElementById('instructions-appointment');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain(
      'Select the date and time for your appointment'
    );
  }
}) as Story;

/* Time with instructions for accessibility testing */
const qTimeAccessibility = questionnaireFactory([
  {
    linkId: 'waketime',
    type: 'time',
    repeats: false,
    text: 'Wake Up Time',
    item: [
      {
        linkId: 'waketime-instructions',
        type: 'display',
        text: 'Enter the time you typically wake up',
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

export const TimeInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qTimeAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'waketime');
    // CustomTimeField doesn't have a data-test attribute, so we look for the input directly
    const input = element.querySelector('input');
    const ariaDescribedBy = input?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-waketime');

    const instructionsElement = document.getElementById('instructions-waketime');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Enter the time you typically wake up');
  }
}) as Story;

/* Choice (radio buttons) with instructions for accessibility testing */
const qChoiceAccessibility = questionnaireFactory([
  {
    linkId: 'gender',
    type: 'choice',
    repeats: false,
    text: 'Gender',
    answerOption: [
      { valueCoding: { code: 'male', display: 'Male' } },
      { valueCoding: { code: 'female', display: 'Female' } },
      { valueCoding: { code: 'other', display: 'Other' } }
    ],
    item: [
      {
        linkId: 'gender-instructions',
        type: 'display',
        text: 'Please select your gender identity',
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

export const ChoiceInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qChoiceAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'gender');
    // CustomChoiceSelectField uses MUI Select, find the group wrapper with aria-describedby
    const groupWrapper = element.querySelector('[role="group"]');
    const ariaDescribedBy = groupWrapper?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-gender');

    const instructionsElement = document.getElementById('instructions-gender');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain('Please select your gender identity');
  }
}) as Story;

/* Open-Choice with instructions for accessibility testing */
const qOpenChoiceAccessibility = questionnaireFactory([
  {
    linkId: 'occupation',
    type: 'open-choice',
    repeats: false,
    text: 'Occupation',
    answerOption: [
      { valueCoding: { code: 'doctor', display: 'Doctor' } },
      { valueCoding: { code: 'nurse', display: 'Nurse' } },
      { valueCoding: { code: 'teacher', display: 'Teacher' } }
    ],
    item: [
      {
        linkId: 'occupation-instructions',
        type: 'display',
        text: 'Select your occupation or enter a custom value',
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

export const OpenChoiceInstructionsAccessibility: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAccessibility
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'occupation');
    const select = element.querySelector('[data-test="q-item-open-choice-select"]');
    const selectButton = select?.querySelector('[role="combobox"]');
    const ariaDescribedBy = selectButton?.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy).toContain('instructions-occupation');

    const instructionsElement = document.getElementById('instructions-occupation');
    expect(instructionsElement).toBeTruthy();
    expect(instructionsElement?.textContent).toContain(
      'Select your occupation or enter a custom value'
    );
  }
}) as Story;
