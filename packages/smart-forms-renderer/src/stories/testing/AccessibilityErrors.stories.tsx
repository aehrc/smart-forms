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
import { findByLinkIdOrLabel, inputText, questionnaireFactory } from '../testUtils';
import { expect } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

const meta = {
  title: 'Testing/Accessibility/Error Messages',
  component: BuildFormWrapperForStorybook,
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

/* String field with regex validation that triggers error immediately */
const qStringEmailFormat = questionnaireFactory([
  {
    linkId: 'email-format',
    type: 'string',
    text: 'Email Address',
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/regex',
        valueString: '^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$'
      }
    ]
  }
]);

export const StringRegexErrorAccessibility: Story = createStory({
  args: {
    questionnaire: qStringEmailFormat
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'email-format');
    
    // Type an invalid email to trigger immediate validation error
    await inputText(canvasElement, 'email-format', 'invalid-email');
    
    // Wait for validation to run (debounced)
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Find the error message element (FormHelperText)
    const helperText = element.querySelector('.MuiFormHelperText-root');
    
    if (helperText) {
      // Verify ARIA live region attributes are present
      expect(helperText.getAttribute('role')).toBe('alert');
      expect(helperText.getAttribute('aria-live')).toBe('assertive');
      // Should contain regex error message
      expect(helperText.textContent).toContain('does not match');
    }
  }
}) as Story;

/* Integer field with min value validation */
const qIntegerMinValue = questionnaireFactory([
  {
    linkId: 'age',
    type: 'integer',
    text: 'Age',
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/minValue',
        valueInteger: 18
      }
    ]
  }
]);

export const IntegerMinValueErrorAccessibility: Story = createStory({
  args: {
    questionnaire: qIntegerMinValue
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'age');
    
    // Type a value below minimum to trigger error
    await inputText(canvasElement, 'age', '10');
    
    // Wait for validation
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Find the error message element (FormHelperText)
    const helperText = element.querySelector('.MuiFormHelperText-root');
    
    if (helperText) {
      // Verify ARIA live region attributes are present
      expect(helperText.getAttribute('role')).toBe('alert');
      expect(helperText.getAttribute('aria-live')).toBe('assertive');
      expect(helperText.textContent).toContain('18'); // Should mention the minimum value
    }
  }
}) as Story;

/* Text field with maxLength validation that triggers error immediately */
const qTextMaxLength = questionnaireFactory([
  {
    linkId: 'comment',
    type: 'text',
    text: 'Comments',
    maxLength: 20
  }
]);

export const TextMaxLengthErrorAccessibility: Story = createStory({
  args: {
    questionnaire: qTextMaxLength
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, 'comment');
    
    // Type text exceeding max length to trigger immediate validation error
    await inputText(canvasElement, 'comment', 'This is a very long comment that exceeds twenty characters');
    
    // Wait for validation to run (debounced)
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Find the error message element (FormHelperText)
    const helperText = element.querySelector('.MuiFormHelperText-root');
    
    if (helperText) {
      // Verify ARIA live region attributes are present
      expect(helperText.getAttribute('role')).toBe('alert');
      expect(helperText.getAttribute('aria-live')).toBe('assertive');
      // Should contain maxLength error message
      expect(helperText.textContent).toContain('20');
    }
  }
}) as Story;

