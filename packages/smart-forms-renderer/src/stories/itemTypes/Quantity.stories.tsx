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
  getQuantityTextValues,
  inputQuantity,
  questionnaireFactory,
  questionnaireResponseFactory,
  ucumSystem,
  unitExtFactory,
  unitOptionExtFactory
} from '../testUtils';
import { createStory } from '../storybookWrappers/createStory';
import { questionnaireResponseStore } from '../../stores';

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

/* Quantity Basic story */
const basicFirstTargetLinkId = 'body-weight';
const basicSecondTargetLinkId = 'body-weight-comparator';

const basicFirstTargetInput = 80;
const basicSecondTargetInput = 90;

const qQuantityBasic = questionnaireFactory([
  {
    linkId: basicFirstTargetLinkId,
    extension: [unitExtFactory('kg', 'kg')],
    type: 'quantity',
    text: 'Body Weight'
  },
  {
    linkId: basicSecondTargetLinkId,
    extension: [unitExtFactory('kg', 'kg')],
    type: 'quantity',
    text: 'Body Weight (with comparator symbol)'
  }
]);

const qrQuantityBasicResponse = questionnaireResponseFactory([
  {
    linkId: basicFirstTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: basicFirstTargetInput,
          unit: 'kg',
          system: ucumSystem,
          code: 'kg'
        }
      }
    ]
  },
  {
    linkId: basicSecondTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: basicSecondTargetInput,
          comparator: '<',
          unit: 'kg',
          system: ucumSystem,
          code: 'kg'
        }
      }
    ]
  }
]);

export const QuantityBasic: Story = createStory({
  args: {
    questionnaire: qQuantityBasic
  },
  play: async ({ canvasElement }) => {
    /* Input first item */
    await inputQuantity(canvasElement, basicFirstTargetLinkId, basicFirstTargetInput);

    await waitFor(async () => {
      const result = await getAnswers(basicFirstTargetLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: basicFirstTargetInput,
          comparator: undefined,
          unit: 'kg',
          code: 'kg',
          system: ucumSystem
        })
      );
    });

    /* Input second item (with comparator) */
    await inputQuantity(
      canvasElement,
      basicSecondTargetLinkId,
      basicSecondTargetInput,
      undefined,
      '<'
    );
    const updatableResponse = questionnaireResponseStore.getState().updatableResponse;
    console.log(updatableResponse);

    await waitFor(async () => {
      const result = await getAnswers(basicSecondTargetLinkId);
      expect(result).toHaveLength(1);
      console.log(result[0].valueQuantity);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: basicSecondTargetInput,
          comparator: '<',
          system: ucumSystem,
          unit: 'kg',
          code: 'kg'
        })
      );
    });
  }
}) as Story;

export const QuantityBasicResponse: Story = createStory({
  args: {
    questionnaire: qQuantityBasic,
    questionnaireResponse: qrQuantityBasicResponse
  },
  play: async ({ canvasElement }) => {
    /* Verify first item */
    const firstResult = await getQuantityTextValues(canvasElement, basicFirstTargetLinkId, false);
    expect(firstResult).toEqual(
      expect.objectContaining({
        value: basicFirstTargetInput.toString()
      })
    );

    /* Verify second item (with comparator) */
    const secondResult = await getQuantityTextValues(canvasElement, basicSecondTargetLinkId, false);

    expect(secondResult).toEqual(
      expect.objectContaining({
        value: basicSecondTargetInput.toString()
      })
    );
  }
}) as Story;

/* Quantity Unit Option (Multi) story */
const uoMultiFirstTargetLinkId = 'duration-multi-unit';
const uoMultiSecondTargetLinkId = 'duration-multi-unit-comparator';

const uoMultiTargetInput = 2;

const qQuantityUnitOptionMulti = questionnaireFactory([
  {
    linkId: uoMultiFirstTargetLinkId,
    type: 'quantity',
    extension: [
      unitOptionExtFactory('d', 'Day(s)'),
      unitOptionExtFactory('wk', 'Week(s)'),
      unitOptionExtFactory('mo', 'Month(s)')
    ],
    text: 'Duration'
  },
  {
    linkId: uoMultiSecondTargetLinkId,
    type: 'quantity',
    extension: [
      unitOptionExtFactory('d', 'Day(s)'),
      unitOptionExtFactory('wk', 'Week(s)'),
      unitOptionExtFactory('mo', 'Month(s)')
    ],
    text: 'Duration (with comparator)'
  }
]);

const qrQuantityUnitOptionMultiResponse = questionnaireResponseFactory([
  {
    linkId: uoMultiFirstTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: uoMultiTargetInput,
          unit: 'Week(s)',
          code: 'wk',
          system: ucumSystem
        }
      }
    ]
  },
  {
    linkId: uoMultiSecondTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: uoMultiTargetInput,
          comparator: '>=',
          unit: 'Week(s)',
          code: 'wk',
          system: ucumSystem
        }
      }
    ]
  }
]);

export const QuantityUnitOptionMulti: Story = createStory({
  args: {
    questionnaire: qQuantityUnitOptionMulti
  },
  play: async ({ canvasElement }) => {
    /* Input first item (multi unit) */
    await inputQuantity(canvasElement, uoMultiFirstTargetLinkId, uoMultiTargetInput, 'Week(s)');

    await waitFor(async () => {
      const result = await getAnswers(uoMultiFirstTargetLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: uoMultiTargetInput,
          comparator: undefined,
          unit: 'Week(s)',
          code: 'wk',
          system: ucumSystem
        })
      );
    });

    /* Input second item (multi unit with comparator) */
    await inputQuantity(
      canvasElement,
      uoMultiSecondTargetLinkId,
      uoMultiTargetInput,
      'Week(s)',
      '>='
    );

    await waitFor(async () => {
      const result = await getAnswers(uoMultiSecondTargetLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: uoMultiTargetInput,
          comparator: '>=',
          unit: 'Week(s)',
          code: 'wk',
          system: ucumSystem
        })
      );
    });
  }
}) as Story;

export const QuantityUnitOptionMultiResponse: Story = createStory({
  args: {
    questionnaire: qQuantityUnitOptionMulti,
    questionnaireResponse: qrQuantityUnitOptionMultiResponse
  },
  play: async ({ canvasElement }) => {
    /* Verify first item */
    const firstResult = await getQuantityTextValues(canvasElement, uoMultiFirstTargetLinkId, true);
    expect(firstResult).toEqual(
      expect.objectContaining({
        value: uoMultiTargetInput.toString(),
        unit: 'Week(s)',
        comparator: ''
      })
    );

    /* Verify second item (with comparator) */
    const secondResult = await getQuantityTextValues(
      canvasElement,
      uoMultiSecondTargetLinkId,
      true
    );
    expect(secondResult).toEqual(
      expect.objectContaining({
        value: uoMultiTargetInput.toString(),
        unit: 'Week(s)',
        comparator: '>='
      })
    );
  }
}) as Story;

/* Quantity Unit Option (Single) story */
const uoSingleFirstTargetLinkId = 'duration-single-unit';
const uoSingleSecondTargetLinkId = 'duration-single-unit-comparator';

const uoSingleFirstTargetInput = 10;
const uoSingleSecondTargetInput = 12;

const qQuantityUnitOptionSingle = questionnaireFactory([
  {
    linkId: uoSingleFirstTargetLinkId,
    type: 'quantity',
    extension: [unitExtFactory('d', 'Day(s)')],
    text: 'Duration (single unit)'
  },
  {
    linkId: uoSingleSecondTargetLinkId,
    type: 'quantity',
    extension: [unitExtFactory('d', 'Day(s)')],
    text: 'Duration (single unit with comparator)'
  }
]);

const qrQuantityUnitOptionSingleResponse = questionnaireResponseFactory([
  {
    linkId: uoSingleFirstTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: uoSingleFirstTargetInput,
          unit: 'Day(s)',
          code: 'd',
          system: ucumSystem
        }
      }
    ]
  },
  {
    linkId: uoSingleSecondTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: uoSingleSecondTargetInput,
          comparator: '<',
          unit: 'Day(s)',
          code: 'd',
          system: ucumSystem
        }
      }
    ]
  }
]);

export const QuantityUnitOptionSingle: Story = createStory({
  args: {
    questionnaire: qQuantityUnitOptionSingle
  },
  play: async ({ canvasElement }) => {
    /* Input first item (no comparator) */
    await inputQuantity(canvasElement, uoSingleFirstTargetLinkId, uoSingleFirstTargetInput);

    await waitFor(async () => {
      const result = await getAnswers(uoSingleFirstTargetLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: uoSingleFirstTargetInput,
          comparator: undefined,
          unit: 'Day(s)',
          code: 'd',
          system: ucumSystem
        })
      );
    });

    /* Input second item (with comparator) */
    await inputQuantity(
      canvasElement,
      uoSingleSecondTargetLinkId,
      uoSingleSecondTargetInput,
      undefined,
      '<'
    );

    await waitFor(async () => {
      const result = await getAnswers(uoSingleSecondTargetLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: uoSingleSecondTargetInput,
          comparator: '<',
          unit: 'Day(s)',
          code: 'd',
          system: ucumSystem
        })
      );
    });
  }
}) as Story;

export const QuantityUnitOptionSingleResponse: Story = createStory({
  args: {
    questionnaire: qQuantityUnitOptionSingle,
    questionnaireResponse: qrQuantityUnitOptionSingleResponse
  },
  play: async ({ canvasElement }) => {
    /* Verify first item (no comparator) */
    const firstResult = await getQuantityTextValues(
      canvasElement,
      uoSingleFirstTargetLinkId,
      false
    );
    expect(firstResult).toEqual(
      expect.objectContaining({
        value: uoSingleFirstTargetInput.toString(),
        comparator: ''
      })
    );

    /* Verify second item (with comparator) */
    const secondResult = await getQuantityTextValues(
      canvasElement,
      uoSingleSecondTargetLinkId,
      false
    );
    expect(secondResult).toEqual(
      expect.objectContaining({
        value: uoSingleSecondTargetInput.toString(),
        comparator: '<'
      })
    );
  }
}) as Story;
