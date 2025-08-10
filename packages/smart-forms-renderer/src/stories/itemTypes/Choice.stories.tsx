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



import { chooseSelectOption, getInputText } from '@aehrc/testing-toolkit';
import { getAnswers, qrFactory, questionnaireFactory } from '../testUtils';
import { expect, within } from 'storybook/test';

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
const targetText = 'Never smoked';
const targetlinkId = 'smoking-status';
const qChoiceAnswerOptionBasic = questionnaireFactory([
  {
    linkId: targetlinkId,
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
    ]
  }
])
const qrChoiceAnswerOptionBasicResponse = qrFactory([{
  linkId: targetlinkId, answer: [
    {
      valueCoding: {
        system: 'http://snomed.info/sct',
        code: '266919005',
        display: targetText
      }
    },
  ]
}])

export const ChoiceAnswerOptionBasic: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, `[data-linkid=${targetlinkId}]`, targetText);

    const result = await getAnswers(targetlinkId);

    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining({
      code: "266919005",
      display: targetText,
      system: "http://snomed.info/sct",
    }));
  }
};

export const ChoiceAnswerOptionBasicResponse: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionBasic,
    questionnaireResponse: qrChoiceAnswerOptionBasicResponse
  }, play: async ({ canvasElement }) => {

    const inputText = await getInputText(canvasElement, `[data-linkid=${targetlinkId}]`);

    expect(inputText).toBe(targetText)
  }
};

const valueSetTargetId = 'gender'
const valueSetTargetText = 'Female'
const valueSetTargetLinkId = 'q-item-choice-select-answer-value-set-field'

const qValueSetBasic = questionnaireFactory([
  {
    linkId: valueSetTargetId,
    text: 'Gender',
    type: 'choice',
    repeats: false,
    answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
  }
])

export const ChoiceAnswerValueSetBasic: Story = {
  args: {
    questionnaire: qValueSetBasic
  }, play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText(/gender/i);
    //ToDO: we need to wait selector ro work with it lower, now useless input do it 

    await chooseSelectOption(canvasElement, `[data-test=${valueSetTargetLinkId}]`, valueSetTargetText)

    const result = await getAnswers(valueSetTargetId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining({
      code: "female",
      display: valueSetTargetText,
      system: "http://hl7.org/fhir/administrative-gender",
    }));

  }
};

export const ChoiceAnswerValueSetBasicResponse: Story = {
  args: {
    questionnaire: qValueSetBasic,
    questionnaireResponse: qrFactory([{
      linkId: 'gender',
      text: 'Gender',
      answer: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        }
      ]
    }])
  }, play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText(/gender/i);
    //ToDO: we need to wait selector ro work with it lower, now useless input do it 
    const inputText = await getInputText(canvasElement, `[data-test=${valueSetTargetLinkId}]`);
    expect(inputText).toBe(valueSetTargetText)
  }
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
            valueCoding: {
              code: 'N',
              system: 'http://fhir.medirecords.com/CodeSystem/awsHallucinationType',
              display: 'None'
            }
          },

          {
            valueCoding: {
              code: 'T',
              system: 'http://fhir.medirecords.com/CodeSystem/awsHallucinationType',
              display: 'Test-Selected'
            },
            initialSelected: true
          }
        ]
      }
    ]),
  }, play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText(/type/i);
    //ToDO: we need to wait selector ro work with it lower, now useless input do it 
    const inputText = await getInputText(canvasElement, `[data-linkid="awsHallucinationType"]`);
    expect(inputText).toBe("Test-Selected")
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


