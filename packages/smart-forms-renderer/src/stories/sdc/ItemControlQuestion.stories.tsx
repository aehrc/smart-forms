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
import { expect } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qChoiceCheckboxAnswerOption,
  qChoiceCheckboxAnswerValueSet,
  qChoiceDropDownAnswerOption,
  qChoiceDropDownAnswerValueSet,
  qChoiceRadioAnswerOption,
  qChoiceRadioAnswerValueSet,
  qOpenChoiceAutocomplete,
  qOpenChoiceCheckboxAnswerOption,
  qOpenChoiceCheckboxAnswerValueSet,
  qOpenChoiceRadioAnswerOption,
  qOpenChoiceRadioAnswerValueSet,
  qSliderStepValue
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import {
  checkCheckboxOtherOption,
  checkCheckboxOption,
  checkRadioOtherOption,
  checkRadioOption,
  chooseSliderValue,
  chooseSelectOption,
  getAnswers,
  inputInteger,
  inputText
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.2 Rendering > Control Appearance - itemControl Question',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AutocompleteOpenChoice: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAutocomplete
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, 'medical-history-condition', 'Chronic sinusitis');

    const answers = await getAnswers('medical-history-condition');
    expect(answers).toEqual([expect.objectContaining({ valueString: 'Chronic sinusitis' })]);
  }
}) as Story;

export const DropDownChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qChoiceDropDownAnswerOption
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, 'smoking-status', 'Smoker');

    const answers = await getAnswers('smoking-status');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({ code: '77176002', display: 'Smoker' })
      })
    ]);
  }
}) as Story;

export const DropDownChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qChoiceDropDownAnswerValueSet
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(
      canvasElement,
      'preferred-pronouns',
      'they/them/their/theirs/themselves'
    );

    const answers = await getAnswers('preferred-pronouns');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          code: 'LA29520-6',
          display: 'they/them/their/theirs/themselves'
        })
      })
    ]);
  }
}) as Story;

export const CheckboxChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qChoiceCheckboxAnswerOption
  },
  play: async ({ canvasElement }) => {
    await checkCheckboxOption(
      canvasElement,
      'red-flags-any-age-single',
      'Strong parental concerns'
    );
    await checkCheckboxOption(
      canvasElement,
      'red-flags-any-age-single',
      'Marked low tone (floppy) or high tone (stiff and tense) and significantly impacting on development and functional motor skills'
    );
    await checkCheckboxOption(canvasElement, 'red-flags-any-age-multi', 'Strong parental concerns');
    await checkCheckboxOption(
      canvasElement,
      'red-flags-any-age-multi',
      'Marked low tone (floppy) or high tone (stiff and tense) and significantly impacting on development and functional motor skills'
    );

    const singleAnswers = await getAnswers('red-flags-any-age-single');
    const multiAnswers = await getAnswers('red-flags-any-age-multi');

    expect(singleAnswers).toEqual([
      expect.objectContaining({
        valueString:
          'Marked low tone (floppy) or high tone (stiff and tense) and significantly impacting on development and functional motor skills'
      })
    ]);
    expect(multiAnswers).toEqual([
      expect.objectContaining({ valueString: 'Strong parental concerns' }),
      expect.objectContaining({
        valueString:
          'Marked low tone (floppy) or high tone (stiff and tense) and significantly impacting on development and functional motor skills'
      })
    ]);
  }
}) as Story;

export const CheckboxChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qChoiceCheckboxAnswerValueSet
  },
  play: async ({ canvasElement }) => {
    await checkCheckboxOption(canvasElement, 'primary-carers-single', 'Mother');
    await checkCheckboxOption(canvasElement, 'primary-carers-single', 'N/A');
    await checkCheckboxOption(canvasElement, 'primary-carers-repeat', 'Mother');
    await checkCheckboxOption(canvasElement, 'primary-carers-repeat', 'N/A');

    const singleAnswers = await getAnswers('primary-carers-single');
    const multiAnswers = await getAnswers('primary-carers-repeat');

    expect(singleAnswers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({ code: 'NA', display: 'N/A' })
      })
    ]);
    expect(multiAnswers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({ code: 'MTH', display: 'Mother' })
      }),
      expect.objectContaining({
        valueCoding: expect.objectContaining({ code: 'NA', display: 'N/A' })
      })
    ]);
  }
}) as Story;

export const CheckboxOpenChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qOpenChoiceCheckboxAnswerOption
  },
  play: async ({ canvasElement }) => {
    await checkCheckboxOption(canvasElement, 'otoscopic-findings-left-single', 'Clear and intact');
    await checkCheckboxOtherOption(
      canvasElement,
      'otoscopic-findings-left-single',
      'Manual left ear note (single)'
    );
    await checkCheckboxOption(canvasElement, 'otoscopic-findings-left-multi', 'Clear and intact');
    await checkCheckboxOtherOption(
      canvasElement,
      'otoscopic-findings-left-multi',
      'Manual left ear note (multi)'
    );

    const singleAnswers = await getAnswers('otoscopic-findings-left-single');
    const multiAnswers = await getAnswers('otoscopic-findings-left-multi');

    expect(singleAnswers).toEqual([
      expect.objectContaining({ valueString: 'Manual left ear note (single)' })
    ]);
    expect(multiAnswers).toEqual([
      expect.objectContaining({ valueString: 'Clear and intact' }),
      expect.objectContaining({ valueString: 'Manual left ear note (multi)' })
    ]);
  }
}) as Story;

export const CheckboxOpenChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qOpenChoiceCheckboxAnswerValueSet
  },
  play: async ({ canvasElement }) => {
    await checkCheckboxOption(canvasElement, 'state-single', 'Australian Capital Territory');
    await checkCheckboxOtherOption(canvasElement, 'state-single', 'Tasman Sea Island');
    await checkCheckboxOption(canvasElement, 'state-multi', 'Australian Capital Territory');
    await checkCheckboxOtherOption(canvasElement, 'state-multi', 'Coral Sea Island');

    const singleAnswers = await getAnswers('state-single');
    const multiAnswers = await getAnswers('state-multi');

    expect(singleAnswers).toEqual([expect.objectContaining({ valueString: 'Tasman Sea Island' })]);
    expect(multiAnswers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          code: 'ACT',
          display: 'Australian Capital Territory'
        })
      }),
      expect.objectContaining({ valueString: 'Coral Sea Island' })
    ]);
  }
}) as Story;

export const RadioChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qChoiceRadioAnswerOption
  },
  play: async ({ canvasElement }) => {
    await checkRadioOption(canvasElement, 'puberty-worries', 'Yes');

    const answers = await getAnswers('puberty-worries');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({ code: 'Y', display: 'Yes' })
      })
    ]);
  }
}) as Story;

export const RadioChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qChoiceRadioAnswerValueSet
  },
  play: async ({ canvasElement }) => {
    await checkRadioOption(canvasElement, 'registered-for-my-aged-care', 'Yes');

    const answers = await getAnswers('registered-for-my-aged-care');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({ code: 'Y', display: 'Yes' })
      })
    ]);
  }
}) as Story;

export const RadioOpenChoiceAnswerOption: Story = createStory({
  args: {
    questionnaire: qOpenChoiceRadioAnswerOption
  },
  play: async ({ canvasElement }) => {
    await checkRadioOtherOption(canvasElement, 'location-of-health-check', 'Community hall');

    const answers = await getAnswers('location-of-health-check');
    expect(answers).toEqual([expect.objectContaining({ valueString: 'Community hall' })]);
  }
}) as Story;

export const RadioOpenChoiceAnswerValueSet: Story = createStory({
  args: {
    questionnaire: qOpenChoiceRadioAnswerValueSet
  },
  play: async ({ canvasElement }) => {
    await checkRadioOtherOption(canvasElement, 'quit-status', 'Quit around 18 months ago');

    const answers = await getAnswers('quit-status');
    expect(answers).toEqual([
      expect.objectContaining({ valueString: 'Quit around 18 months ago' })
    ]);
  }
}) as Story;

export const SliderInteger: Story = createStory({
  args: {
    questionnaire: qSliderStepValue
  },
  play: async ({ canvasElement }) => {
    await chooseSliderValue(canvasElement, 'pain-measure', 5);

    const answers = await getAnswers('pain-measure');
    expect(answers).toEqual([expect.objectContaining({ valueInteger: 5 })]);
  }
}) as Story;
