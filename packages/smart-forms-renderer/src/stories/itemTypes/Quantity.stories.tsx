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
import { expect, waitFor } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  getAnswers,
  qrFactory,
  questionnaireFactory,
  ucumSystem,
  unitExtFactory,
  unitOptionExtFactory,
  inputQuantity,
  getQuantityTextValues
} from '../testUtils';

import type { Quantity } from 'fhir/r4';

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
const basicLinkId = 'body-weight';
const basicUnit = 'kg';
const basicCode = 'kg';
const qQuantityBasic = questionnaireFactory([
  {
    linkId: basicLinkId,
    extension: [unitExtFactory(basicUnit, basicCode)],
    type: 'quantity'
  }
]);
const basicTargetNumber = 10;

export const QuantityBasic: Story = {
  args: {
    questionnaire: qQuantityBasic
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, basicLinkId, basicTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(basicLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: basicTargetNumber,
          comparator: undefined,
          unit: basicUnit,
          code: basicCode,
          system: ucumSystem
        })
      );
    });
  }
};

const basicComparatorLinkId = 'body-weight-comparator';
const basicComparatorUnit = 'kg';
const basicComparatorCode = 'kg';
const qQuantityBasicComparator = questionnaireFactory([
  {
    linkId: basicComparatorLinkId,
    extension: [unitExtFactory(basicComparatorUnit, basicComparatorCode)],
    type: 'quantity'
  }
]);
const basicComparatorTargetNumber = 20;
const basicTargetComparator = '<' as const;

export const QuantityBasicComparator: Story = {
  args: {
    questionnaire: qQuantityBasicComparator
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(
      canvasElement,
      basicComparatorLinkId,
      basicComparatorTargetNumber,
      undefined,
      basicTargetComparator
    );

    await waitFor(async () => {
      const result = await getAnswers(basicComparatorLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: basicComparatorTargetNumber,
          comparator: basicTargetComparator,
          system: ucumSystem,
          unit: basicComparatorUnit,
          code: basicComparatorCode
        })
      );
    });
  }
};

const basicResTargetLinkId = 'body-weight';
const basicResTargetWeight = 80;

const qrQuantityBasicResponse = qrFactory([
  {
    linkId: basicResTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: basicResTargetWeight,
          system: ucumSystem
        }
      }
    ]
  }
]);

export const QuantityBasicResponse: Story = {
  args: {
    questionnaire: qQuantityBasic,
    questionnaireResponse: qrQuantityBasicResponse
  },
  play: async ({ canvasElement }) => {
    const result = await getQuantityTextValues(canvasElement, basicResTargetLinkId, false);

    expect(result).toEqual(
      expect.objectContaining({
        value: basicResTargetWeight.toString(),
        comparator: '',
        unit: undefined
      })
    );
  }
};

const basicResComparatorLinkId = 'body-weight-comparator';
const basicResComparatorTargetWeight = 100;
const basicResTargetComparator = '<' as const;

const qrQuantityBasicComparatorResponse = qrFactory([
  {
    linkId: basicResComparatorLinkId,
    answer: [
      {
        valueQuantity: {
          value: basicResComparatorTargetWeight,
          comparator: basicResTargetComparator,
          system: ucumSystem
        }
      }
    ]
  }
]);

export const QuantityBasicComparatorResponse: Story = {
  args: {
    questionnaire: qQuantityBasicComparator,
    questionnaireResponse: qrQuantityBasicComparatorResponse
  },
  play: async ({ canvasElement }) => {
    const resultComparator = await getQuantityTextValues(
      canvasElement,
      basicResComparatorLinkId,
      false
    );

    expect(resultComparator).toEqual(
      expect.objectContaining({
        value: basicResComparatorTargetWeight.toString(),
        comparator: basicResTargetComparator,
        unit: undefined
      })
    );
  }
};

const singleUnitLinkId = 'duration-single-unit';
const singleTargetNumber = 10;
const singleTargetUnit = 'Day(s)';
const qQuantitySingle = questionnaireFactory([
  {
    linkId: singleUnitLinkId,
    type: 'quantity',
    extension: [unitExtFactory('d', singleTargetUnit)]
  }
]);

export const QuantitySingleUnit: Story = {
  args: {
    questionnaire: qQuantitySingle
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, singleUnitLinkId, singleTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(singleUnitLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: singleTargetNumber,
          unit: singleTargetUnit,
          code: 'd',
          comparator: undefined,
          system: ucumSystem
        })
      );
    });
  }
};

const multiLinkId = 'duration-multi-unit';
const multiTargetNumber = 20;
const multiTargetUnit = 'Week(s)';

const qQuantityMulti = questionnaireFactory([
  {
    linkId: multiLinkId,
    type: 'quantity',
    extension: [unitOptionExtFactory('d', 'Day(s)'), unitOptionExtFactory('wk', multiTargetUnit)]
  }
]);

export const QuantityMultiUnit: Story = {
  args: {
    questionnaire: qQuantityMulti
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, multiLinkId, multiTargetNumber, multiTargetUnit);

    await waitFor(async () => {
      const result = await getAnswers(multiLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: multiTargetNumber,
          unit: multiTargetUnit,
          comparator: undefined,
          system: ucumSystem
        })
      );
    });
  }
};

const multiComparatorLinkId = 'duration-multi-unit-comparator';
const multiComparatorTargetNumber = 30;
const multiComparatorTargetUnit = 'Day(s)';
const multiComparatorTargetComparator = '>';

const qQuantityMultiComparator = questionnaireFactory([
  {
    linkId: multiComparatorLinkId,
    type: 'quantity',
    extension: [
      unitOptionExtFactory('d', multiComparatorTargetUnit),
      unitOptionExtFactory('wk', 'Week(s)')
    ]
  }
]);

export const QuantityMultiUnitComparator: Story = {
  args: {
    questionnaire: qQuantityMultiComparator
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(
      canvasElement,
      multiComparatorLinkId,
      multiComparatorTargetNumber,
      multiComparatorTargetUnit,
      multiComparatorTargetComparator
    );

    await waitFor(async () => {
      const result = await getAnswers(multiComparatorLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: multiComparatorTargetNumber,
          unit: multiComparatorTargetUnit,
          comparator: multiComparatorTargetComparator,
          system: ucumSystem
        })
      );
    });
  }
};
const unitsingleResLinkId = 'duration-single-unit';
const unitsingleQuantity: Quantity = {
  value: 2,
  unit: 'Day(s)',
  system: ucumSystem,
  code: 'd'
};
const qrQuantityUnitOptionSingleResponse = qrFactory([
  {
    linkId: unitsingleResLinkId,
    answer: [{ valueQuantity: unitsingleQuantity }]
  }
]);

export const QuantitySingleUnitOptionResponse: Story = {
  args: {
    questionnaire: qQuantitySingle,
    questionnaireResponse: qrQuantityUnitOptionSingleResponse
  },
  play: async ({ canvasElement }) => {
    const resultSingle = await getQuantityTextValues(canvasElement, unitsingleResLinkId, false);

    expect(resultSingle).toEqual(
      expect.objectContaining({
        value: unitsingleQuantity?.value?.toString(),
        unit: undefined,
        comparator: ''
      })
    );
  }
};

const unitmultiResLinkId = 'duration-multi-unit';
const unitmultiResQuantity: Quantity = {
  value: 48,
  unit: 'Hour(s)',
  system: ucumSystem,
  code: 'hour'
};
const qrQuantityUnitOptionMultiResponse = qrFactory([
  {
    linkId: unitmultiResLinkId,
    answer: [{ valueQuantity: unitmultiResQuantity }]
  }
]);

export const QuantityMultiUnitOptionResponse: Story = {
  args: {
    questionnaire: qQuantityMulti,
    questionnaireResponse: qrQuantityUnitOptionMultiResponse
  },
  play: async ({ canvasElement }) => {
    const resultMulti = await getQuantityTextValues(canvasElement, unitmultiResLinkId, true);
    expect(resultMulti).toEqual(
      expect.objectContaining({
        value: unitmultiResQuantity?.value?.toString(),
        unit: unitmultiResQuantity.unit,
        comparator: ''
      })
    );
  }
};

const unitmultiComparatorResLinkId = 'duration-multi-unit-comparator';
const unitMultiComparatorQuantity: Quantity = {
  value: 48,
  comparator: '>=',
  unit: 'Hour(s)',
  system: ucumSystem,
  code: 'hour'
};

const qrQuantityUnitOptionMultiComparatorResponse = qrFactory([
  {
    linkId: unitmultiComparatorResLinkId,
    answer: [{ valueQuantity: unitMultiComparatorQuantity }]
  }
]);

export const QuantityMultiUnitOptionComparatorResponse: Story = {
  args: {
    questionnaire: qQuantityMultiComparator,
    questionnaireResponse: qrQuantityUnitOptionMultiComparatorResponse
  },
  play: async ({ canvasElement }) => {
    const resultMultiComparator = await getQuantityTextValues(
      canvasElement,
      unitmultiComparatorResLinkId,
      true
    );
    expect(resultMultiComparator).toEqual(
      expect.objectContaining({
        value: unitMultiComparatorQuantity.value?.toString(),
        unit: unitMultiComparatorQuantity.unit,
        comparator: unitMultiComparatorQuantity.comparator
      })
    );
  }
};
