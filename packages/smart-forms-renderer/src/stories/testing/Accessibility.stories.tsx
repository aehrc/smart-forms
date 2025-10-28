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
import { questionnaireFactory, unitExtFactory, findByLinkIdOrLabel } from '../testUtils';
import { expect } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

const meta = {
  title: 'Testing/Accessibility',
  component: BuildFormWrapperForStorybook,
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Decimal with unit for accessibility testing */
const qDecimalAccessibility = questionnaireFactory([
  {
    linkId: 'height-decimal',
    type: 'decimal',
    repeats: false,
    text: 'Height',
    extension: [unitExtFactory('cm')]
  }
]);

export const DecimalUnitAccessibility: Story = createStory({
  args: {
    questionnaire: qDecimalAccessibility
  },
  play: async ({ canvasElement }) => {
    // Use the same pattern as other working tests in the codebase
    const element = await findByLinkIdOrLabel(canvasElement, 'height-decimal');
    const input = element.querySelector('input');

    // Verify the aria-label includes the unit for screen reader accessibility
    expect(input?.getAttribute('aria-label')).toBe('Height (cm)');
  }
}) as Story;

/* Integer with unit for accessibility testing */
const qIntegerAccessibility = questionnaireFactory([
  {
    linkId: 'heart-rate',
    type: 'integer',
    repeats: false,
    text: 'Heart Rate',
    extension: [unitExtFactory('beats per minute')]
  }
]);

export const IntegerUnitAccessibility: Story = createStory({
  args: {
    questionnaire: qIntegerAccessibility
  },
  play: async ({ canvasElement }) => {
    // Use the same pattern as other working tests in the codebase
    const element = await findByLinkIdOrLabel(canvasElement, 'heart-rate');
    const input = element.querySelector('input');

    // Verify the aria-label includes the unit for screen reader accessibility
    expect(input?.getAttribute('aria-label')).toBe('Heart Rate (beats per minute)');
  }
}) as Story;

/* Quantity with unit for accessibility testing */
const qQuantityAccessibility = questionnaireFactory([
  {
    linkId: 'height-quantity',
    type: 'quantity',
    repeats: false,
    text: 'Height',
    extension: [unitExtFactory('cm')]
  }
]);

export const QuantityUnitAccessibility: Story = createStory({
  args: {
    questionnaire: qQuantityAccessibility
  },
  play: async ({ canvasElement }) => {
    // Use the same pattern as other working Quantity tests in the codebase
    const element = await findByLinkIdOrLabel(canvasElement, 'height-quantity');
    const input = element.querySelector('div[data-test="q-item-quantity-field"] input');

    // Verify the aria-label includes the unit for screen reader accessibility
    expect(input?.getAttribute('aria-label')).toBe('Height (cm)');
  }
}) as Story;
