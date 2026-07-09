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
import { expect, screen, userEvent } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qAnswerExpression,
  qAnswerOption,
  qAnswerOptionToggleExpressionAnswerOption,
  qAnswerOptionToggleExpressionContained,
  qAnswerValueSet,
  qReadOnlyDuplicate,
  qRepeatsDuplicate,
  qRequiredDuplicate,
  qUnitOptionDuplicate
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import { chooseSelectOption, findByLinkIdOrLabel, getAnswers } from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/10.1.2 Behavior > Choice Restriction',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AnswerOption: Story = createStory({
  args: {
    questionnaire: qAnswerOption
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, 'smoking-status', 'Smoker');

    const answers = await getAnswers('smoking-status');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://snomed.info/sct',
          code: '77176002',
          display: 'Smoker'
        })
      })
    ]);
  }
}) as Story;

export const AnswerValueSet: Story = createStory({
  args: {
    questionnaire: qAnswerValueSet
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, 'medical-history', 'Asthma');

    const answers = await getAnswers('medical-history');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://snomed.info/sct',
          code: '195967001',
          display: 'Asthma'
        })
      })
    ]);
  }
}) as Story;

export const AnswerExpression: Story = createStory({
  args: {
    questionnaire: qAnswerExpression
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, 'language', 'English');

    const answers = await getAnswers('language');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'urn:ietf:bcp:47',
          code: 'en',
          display: 'English'
        })
      })
    ]);
  }
}) as Story;

export const AnswerOptionToggleExpressionAnswerOption: Story = createStory({
  args: {
    questionnaire: qAnswerOptionToggleExpressionAnswerOption
  },
  play: async ({ canvasElement, step }) => {
    const detailDropdownLinkId = 'hallucination-details-dropdown';
    const detailCheckboxLinkId = 'hallucination-details-checkbox';
    const detailRadioLinkId = 'hallucination-details-radio';

    const assertDetailOptionsDisabledState = async (briefDisabled: boolean) => {
      const dropdownElement = await findByLinkIdOrLabel(canvasElement, detailDropdownLinkId);
      const dropdown = dropdownElement.querySelector('[role="combobox"]');
      if (!dropdown) {
        throw new Error(
          `Dropdown was not found inside [data-linkid=${detailDropdownLinkId}] block`
        );
      }
      await userEvent.click(dropdown);

      const lucidOption = await screen.findByRole('option', { name: 'Lucid' });
      const briefOption = await screen.findByRole('option', { name: 'Brief' });
      expect(lucidOption).toHaveAttribute('aria-disabled', 'false');
      expect(briefOption).toHaveAttribute('aria-disabled', briefDisabled ? 'true' : 'false');
      await userEvent.keyboard('{Escape}');

      const checkboxElement = await findByLinkIdOrLabel(canvasElement, detailCheckboxLinkId);
      const lucidCheckbox = checkboxElement.querySelector(
        'span[data-test="checkbox-single-Lucid"] input'
      );
      const briefCheckbox = checkboxElement.querySelector(
        'span[data-test="checkbox-single-Brief"] input'
      );
      expect(lucidCheckbox).not.toBeDisabled();
      if (briefDisabled) {
        expect(briefCheckbox).toBeDisabled();
      } else {
        expect(briefCheckbox).not.toBeDisabled();
      }

      const radioElement = await findByLinkIdOrLabel(canvasElement, detailRadioLinkId);
      const lucidRadio = radioElement.querySelector('span[data-test="radio-single-Lucid"] input');
      const briefRadio = radioElement.querySelector('span[data-test="radio-single-Brief"] input');
      expect(lucidRadio).not.toBeDisabled();
      if (briefDisabled) {
        expect(briefRadio).toBeDisabled();
      } else {
        expect(briefRadio).not.toBeDisabled();
      }
    };

    await step('Type None keeps only Lucid selectable', async () => {
      await chooseSelectOption(canvasElement, 'hallucination-type', 'None');
      await assertDetailOptionsDisabledState(true);
    });

    await step('Type Visual enables Brief in all detail questions', async () => {
      await chooseSelectOption(canvasElement, 'hallucination-type', 'Visual');
      await assertDetailOptionsDisabledState(false);
    });
  }
}) as Story;

export const AnswerOptionToggleExpressionAnswerValueSetContained: Story = createStory({
  args: {
    questionnaire: qAnswerOptionToggleExpressionContained
  },
  play: async ({ canvasElement, step }) => {
    const detailDropdownLinkId = 'hallucination-details-dropdown';
    const detailCheckboxLinkId = 'hallucination-details-checkbox';
    const detailRadioLinkId = 'hallucination-details-radio';
    const assertDetailOptionsDisabledState = async (briefDisabled: boolean) => {
      const dropdownElement = await findByLinkIdOrLabel(canvasElement, detailDropdownLinkId);
      const dropdown = dropdownElement.querySelector('[role="combobox"]');
      if (!dropdown) {
        throw new Error(
          `Dropdown was not found inside [data-linkid=${detailDropdownLinkId}] block`
        );
      }
      await userEvent.click(dropdown);

      const lucidOption = await screen.findByRole('option', { name: 'Lucid' });
      const briefOption = await screen.findByRole('option', { name: 'Brief' });
      expect(lucidOption).toHaveAttribute('aria-disabled', 'false');
      expect(briefOption).toHaveAttribute('aria-disabled', briefDisabled ? 'true' : 'false');
      await userEvent.keyboard('{Escape}');

      const checkboxElement = await findByLinkIdOrLabel(canvasElement, detailCheckboxLinkId);
      const lucidCheckbox = checkboxElement.querySelector(
        'span[data-test="checkbox-single-Lucid"] input'
      );
      const briefCheckbox = checkboxElement.querySelector(
        'span[data-test="checkbox-single-Brief"] input'
      );
      expect(lucidCheckbox).not.toBeDisabled();
      if (briefDisabled) {
        expect(briefCheckbox).toBeDisabled();
      } else {
        expect(briefCheckbox).not.toBeDisabled();
      }

      const radioElement = await findByLinkIdOrLabel(canvasElement, detailRadioLinkId);
      const lucidRadio = radioElement.querySelector('span[data-test="radio-single-Lucid"] input');
      const briefRadio = radioElement.querySelector('span[data-test="radio-single-Brief"] input');
      expect(lucidRadio).not.toBeDisabled();
      if (briefDisabled) {
        expect(briefRadio).toBeDisabled();
      } else {
        expect(briefRadio).not.toBeDisabled();
      }
    };

    await step('Type None keeps only Lucid selectable', async () => {
      await chooseSelectOption(canvasElement, 'hallucination-type', 'None');
      await assertDetailOptionsDisabledState(true);
    });

    await step('Type Visual enables Brief in all detail questions', async () => {
      await chooseSelectOption(canvasElement, 'hallucination-type', 'Visual');
      await assertDetailOptionsDisabledState(false);
    });
  }
}) as Story;

export const Required: Story = createStory({
  args: {
    questionnaire: qRequiredDuplicate
  }
}) as Story;

export const Repeats: Story = createStory({
  args: {
    questionnaire: qRepeatsDuplicate
  }
}) as Story;

export const ReadOnly: Story = createStory({
  args: {
    questionnaire: qReadOnlyDuplicate
  }
}) as Story;

export const UnitOption: Story = createStory({
  args: {
    questionnaire: qUnitOptionDuplicate
  }
}) as Story;
