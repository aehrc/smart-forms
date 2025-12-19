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
  getAutocompleteTagText,
  getInputText,
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

    // Clear
    const clearButton = canvasElement.querySelector('button[title="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(aoTargetLinkId);
    expect(resultAfterClear).toHaveLength(0);

    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, aoTargetLinkId);
    const input = elementAfterClear.querySelector('input');
    expect(input?.value).toBe('');
  }
}) as Story;

export const ChoiceAnswerOptionBasicResponse: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionBasic,
    questionnaireResponse: qrChoiceAnswerOptionBasicResponse
  },
  play: async ({ canvasElement }) => {
    const inputText = await getAutocompleteTagText(canvasElement, aoTargetLinkId);

    expect(inputText).toBe(aoTargetValueCoding.display);
  }
}) as Story;

/* Choice AnswerOption InitialSelected story */
// Mutate basic questionnaire to have initialSelected on the first option
const qChoiceAnswerOptionInitialSelected = structuredClone(qChoiceAnswerOptionBasic);
qChoiceAnswerOptionInitialSelected.item[0].answerOption[0].initialSelected = true;

export const ChoiceAnswerOptionInitialSelected: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionInitialSelected
  },
  play: async ({ canvasElement }) => {
    const inputText = await getAutocompleteTagText(canvasElement, aoTargetLinkId);

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
