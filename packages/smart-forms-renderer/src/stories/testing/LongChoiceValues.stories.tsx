/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
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
import type { QuestionnaireItem, ValueSet } from 'fhir/r4';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  getAnswers,
  itemControlExtFactory,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

const meta = {
  title: 'Testing/Long Choice Values',
  component: BuildFormWrapperForStorybook,
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// These checks need a real layout, so they live in a story rather than a jsdom test.

const longDisplay =
  'Chronic obstructive pulmonary disease with acute lower respiratory infection and acute exacerbation, requiring review';
const longCoding = { system: 'http://example.org/conditions', code: 'copd', display: longDisplay };

const conditions: ValueSet = {
  resourceType: 'ValueSet',
  id: 'conditions',
  status: 'active',
  expansion: {
    timestamp: '2026-01-01',
    contains: [
      { system: 'http://example.org/conditions', code: 'asthma', display: 'Asthma' },
      longCoding
    ]
  }
};

const autocomplete = itemControlExtFactory('autocomplete');

// The four Autocomplete fields that use a single-line input with a wrapped copy of the value
const items: QuestionnaireItem[] = [
  { linkId: 'choice-value-set', text: 'Choice', type: 'choice', answerValueSet: '#conditions' },
  {
    linkId: 'open-choice-value-set',
    text: 'Open choice',
    type: 'open-choice',
    answerValueSet: '#conditions'
  },
  {
    linkId: 'choice-autocomplete',
    text: 'Choice search',
    type: 'choice',
    extension: [autocomplete],
    answerValueSet: 'http://snomed.info/sct?fhir_vs=isa/64572001'
  },
  {
    linkId: 'open-choice-autocomplete',
    text: 'Open choice search',
    type: 'open-choice',
    extension: [autocomplete],
    answerValueSet: 'http://snomed.info/sct?fhir_vs=isa/64572001'
  }
];

const qLongChoiceValues = questionnaireFactory(items, { contained: [conditions] });

const qrLongChoiceValues = questionnaireResponseFactory(
  items.map((item) => ({
    linkId: item.linkId,
    text: item.text,
    answer: [{ valueCoding: longCoding }]
  }))
);

function getInputRoot(combobox: HTMLElement): HTMLElement {
  return combobox.closest('.MuiInputBase-root') as HTMLElement;
}

// The full value is drawn as text on more than two lines
function expectWrapped(combobox: HTMLInputElement) {
  const wrappedText = within(getInputRoot(combobox)).getByText(longDisplay);
  expect(wrappedText.getBoundingClientRect().height).toBeGreaterThan(
    2 * parseFloat(getComputedStyle(wrappedText).lineHeight)
  );
}

export const LongSelectedValuesWrap: Story = createStory({
  args: {
    questionnaire: qLongChoiceValues,
    questionnaireResponse: qrLongChoiceValues
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const item of items) {
      const combobox = await canvas.findByRole<HTMLInputElement>('combobox', { name: item.text });
      const inputRoot = getInputRoot(combobox);

      // Not focused: the full value is drawn as wrapping text over the hidden single-line input,
      // which keeps the value for screen readers
      await waitFor(() => expect(combobox.value).toBe(longDisplay));
      expectWrapped(combobox);
      expect(getComputedStyle(combobox).opacity).toBe('0');
      const restingHeight = inputRoot.getBoundingClientRect().height;

      // Focused: the single-line input is shown and the field keeps its height, so the next click
      // lands where the user aimed
      await userEvent.click(combobox);
      await waitFor(() => expect(getComputedStyle(combobox).opacity).toBe('1'));
      expect(inputRoot.getBoundingClientRect().height).toBe(restingHeight);

      // The value-set dropdown opens its list 150 ms after focus; let that happen before leaving
      await new Promise((resolve) => setTimeout(resolve, 200));
      combobox.blur();
      await waitFor(() => expect(getComputedStyle(combobox).opacity).toBe('0'));
      expect(inputRoot.getBoundingClientRect().height).toBe(restingHeight);
    }
  }
});

export const KeyboardSelectionWraps: Story = createStory({
  args: {
    questionnaire: qLongChoiceValues
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The value set dropdown has local options; the search fields would need a terminology server.
    // Keyboard selection in every field is covered by choiceAutocompleteInput.test.tsx.
    for (const item of items.slice(0, 1)) {
      const combobox = await canvas.findByRole<HTMLInputElement>('combobox', { name: item.text });

      await userEvent.click(combobox);
      await userEvent.type(combobox, 'chronic');
      await screen.findByRole('option', { name: longDisplay });
      await userEvent.keyboard('{ArrowDown}{Enter}');

      await waitFor(async () =>
        expect(await getAnswers(item.linkId)).toEqual([
          expect.objectContaining({ valueCoding: longCoding })
        ])
      );

      combobox.blur();
      await waitFor(() => expect(getComputedStyle(combobox).opacity).toBe('0'));
      expectWrapped(combobox);
    }
  }
});
