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
  qQuantityCalculation,
  qQuantityUnitOption,
  qrQuantityBasicResponse,
  qrQuantityUnitOptionResponse
} from '../assets/questionnaires';
import { getAnswers, questionnaireFactory } from '../testUtils';
import { chooseQuantityOption, getInput } from '@aehrc/testing-toolkit';
import { expect, fireEvent } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Quantity',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const targetlinkId = 'body-weight'
const targetComparatorlinkId = 'body-weight-comparator'

const qQuantityBasic = questionnaireFactory([{
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
      valueCoding: { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kg' }
    }
  ],
  linkId: targetlinkId,
  type: 'quantity',
  repeats: false,
  text: 'Body Weight'
},
{
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
      valueCoding: { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kg' }
    }
  ],
  linkId: targetComparatorlinkId,
  type: 'quantity',
  repeats: false,
  text: 'Body Weight (with comparator symbol)'
}])

export const QuantityBasic: Story = {
  args: {
    questionnaire: qQuantityBasic
  },
  play: async ({ canvasElement }) => {

    await chooseQuantityOption(canvasElement, targetlinkId, 89, '<')
    await new Promise((resolve) => setTimeout(resolve, 500));

    const weight = await getAnswers(targetlinkId);

    expect(weight).toHaveLength(1);

    expect(weight[0].valueQuantity).toEqual(expect.objectContaining({ value: 89, comparator: '<' }));

    // Clear value  
    const clear = canvasElement.querySelector('button#Clear');

    fireEvent.click(clear as HTMLElement);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const resultAfterDelete = await getAnswers(targetlinkId);

    expect(resultAfterDelete).toHaveLength(0);
    await chooseQuantityOption(canvasElement, targetComparatorlinkId, 91, '>')
    await new Promise((resolve) => setTimeout(resolve, 600));
    const weightComparator = await getAnswers(targetComparatorlinkId);

    expect(weightComparator).toHaveLength(1);
    expect(weightComparator[0].valueQuantity).toEqual(expect.objectContaining({ value: 91, comparator: '>' }));
  }
};

export const QuantityBasicResponse: Story = {
  args: {
    questionnaire: qQuantityBasic,
    questionnaireResponse: qrQuantityBasicResponse
  }, play: async ({ canvasElement }) => {
    const inputName = await getInput(canvasElement, targetlinkId);
    const inputAge = await getInput(canvasElement, targetComparatorlinkId);

    expect(inputName[0].value).toBe("")
    expect(inputName[1].value).toBe("80")
    expect(inputAge[0].value).toBe('<')
    expect(inputAge[1].value).toBe('90')
  }
};

export const QuantityUnitOption: Story = {
  args: {
    questionnaire: qQuantityUnitOption
  },
  play: async ({ canvasElement }) => {

    await chooseQuantityOption(canvasElement, 'duration-single-unit', 7, '<');
    await new Promise((resolve) => setTimeout(resolve, 300));
    const singleUnitAnswer = await getAnswers('duration-single-unit');
    expect(singleUnitAnswer).toHaveLength(1);
    expect(singleUnitAnswer[0].valueQuantity).toEqual(
      expect.objectContaining({ value: 7 })
    );


    await chooseQuantityOption(canvasElement, 'duration-multi-unit', 3, '>');

    await new Promise((resolve) => setTimeout(resolve, 600));
    const multiUnitAnswer = await getAnswers('duration-multi-unit');
    expect(multiUnitAnswer).toHaveLength(1);
    expect(multiUnitAnswer[0].valueQuantity).toEqual(
      expect.objectContaining({ value: 3, unit: 'Day(s)', code: 'd' })
    );


    await chooseQuantityOption(canvasElement, 'duration-multi-unit-comparator', 2, '>');

    await new Promise((resolve) => setTimeout(resolve, 300));

    const multiUnitComparatorAnswer = await getAnswers('duration-multi-unit-comparator');
    expect(multiUnitComparatorAnswer).toHaveLength(1);
    expect(multiUnitComparatorAnswer[0].valueQuantity).toEqual(
      expect.objectContaining({ value: 2, comparator: '>', unit: 'Day(s)', code: 'd' })
    );
  }
};

export const QuantityUnitOptionResponse: Story = {
  args: {
    questionnaire: qQuantityUnitOption,
    questionnaireResponse: qrQuantityUnitOptionResponse
  },
  play: async ({ canvasElement }) => {

    const singleUnitInput = await getInput(canvasElement, 'duration-single-unit');
    expect(singleUnitInput[0].value).toBe('');
    expect(singleUnitInput[1].value).toBe('2');



    const multiUnitInput = await getInput(canvasElement, 'duration-multi-unit');
    expect(multiUnitInput[0].value).toBe('');
    expect(multiUnitInput[1].value).toBe('48');
    expect(multiUnitInput[2].value).toBe('Hour(s)');

    const multiUnitComparatorInput = await getInput(canvasElement, 'duration-multi-unit-comparator');
    expect(multiUnitComparatorInput[0].value).toBe('>=');
    expect(multiUnitComparatorInput[1].value).toBe('48');
    expect(multiUnitComparatorInput[2].value).toBe('Hour(s)');
  }
};

export const QuantityCalculation: Story = {
  args: {
    questionnaire: qQuantityCalculation
  }
};
