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
import { qOpenChoiceAnswerAutoCompleteFromValueSet } from '../assets/questionnaires';
import {
  checkRadioOption,
  chooseSelectOption,
  findByLinkIdOrLabel,
  getAnswers,
  inputOpenChoiceOtherText,
  itemControlExtFactory,
  openLabelExtFactory,
  qrFactory,
  questionnaireFactory
} from '../testUtils';
import { expect, fireEvent, screen } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/OpenChoice',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const clinicCoding = {
  system: 'http://snomed.info/sct',
  code: '257585005',
  display: 'Clinic'
};
const targetText = 'Pharmacy';

const qOpenChoiceAnswerOptionBasic = questionnaireFactory([
  {
    linkId: 'health-check-location',
    text: 'Location of health check',
    type: 'open-choice',
    extension: [
      itemControlExtFactory('radio-button'),
      openLabelExtFactory('Other, please specify')
    ],
    answerOption: [
      {
        valueCoding: clinicCoding
      }
    ]
  }
]);
const targetLinkId = 'health-check-location';
const qrOpenChoiceAnswerOptionBasicResponse = qrFactory([
  {
    linkId: targetLinkId,
    text: 'Location of health check',
    answer: [
      {
        valueString: targetText
      }
    ]
  }
]);

export const OpenChoiceAnswerOptionBasic: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    await checkRadioOption(canvasElement, targetLinkId, clinicCoding.display);

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueCoding: clinicCoding }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);
    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);
    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = elementAfterClear.querySelector('input');

    expect(input).not.toBeChecked();
  }
};
const targetOtherLinkid = 'q-item-radio-open-label-box';
const otherVariantLinkid = 'Other, please specify:';
const otherTargetText = 'Other variant text';

export const OpenChoiceAnswerOptionBasicOther: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    await checkRadioOption(canvasElement, targetLinkId, otherVariantLinkid);
    await inputOpenChoiceOtherText(canvasElement, targetLinkId, otherTargetText);
    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueString: otherTargetText }));

    // Clear
    const button = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(button as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const qrAfterClear = await getAnswers(targetOtherLinkid);
    expect(qrAfterClear).toHaveLength(0);

    const resultAfterClear = await findByLinkIdOrLabel(canvasElement, targetLinkId);
    const input = resultAfterClear.querySelector('textarea');
    expect(input?.value).toBe('');
  }
};
const targetOperResId = 'state';
export const OpenChoiceAnswerOptionBasicResponse: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic,
    questionnaireResponse: qrOpenChoiceAnswerOptionBasicResponse
  },
  play: async () => {
    expect(screen.getByText(targetText)).toBeDefined();
  }
};
const qOpenChoiceAnswerValueSetBasic = questionnaireFactory([
  {
    extension: [
      itemControlExtFactory('radio-button'),
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
        valueString: 'Overseas state, please specify'
      }
    ],
    linkId: targetOperResId,
    text: 'State',
    type: 'open-choice',
    repeats: false,
    answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
  }
]);

const valueSetTargetCoding = {
  code: 'female',
  display: 'Female',
  system: 'http://hl7.org/fhir/administrative-gender'
};
export const OpenChoiceAnswerValueSetBasic: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, targetOperResId, valueSetTargetCoding.display);

    const result = await getAnswers(targetOperResId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(valueSetTargetCoding));

    // Clear
    const button = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(button as HTMLElement);
    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const qrAfterClear = await getAnswers('state');
    expect(qrAfterClear).toHaveLength(0);

    const resultAfterClear = await findByLinkIdOrLabel(canvasElement, targetOperResId);
    const input = resultAfterClear.querySelector('input');
    expect(input).not.toBeChecked();
  }
};
const valueSetText = 'Branbendurg';
const qrOpenChoiceAnswerValueSetBasicResponse = qrFactory([
  {
    linkId: targetOperResId,
    text: 'State',
    answer: [
      {
        valueString: valueSetText
      }
    ]
  }
]);
export const OpenChoiceAnswerValueSetBasicResponse: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic,
    questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, targetOperResId);
    const input = element.querySelector(
      'div[data-test="q-item-radio-open-label-box"] textarea'
    ) as HTMLTextAreaElement;

    expect(input?.value).toBe(valueSetText);
  }
};

//Story for OpenChoiceAutoCompleteItem in Tabbed environment
export const OpenChoiceAutoCompleteFromValueSetsWithTabs: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerAutoCompleteFromValueSet
    // questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  }
};
