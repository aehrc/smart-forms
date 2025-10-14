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
  qChoiceAnswerOptionCalculation,
  qChoiceAnswerValueSetCalculation
} from '../assets/questionnaires';
import {
  chooseSelectOption,
  findByLinkIdOrLabel,
  getAnswers,
  getInputText,
  qrFactory,
  questionnaireFactory
} from '../testUtils';
import { expect, fireEvent } from 'storybook/test';

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
const targetLinkId = 'smoking-status';
const targetCoding = {
  system: 'http://snomed.info/sct',
  code: '266919005',
  display: 'Never smoked'
};
const notTargetCoding = {
  system: 'http://snomed.info/sct',
  code: '77176002',
  display: 'Smoker'
};
const qChoiceAnswerOptionBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'choice',
    text: 'Smoking status',
    answerOption: [
      {
        valueCoding: targetCoding
      },
      {
        valueCoding: notTargetCoding
      }
    ]
  }
]);
const qrChoiceAnswerOptionBasicResponse = qrFactory([
  {
    linkId: targetLinkId,
    answer: [
      {
        valueCoding: targetCoding
      }
    ]
  }
]);

export const ChoiceAnswerOptionBasic: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, targetLinkId, targetCoding.display);

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(targetCoding));

    // Clear
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);

    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('textarea');
    expect(input?.value).toBe('');
  }
};

export const ChoiceAnswerOptionBasicResponse: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionBasic,
    questionnaireResponse: qrChoiceAnswerOptionBasicResponse
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, targetLinkId);

    expect(inputText).toBe(targetCoding.display);
  }
};

const valueSetTargetId = 'gender';

const valueSetTargetCoding = {
  code: 'female',
  display: 'Female',
  system: 'http://hl7.org/fhir/administrative-gender'
};

const qValueSetBasic = questionnaireFactory([
  {
    linkId: valueSetTargetId,
    text: 'Gender',
    type: 'choice',
    repeats: false,
    answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
  }
]);

export const ChoiceAnswerValueSetBasic: Story = {
  args: {
    questionnaire: qValueSetBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, valueSetTargetId, valueSetTargetCoding.display);

    const result = await getAnswers(valueSetTargetId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(valueSetTargetCoding));
  }
};

export const ChoiceAnswerValueSetBasicResponse: Story = {
  args: {
    questionnaire: qValueSetBasic,
    questionnaireResponse: qrFactory([
      {
        linkId: 'gender',
        text: 'Gender',
        answer: [{ valueCoding: valueSetTargetCoding }]
      }
    ])
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, valueSetTargetId);

    expect(inputText).toBe(valueSetTargetCoding.display);
  }
};

const initialTargetCoding = {
  code: 'T',
  system: 'http://fhir.medirecords.com/CodeSystem/awsHallucinationType',
  display: 'Test-Selected'
};
const initialNotTargetCoding = {
  code: 'N',
  system: 'http://fhir.medirecords.com/CodeSystem/awsHallucinationType',
  display: 'None'
};

// Story for ChoiceSelectAnswerOptions Using InitialSelected field set
export const ChoiceAnswerOptionsUsingInitialSelected: Story = {
  args: {
    questionnaire: questionnaireFactory([
      {
        text: 'Type',
        type: 'choice',
        linkId: 'awsHallucinationType',
        repeats: false,
        answerOption: [
          {
            valueCoding: initialNotTargetCoding
          },
          {
            valueCoding: initialTargetCoding,
            initialSelected: true
          }
        ]
      }
    ])
  },
  play: async ({ canvasElement }) => {
    const inputText = await getInputText(canvasElement, 'awsHallucinationType');

    expect(inputText).toBe(initialTargetCoding.display);
  }
};

// TODO: Move to separate storybook
export const ChoiceAnswerOptionCalculation: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionCalculation
  }
};

// TODO: Move to separate storybook
export const ChoiceAnswerValueSetCalculation: Story = {
  args: {
    questionnaire: qChoiceAnswerValueSetCalculation
  }
};
