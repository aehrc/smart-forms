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
  checkRadioOption,
  findByLinkIdOrLabel,
  getAnswers,
  inputOpenChoiceOtherText,
  itemControlExtFactory,
  openLabelExtFactory,
  questionnaireFactory,
  questionnaireResponseFactory
} from '../testUtils';
import { expect, fireEvent, screen } from 'storybook/test';
import { createStory } from '../storybookWrappers/createStory';

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

/* Open Choice AnswerOption Basic story */
const aoTargetLinkId = 'health-check-location';
const aoTargetValueCoding = {
  system: 'http://snomed.info/sct',
  code: '257585005',
  display: 'Clinic'
};
const aoTargetOpenLabelField = 'q-item-radio-open-label-box';
const aoTargetOpenLabelInput = 'Pharmacy';

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
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '257585005',
          display: 'Clinic'
        }
      },
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '264362003',
          display: 'Home'
        }
      },
      {
        valueCoding: {
          system: 'http://snomed.info/sct',
          code: '257698009',
          display: 'School'
        }
      }
    ]
  }
]);

const qrOpenChoiceAnswerOptionBasicResponse = questionnaireResponseFactory([
  {
    linkId: aoTargetLinkId,
    text: 'Location of health check',
    answer: [
      {
        valueString: aoTargetOpenLabelInput
      }
    ]
  }
]);

export const OpenChoiceAnswerOptionBasic: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    /* Test 1: Select the "Clinic" option */
    await checkRadioOption(canvasElement, aoTargetLinkId, aoTargetValueCoding.display);

    const result1 = await getAnswers(aoTargetLinkId);
    expect(result1).toHaveLength(1);
    expect(result1[0]).toEqual(expect.objectContaining({ valueCoding: aoTargetValueCoding }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear1 = await getAnswers(aoTargetLinkId);
    expect(resultAfterClear1).toHaveLength(0);
    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, aoTargetLinkId);
    const input1 = elementAfterClear.querySelector('input');

    expect(input1).not.toBeChecked();

    /* Test 2: Enter "Pharmacy" in open label field */
    await checkRadioOption(canvasElement, aoTargetLinkId, 'Other, please specify:');
    await inputOpenChoiceOtherText(canvasElement, aoTargetLinkId, aoTargetOpenLabelInput);

    const result2 = await getAnswers(aoTargetLinkId);
    expect(result2).toHaveLength(1);
    expect(result2[0]).toEqual(expect.objectContaining({ valueString: aoTargetOpenLabelInput }));

    // Clear
    const button = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(button as HTMLElement);

    // Await debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const qrAfterClear = await getAnswers(aoTargetOpenLabelField);
    expect(qrAfterClear).toHaveLength(0);

    const resultAfterClear2 = await findByLinkIdOrLabel(canvasElement, aoTargetLinkId);
    const input2 = resultAfterClear2.querySelector('textarea');
    expect(input2?.value).toBe('');
  }
}) as Story;

export const OpenChoiceAnswerOptionBasicResponse: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic,
    questionnaireResponse: qrOpenChoiceAnswerOptionBasicResponse
  },
  play: async () => {
    expect(screen.getByText(aoTargetOpenLabelInput)).toBeDefined();
  }
}) as Story;

/* Open Choice AnswerValueSet Basic story */
const avsTargetLinkId = 'state';
const avsTargetOpenLabelInput = 'Branbendurg';

const qOpenChoiceAnswerValueSetBasic = questionnaireFactory([
  {
    extension: [
      itemControlExtFactory('radio-button'),
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
        valueString: 'Overseas state, please specify'
      }
    ],
    linkId: avsTargetLinkId,
    text: 'State',
    type: 'open-choice',
    repeats: false,
    answerValueSet:
      'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
  }
]);

export const OpenChoiceAnswerValueSetBasic: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic
  }
}) as Story;

const qrOpenChoiceAnswerValueSetBasicResponse = questionnaireResponseFactory([
  {
    linkId: avsTargetLinkId,
    text: 'State',
    answer: [
      {
        valueString: avsTargetOpenLabelInput
      }
    ]
  }
]);

export const OpenChoiceAnswerValueSetBasicResponse: Story = createStory({
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic,
    questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  },
  play: async ({ canvasElement }) => {
    const element = await findByLinkIdOrLabel(canvasElement, avsTargetLinkId);
    const input = element.querySelector(
      'div[data-test="q-item-radio-open-label-box"] textarea'
    ) as HTMLTextAreaElement;

    expect(input?.value).toBe(avsTargetOpenLabelInput);
  }
}) as Story;
