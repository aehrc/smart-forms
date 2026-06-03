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
import { expect } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qChainedCalculation,
  qInitialExpression,
  qLaunchContext,
  qOldCvdRiskCalculator,
  qVariable
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import { getAnswers, inputInteger } from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/10.1.3 Behavior > Calculations',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const LaunchContext: Story = createStory({
  args: {
    questionnaire: qLaunchContext
  }
}) as Story;

export const Variable: Story = createStory({
  args: {
    questionnaire: qVariable
  }
}) as Story;

export const InitialExpression: Story = createStory({
  args: {
    questionnaire: qInitialExpression
  }
}) as Story;

export const OldCvdRiskCalculator: Story = createStory({
  args: {
    questionnaire: qOldCvdRiskCalculator
  }
}) as Story;

export const ChainedCalculation: Story = createStory({
  args: {
    questionnaire: qChainedCalculation
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, 'number-input', 2);

    const numberInputAnswers = await getAnswers('number-input');
    const calcResultAnswers = await getAnswers('calc-result');
    const resultIs4Answers = await getAnswers('result-is-4');

    expect(numberInputAnswers).toEqual([expect.objectContaining({ valueInteger: 2 })]);
    expect(calcResultAnswers).toEqual([expect.objectContaining({ valueDecimal: 4 })]);
    expect(resultIs4Answers).toEqual([expect.objectContaining({ valueBoolean: true })]);
  }
}) as Story;
