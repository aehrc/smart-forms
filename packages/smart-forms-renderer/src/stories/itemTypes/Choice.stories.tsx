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
  chooseSelectOption,
  findByLinkIdOrLabel,
  getAnswers,
  getInputText,
  itemControlExtFactory,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, fireEvent } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Choice',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

/* Choice AnswerOption Basic story */
const aoTargetLinkId = 'smoking-status';
const aoTargetValueCoding = {
  system: 'http://snomed.info/sct',
  code: '266919005',
  display: 'Never smoked'
};

const qChoiceAnswerOptionBasic = questionnaireFactory([
  {
    linkId: aoTargetLinkId,
    type: 'choice',
    text: 'Smoking status',
    answerOption: [
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '266919005',
          display: 'Never smoked'
        }
      },
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '77176002',
          display: 'Smoker'
        }
      },
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '8517006',
          display: 'Ex-smoker'
        }
      },
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '16090371000119103',
          display: 'Exposure to second hand tobacco smoke'
        }
      },
      { valueString: 'Wants to quit' },
      { valueString: 'Other tobacco use' }
    ]
  }
]);

const qrChoiceAnswerOptionBasicResponse = questionnaireResponseFactory([
  {
    linkId: aoTargetLinkId,
    text: 'Smoking status',
    answer: [
      {
        valueCoding: aoTargetValueCoding
      }
    ]
  }
]);

export const ChoiceAnswerOptionBasic: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, aoTargetLinkId, aoTargetValueCoding.display);

    const result = await getAnswers(aoTargetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(aoTargetValueCoding));
  }
}) as Story;

export const ChoiceAnswerOptionBasicResponse: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionBasic,
    questionnaireResponse: qrChoiceAnswerOptionBasicResponse
  },
  play: async ({ canvasElement }) => {
    // CustomChoiceSelectField uses Select, not Autocomplete
    const inputText = await getInputText(canvasElement, aoTargetLinkId);

    expect(inputText).toBe(aoTargetValueCoding.display);
  }
}) as Story;

/* Choice AnswerOption InitialSelected story */
// Mutate basic questionnaire to have initialSelected on the first option
const qChoiceAnswerOptionInitialSelected = structuredClone(qChoiceAnswerOptionBasic);
const initialSelectedItem = qChoiceAnswerOptionInitialSelected.item?.[0];
const initialSelectedAnswerOption = initialSelectedItem?.answerOption?.[0];

if (!initialSelectedAnswerOption) {
  throw new Error('Choice story setup error: expected first answerOption to exist');
}

initialSelectedAnswerOption.initialSelected = true;

export const ChoiceAnswerOptionInitialSelected: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionInitialSelected
  },
  play: async ({ canvasElement }) => {
    // CustomChoiceSelectField uses Select, not Autocomplete
    const inputText = await getInputText(canvasElement, aoTargetLinkId);

    expect(inputText).toBe(aoTargetValueCoding.display);
  }
}) as Story;

/* Choice AnswerValueSet Basic story */
const avsTargetLinkId = 'gender';
const avsTargetValueCoding = {
  code: 'female',
  display: 'Female',
  system: 'http://hl7.org/fhir/administrative-gender'
};

const qChoiceAnswerValueSetBasic = questionnaireFactory([
  {
    linkId: avsTargetLinkId,
    text: 'Gender',
    type: 'choice',
    repeats: false,
    answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
  }
]);

const qrChoiceAnswerValueSetBasic = questionnaireResponseFactory([
  {
    linkId: 'gender',
    text: 'Gender',
    answer: [{ valueCoding: avsTargetValueCoding }]
  }
]);

export const ChoiceAnswerValueSetBasic: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerValueSetBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, avsTargetLinkId, avsTargetValueCoding.display);

    const result = await getAnswers(avsTargetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(avsTargetValueCoding));
  }
}) as Story;

export const ChoiceAnswerValueSetBasicResponse: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerValueSetBasic,
    questionnaireResponse: qrChoiceAnswerValueSetBasic
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, avsTargetLinkId);

    expect(inputText).toBe(avsTargetValueCoding.display);
  }
}) as Story;

/* Choice AnswerOption falsy values story (valueInteger: 0 and valueString: '') */
const falsyIntegerOptions = [0, 1, 2, 3, 4, 5].map((n) => ({ valueInteger: n }));

const qChoiceAnswerOptionFalsyValues = questionnaireFactory([
  {
    linkId: 'severity-radio',
    text: 'Severity (Radio)',
    type: 'choice',
    repeats: false,
    extension: [itemControlExtFactory('radio-button')],
    answerOption: falsyIntegerOptions
  },
  {
    linkId: 'severity-checkbox',
    text: 'Severity (Checkbox)',
    type: 'choice',
    repeats: true,
    extension: [itemControlExtFactory('check-box')],
    answerOption: falsyIntegerOptions
  },
  {
    linkId: 'severity-select',
    text: 'Severity (Select)',
    type: 'choice',
    repeats: false,
    answerOption: falsyIntegerOptions
  },
  {
    linkId: 'blank-option-radio',
    text: 'Blank option (Radio)',
    type: 'choice',
    repeats: false,
    extension: [itemControlExtFactory('radio-button')],
    answerOption: [{ valueString: '' }, { valueString: 'A' }, { valueString: 'B' }]
  },
  {
    linkId: 'initial-zero-radio',
    text: 'Initially selected 0 (Radio)',
    type: 'choice',
    repeats: false,
    extension: [itemControlExtFactory('radio-button')],
    answerOption: [{ valueInteger: 0, initialSelected: true }, { valueInteger: 1 }]
  }
]);

async function clickInput(canvasElement: HTMLElement, linkId: string, selector: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const input = questionElement.querySelector(`${selector} input`);
  if (!input) {
    throw new Error(`${selector} input was not found inside [data-linkid=${linkId}] block`);
  }

  fireEvent.click(input);
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export const ChoiceAnswerOptionFalsyValues: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionFalsyValues
  },
  play: async ({ canvasElement }) => {
    // initialSelected on a valueInteger 0 option pre-fills the answer
    const initialAnswers = await getAnswers('initial-zero-radio');
    expect(initialAnswers).toHaveLength(1);
    expect(initialAnswers[0].valueInteger).toBe(0);

    // Radio: all six options render, and 0 can be selected
    const radioElement = await findByLinkIdOrLabel(canvasElement, 'severity-radio');
    expect(radioElement.querySelectorAll('[data-test^="radio-single-"]')).toHaveLength(6);
    await clickInput(canvasElement, 'severity-radio', '[data-test="radio-single-0"]');
    const radioAnswers = await getAnswers('severity-radio');
    expect(radioAnswers).toHaveLength(1);
    expect(radioAnswers[0].valueInteger).toBe(0);

    // Checkbox: all six options render, and 0 can be checked
    const checkboxElement = await findByLinkIdOrLabel(canvasElement, 'severity-checkbox');
    expect(checkboxElement.querySelectorAll('[data-test^="checkbox-single-"]')).toHaveLength(6);
    await clickInput(canvasElement, 'severity-checkbox', '[data-test="checkbox-single-0"]');
    const checkboxAnswers = await getAnswers('severity-checkbox');
    expect(checkboxAnswers).toHaveLength(1);
    expect(checkboxAnswers[0].valueInteger).toBe(0);

    // Select: the 0 option has a "0" label and can be selected
    await chooseSelectOption(canvasElement, 'severity-select', '0');
    const selectAnswers = await getAnswers('severity-select');
    expect(selectAnswers).toHaveLength(1);
    expect(selectAnswers[0].valueInteger).toBe(0);
    expect(await getInputText(canvasElement, 'severity-select')).toBe('0');

    // Blank-string radio: all three options render, and none is checked before the user picks one
    const blankElement = await findByLinkIdOrLabel(canvasElement, 'blank-option-radio');
    expect(blankElement.querySelectorAll('[data-test^="radio-single-"]')).toHaveLength(3);
    expect(blankElement.querySelectorAll('input[type="radio"]:checked')).toHaveLength(0);
    await clickInput(canvasElement, 'blank-option-radio', '[data-test="radio-single-"]');
    const blankAnswers = await getAnswers('blank-option-radio');
    expect(blankAnswers).toHaveLength(1);
    expect(blankAnswers[0].valueString).toBe('');
  }
}) as Story;
