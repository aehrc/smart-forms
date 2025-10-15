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
const clinicCoding = {
  system: 'http://snomed.info/sct',
  code: '257585005',
  display: 'Clinic'
};
const targetText = 'Pharmacy';

const targetOtherLinkId = 'q-item-radio-open-label-box';
const otherVariantLinkId = 'Other, please specify:';
const otherTargetText = 'Other variant text';

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

const locationTargetLinkId = 'health-check-location';
const qrOpenChoiceAnswerOptionBasicResponse = questionnaireResponseFactory([
  {
    linkId: locationTargetLinkId,
    text: 'Location of health check',
    answer: [
      {
        valueString: targetText
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
    await checkRadioOption(canvasElement, locationTargetLinkId, clinicCoding.display);

    const result1 = await getAnswers(locationTargetLinkId);
    expect(result1).toHaveLength(1);
    expect(result1[0]).toEqual(expect.objectContaining({ valueCoding: clinicCoding }));

    // Clear value
    const clearButton = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear1 = await getAnswers(locationTargetLinkId);
    expect(resultAfterClear1).toHaveLength(0);
    const elementAfterClear = await findByLinkIdOrLabel(canvasElement, locationTargetLinkId);
    const input1 = elementAfterClear.querySelector('input');

    expect(input1).not.toBeChecked();

    /* Test 2: Select the "Clinic" option */
    await checkRadioOption(canvasElement, locationTargetLinkId, otherVariantLinkId);
    await inputOpenChoiceOtherText(canvasElement, locationTargetLinkId, otherTargetText);

    const result2 = await getAnswers(locationTargetLinkId);
    expect(result2).toHaveLength(1);
    expect(result2[0]).toEqual(expect.objectContaining({ valueString: otherTargetText }));

    // Clear
    const button = canvasElement.querySelector('button[aria-label="Clear"]');
    fireEvent.click(button as HTMLElement);

    // Await debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const qrAfterClear = await getAnswers(targetOtherLinkId);
    expect(qrAfterClear).toHaveLength(0);

    const resultAfterClear2 = await findByLinkIdOrLabel(canvasElement, locationTargetLinkId);
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
    expect(screen.getByText(targetText)).toBeDefined();
  }
}) as Story;

/* Open Choice AnswerValueSet Basic story */
const stateTargetLinkId = 'state';

const qOpenChoiceAnswerValueSetBasic = questionnaireFactory([
  {
    extension: [
      itemControlExtFactory('radio-button'),
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
        valueString: 'Overseas state, please specify'
      }
    ],
    linkId: stateTargetLinkId,
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

const valueSetText = 'Branbendurg';
const qrOpenChoiceAnswerValueSetBasicResponse = questionnaireResponseFactory([
  {
    linkId: stateTargetLinkId,
    text: 'State',
    answer: [
      {
        valueString: valueSetText
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
    const element = await findByLinkIdOrLabel(canvasElement, stateTargetLinkId);
    const input = element.querySelector(
      'div[data-test="q-item-radio-open-label-box"] textarea'
    ) as HTMLTextAreaElement;

    expect(input?.value).toBe(valueSetText);
  }
}) as Story;
