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
import { chooseQuantityOption, findByLinkId } from '@aehrc/testing-toolkit';
import { expect, fireEvent } from 'storybook/test';

const meta = {
  title: 'ItemType/Quantity',
  component: BuildFormWrapperForStorybook,
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

const targetlinkId = 'body-weight';
const targetComparatorlinkId = 'body-weight-comparator';

const qQuantityBasic = questionnaireFactory([
  {
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

]);
const qQuantityBasicComparator = questionnaireFactory([
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
  }

]);

export const QuantityBasicInput: Story = {
  args: { questionnaire: qQuantityBasic },
  play: async ({ canvasElement }) => {
    await chooseQuantityOption(canvasElement, targetlinkId, 89, '<');

    const weight = await getAnswers(targetlinkId);
    expect(weight).toHaveLength(1);
    expect(weight[0].valueQuantity).toEqual(expect.objectContaining({ value: 89, comparator: '<' }));


    const clearButton = canvasElement.querySelectorAll('button[aria-label="Clear"]');
    fireEvent.click(clearButton[0] as HTMLElement);
    fireEvent.click(clearButton[1] as HTMLElement);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const resultAfterClear = await getAnswers(targetlinkId);
    expect(resultAfterClear).toHaveLength(0);
  }
};

export const QuantityBasicComparator: Story = {
  args: { questionnaire: qQuantityBasicComparator },
  play: async ({ canvasElement }) => {
    await chooseQuantityOption(canvasElement, targetComparatorlinkId, 91, '>');

    const weightComparator = await getAnswers(targetComparatorlinkId);
    expect(weightComparator).toHaveLength(1);
    expect(weightComparator[0].valueQuantity).toEqual(
      expect.objectContaining({ value: 91, comparator: '>' })
    );
  }
};

export const QuantityBasicResponseWeight: Story = {
  args: { questionnaire: qQuantityBasic, questionnaireResponse: qrQuantityBasicResponse },
  play: async ({ canvasElement }) => {
    const element = await findByLinkId(canvasElement, targetlinkId);
    const comparator = element.querySelector('div[data-test="comparator"] input');
    const weight = element.querySelector('div[data-test="q-item-quantity-field"] input');

    expect(comparator?.getAttribute('value')).toBe('');
    expect(weight?.getAttribute('value')).toBe('80');
  }
};

export const QuantityBasicResponseComparator: Story = {
  args: { questionnaire: qQuantityBasicComparator, questionnaireResponse: qrQuantityBasicResponse },
  play: async ({ canvasElement }) => {
    const elementComp = await findByLinkId(canvasElement, targetComparatorlinkId);
    const comparatorComp = elementComp.querySelector('div[data-test="comparator"] input');
    const weightComp = elementComp.querySelector('div[data-test="q-item-quantity-field"] input');

    expect(comparatorComp?.getAttribute('value')).toBe('<');
    expect(weightComp?.getAttribute('value')).toBe('90');
  }
};

export const QuantityUnitOptionSingle: Story = {
  args: { questionnaire: qQuantityUnitOption },
  play: async ({ canvasElement }) => {
    await chooseQuantityOption(canvasElement, 'duration-single-unit', 7, '<');

    const singleUnitAnswer = await getAnswers('duration-single-unit');
    expect(singleUnitAnswer).toHaveLength(1);
    expect(singleUnitAnswer[0].valueQuantity).toEqual(expect.objectContaining({ value: 7 }));
  }
};

export const QuantityUnitOptionMulti: Story = {
  args: { questionnaire: qQuantityUnitOption },
  play: async ({ canvasElement }) => {
    await chooseQuantityOption(canvasElement, 'duration-multi-unit', 3, '>');

    const multiUnitAnswer = await getAnswers('duration-multi-unit');
    expect(multiUnitAnswer).toHaveLength(1);
    expect(multiUnitAnswer[0].valueQuantity).toEqual(
      expect.objectContaining({ value: 3, unit: 'Day(s)', code: 'd' })
    );
  }
};

export const QuantityUnitOptionMultiComparator: Story = {
  args: { questionnaire: qQuantityUnitOption },
  play: async ({ canvasElement }) => {
    await chooseQuantityOption(canvasElement, 'duration-multi-unit-comparator', 2, '>');

    const multiUnitComparatorAnswer = await getAnswers('duration-multi-unit-comparator');
    expect(multiUnitComparatorAnswer).toHaveLength(1);
    expect(multiUnitComparatorAnswer[0].valueQuantity).toEqual(
      expect.objectContaining({ value: 2, comparator: '>', unit: 'Day(s)', code: 'd' })
    );
  }
};

export const QuantityUnitOptionResponseSingle: Story = {
  args: { questionnaire: qQuantityUnitOption, questionnaireResponse: qrQuantityUnitOptionResponse },
  play: async ({ canvasElement }) => {
    const singleUnitInput = await findByLinkId(canvasElement, 'duration-single-unit');
    const comparator = singleUnitInput.querySelector('div[data-test="comparator"] input');
    const days = singleUnitInput.querySelector('div[data-test="q-item-quantity-field"] input');

    expect(comparator?.getAttribute('value')).toBe('');
    expect(days?.getAttribute('value')).toBe('2');
  }
};

export const QuantityUnitOptionResponseMulti: Story = {
  args: { questionnaire: qQuantityUnitOption, questionnaireResponse: qrQuantityUnitOptionResponse },
  play: async ({ canvasElement }) => {
    const multiUnitInput = await findByLinkId(canvasElement, 'duration-multi-unit');
    const multiComparator = multiUnitInput.querySelector('div[data-test="comparator"] input');
    const multiValue = multiUnitInput.querySelector('div[data-test="q-item-quantity-field"] input');
    const multiTime = multiUnitInput.querySelector('input#quantity-duration-multi-unit-unit');

    expect(multiComparator?.getAttribute('value')).toBe('');
    expect(multiValue?.getAttribute('value')).toBe('48');
    expect(multiTime?.getAttribute('value')).toBe('Hour(s)');
  }
};

export const QuantityUnitOptionResponseMultiComparator: Story = {


  args: { questionnaire: qQuantityUnitOption, questionnaireResponse: qrQuantityUnitOptionResponse },
  play: async ({ canvasElement }) => {
    const multiUnitComparatorInput = await findByLinkId(canvasElement, 'duration-multi-unit-comparator');
    const multiUnitComparator = multiUnitComparatorInput.querySelector('div[data-test="comparator"] input');
    const multiUnitValue = multiUnitComparatorInput.querySelector('div[data-test="q-item-quantity-field"] input');
    const multiUnitTime = multiUnitComparatorInput.querySelector('input#quantity-duration-multi-unit-comparator-unit');

    expect(multiUnitComparator?.getAttribute('value')).toBe('>=');
    expect(multiUnitValue?.getAttribute('value')).toBe('48');
    expect(multiUnitTime?.getAttribute('value')).toBe('Hour(s)');
  }
};


export const QuantityCalculation: Story = {
  args: { questionnaire: qQuantityCalculation }
};