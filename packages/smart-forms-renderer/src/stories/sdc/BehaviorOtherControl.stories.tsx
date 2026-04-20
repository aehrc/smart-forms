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
import { expect, waitFor, within } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qEnableBehaviorAll,
  qEnableBehaviorAny,
  qEnableWhen,
  qEnableWhenExpressionSimple,
  qEnableWhenExpressionTabs,
  qEnableWhenMultiCheckbox,
  qInitialRepeats,
  qInitialSingle,
  qTargetConstraintMultiple,
  qTargetConstraintSimple,
  qText
} from '../assets/questionnaires'; // More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
import { createStory } from '../storybookWrappers/createStory';
import {
  checkCheckBox,
  checkCheckboxOption,
  checkRadioOption,
  findByLinkIdOrLabel,
  getAnswers,
  getGroupAnswers,
  inputInteger,
  inputText,
  queryByLinkIdOrLabel
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/10.1.4 Behavior > Other Control',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const InitialSingle: Story = createStory({
  args: {
    questionnaire: qInitialSingle
  },
  play: async () => {
    // Wait for the answers to be updated in the store
    const answers = await getAnswers('patient-age');
    expect(answers).toEqual([expect.objectContaining({ valueInteger: 30 })]);
  }
}) as Story;

export const InitialRepeats: Story = createStory({
  args: {
    questionnaire: qInitialRepeats
  },
  play: async () => {
    // Wait for the answers to be updated in the store
    await new Promise((resolve) => setTimeout(resolve, 500));
    const answers = await getGroupAnswers('container', 'visited-states');
    expect(answers).toHaveLength(5);
    expect(answers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          valueCoding: expect.objectContaining({
            code: 'ACT',
            display: 'Australian Capital Territory'
          })
        }),
        expect.objectContaining({
          valueCoding: expect.objectContaining({ code: 'NSW', display: 'New South Wales' })
        })
      ])
    );
  }
}) as Story;

export const EnableWhen: Story = createStory({
  args: {
    questionnaire: qEnableWhen
  },
  play: async ({ canvasElement }) => {
    const visibilityExpectations: Array<{ option: string; shouldBeVisible: boolean }> = [
      { option: 'No', shouldBeVisible: false },
      { option: 'N/A', shouldBeVisible: false },
      { option: 'Yes', shouldBeVisible: true }
    ];

    for (const { option, shouldBeVisible } of visibilityExpectations) {
      await checkRadioOption(canvasElement, 'registered-for-my-aged-care', option);

      const dependentField = queryByLinkIdOrLabel(canvasElement, 'my-aged-care-number');
      if (shouldBeVisible) {
        expect(dependentField).toBeTruthy();
      } else {
        expect(dependentField).toBeNull();
      }
    }
  }
}) as Story;

export const EnableWhenMultiCheckbox: Story = createStory({
  args: {
    questionnaire: qEnableWhenMultiCheckbox
  },
  play: async ({ canvasElement }) => {
    expect(queryByLinkIdOrLabel(canvasElement, 'clinical-guidance-a')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'clinical-guidance-b')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'clinical-guidance-c')).toBeNull();

    await checkCheckboxOption(
      canvasElement,
      'select-conditions-list',
      'Condition A (Displays Clinical guidance: Condition A question)'
    );
    await checkCheckboxOption(
      canvasElement,
      'select-conditions-list',
      'Condition B (Displays Clinical guidance: Condition B question)'
    );

    expect(queryByLinkIdOrLabel(canvasElement, 'clinical-guidance-a')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'clinical-guidance-b')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'clinical-guidance-c')).toBeNull();
  }
}) as Story;

export const EnableBehaviorAll: Story = createStory({
  args: {
    questionnaire: qEnableBehaviorAll
  },
  play: async ({ canvasElement }) => {
    expect(queryByLinkIdOrLabel(canvasElement, 'has-heart-condition')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'medication-list')).toBeNull();

    await checkCheckBox(canvasElement, 'has-heart-disease');
    expect(queryByLinkIdOrLabel(canvasElement, 'has-heart-condition')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'medication-list')).toBeNull();

    await checkCheckBox(canvasElement, 'has-heart-condition');
    expect(queryByLinkIdOrLabel(canvasElement, 'medication-list')).toBeTruthy();
  }
}) as Story;

export const EnableBehaviorAny: Story = createStory({
  args: {
    questionnaire: qEnableBehaviorAny
  },
  play: async ({ canvasElement }) => {
    const visibilityExpectations: Array<{ option: string; shouldBeVisible: boolean }> = [
      { option: 'Never smoked', shouldBeVisible: false },
      { option: 'Smoker', shouldBeVisible: true },
      { option: 'Ex-smoker', shouldBeVisible: true },
      { option: 'Exposure to second hand tobacco smoke', shouldBeVisible: false },
      { option: 'Wants to quit', shouldBeVisible: true },
      { option: 'Other tobacco use', shouldBeVisible: false }
    ];

    for (const { option, shouldBeVisible } of visibilityExpectations) {
      await checkRadioOption(canvasElement, 'smoking-status', option);

      const dependentField = queryByLinkIdOrLabel(canvasElement, 'how-long-as-a-smoker');
      if (shouldBeVisible) {
        expect(dependentField).toBeTruthy();
      } else {
        expect(dependentField).toBeNull();
      }
    }
  }
}) as Story;

export const EnableWhenExpressionSimple: Story = createStory({
  args: {
    questionnaire: qEnableWhenExpressionSimple
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, 'patient-age', 4);
    expect(queryByLinkIdOrLabel(canvasElement, 'patient-priorities-less-than-6')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'patient-priorities-6-to-12')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'patient-priorities-more-than-12')).toBeNull();

    await inputInteger(canvasElement, 'patient-age', 20);
    expect(queryByLinkIdOrLabel(canvasElement, 'patient-priorities-less-than-6')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'patient-priorities-more-than-12')).toBeTruthy();
  }
}) as Story;

export const EnableWhenExpressionTabs: Story = createStory({
  args: {
    questionnaire: qEnableWhenExpressionTabs
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, 'patient-age', 4);
    expect(queryByLinkIdOrLabel(canvasElement, 'red-flags-early-identification')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'substance-use')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'sexual-health')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'genitourinary-and-sexual-health')).toBeNull();

    await inputInteger(canvasElement, 'patient-age', 20);
    expect(queryByLinkIdOrLabel(canvasElement, 'red-flags-early-identification')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'substance-use')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'sexual-health')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'genitourinary-and-sexual-health')).toBeNull();

    await inputInteger(canvasElement, 'patient-age', 55);
    expect(queryByLinkIdOrLabel(canvasElement, 'red-flags-early-identification')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'substance-use')).toBeTruthy();
    expect(queryByLinkIdOrLabel(canvasElement, 'sexual-health')).toBeNull();
    expect(queryByLinkIdOrLabel(canvasElement, 'genitourinary-and-sexual-health')).toBeTruthy();
  }
}) as Story;

export const TargetConstraintSimple: Story = createStory({
  args: {
    questionnaire: qTargetConstraintSimple
  },
  play: async ({ canvasElement }) => {
    const constraintMessage =
      'Systolic blood pressure should not be less than diastolic blood pressure.';

    await inputInteger(canvasElement, '1.1', 80);
    await inputInteger(canvasElement, '1.2', 120);
    const systolicAnswer = await findByLinkIdOrLabel(canvasElement, '1.1');
    await waitFor(() => {
      expect(within(systolicAnswer).queryByText(constraintMessage)).toBeTruthy();
    });

    await inputInteger(canvasElement, '1.1', 120);
    await inputInteger(canvasElement, '1.2', 80);
    await waitFor(() => {
      expect(within(systolicAnswer).queryByText(constraintMessage)).toBeNull();
    });
  }
}) as Story;

export const TargetConstraintMulti: Story = createStory({
  args: {
    questionnaire: qTargetConstraintMultiple
  },
  play: async ({ canvasElement }) => {
    const constraintMessage = 'Text and special characters, i.e. +, -, () are not allowed';

    await inputText(canvasElement, 'aus-contact', '04(12)34+abc');
    const ausContactAnswer = await findByLinkIdOrLabel(canvasElement, 'aus-contact');
    await waitFor(() => {
      expect(within(ausContactAnswer).queryByText(constraintMessage)).toBeTruthy();
    });

    await inputText(canvasElement, 'aus-contact', '0412345678');
    await waitFor(() => {
      expect(within(ausContactAnswer).queryByText(constraintMessage)).toBeNull();
    });
  }
}) as Story;

export const Text: Story = createStory({
  args: {
    questionnaire: qText
  }
}) as Story;
